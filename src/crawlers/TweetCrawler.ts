/**
 * Crawler para tweets individuales
 */
import type { Page } from "@playwright/test";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { CrawlConfig, getTimeoutLimits } from "../config/CrawlConfig";
import { TWITTER_SEARCH_ADVANCED_URL } from "../constants";
import { convertTweetDateToMexicanTime } from "../utils/dateUtils";
import { detectTokenError, detectTokenErrorInMessage, getAllEndOfContentPatterns } from "../utils/errorDetection";
import { generateTweetHash } from "../utils/hashUtils";
import { scrollDown, scrollUp } from "../utils/scrollUtils";
import { CrawlTweetsOptions } from "../types/Config";
import { TweetHash } from "../types/Tweet";

chromium.use(stealth());

export class TweetCrawler {
  private authToken: string;
  private authTokensPool: string[];
  private config: CrawlConfig;
  private onLog?: (message: string) => void;
  private onProgress?: (progress: { collectedTweets: number }) => void;

  constructor(
    authToken: string,
    authTokensPool: string[],
    config: CrawlConfig,
    onLog?: (message: string) => void,
    onProgress?: (progress: { collectedTweets: number }) => void
  ) {
    this.authToken = authToken;
    this.authTokensPool = authTokensPool.length > 0 ? [...authTokensPool] : [authToken];
    if (!this.authTokensPool.includes(authToken)) {
      this.authTokensPool.unshift(authToken);
    }
    this.config = config;
    this.onLog = onLog;
    this.onProgress = onProgress;
  }

  private log(message: string): void {
    if (this.onLog) {
      this.onLog(message);
    } else {
      console.log(message);
    }
  }

  private cleanTweetText(text: string, isDetailMode: boolean, userMentions?: any[], quotedText?: string): string {
    // Limpiar caracteres especiales y espacios
    let cleanText = text
      .replace(/[\n,"""''•—–…⁦⁩]/g, ' ')
      .replace(/\s\s+/g, ' ');

    // Limpiar emojis
    const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    cleanText = cleanText.replace(emojiPattern, '');

    // Remover menciones en modo detalle
    if (isDetailMode && userMentions && userMentions.length > 0) {
      const firstWord = cleanText.split(" ")[0];
      const replyToUsername = userMentions[0].screen_name;
      if (firstWord[1] === "@") {
        cleanText = cleanText.replace(`@${replyToUsername} `, "");
      }
    }

    // Agregar texto de referencia si existe
    if (quotedText) {
      let cleanQuotedText = quotedText
        .replace(/[\n,"""''•—–…⁦⁩]/g, ' ')
        .replace(/\s\s+/g, ' ')
        .replace(emojiPattern, '')
        .trim();
      
      if (cleanQuotedText) {
        cleanText += ` TEXTO DE REFERENCIA: ${cleanQuotedText}`;
      }
    }

    return cleanText.trim();
  }

  private async checkEndOfContent(
    page: Page,
    collectedTweets: TweetHash[],
    lastTweetCount: number,
    scrollsWithoutNewTweets: number,
    lastPageHeight: number,
    sameHeightCount: number,
    consecutiveTimeouts: number,
    searchFromDate?: string
  ): Promise<boolean> {
    const MAX_SCROLLS_WITHOUT_TWEETS = 8;
    const MAX_SAME_HEIGHT_COUNT = 10;

    // 1. Check end of timeline elements
    const endOfContentSelectors = getAllEndOfContentPatterns();
    
    for (const selector of endOfContentSelectors) {
      const count = await page.getByText(selector).count();
      if (count > 0) {
        this.log(`End of content detected by message: "${selector}"`);
        return true;
      }
    }
    
    // 2. Check for recent duplicate tweets
    if (collectedTweets.length >= 10) {
      const lastTweetIds = collectedTweets.slice(-10).map(t => t.id_str);
      
      const currentTweetIds = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        const ids: string[] = [];
        
        tweetElements.forEach((element: Element) => {
          const tweetLinks = element.querySelectorAll('a[href*="/status/"]');
          tweetLinks.forEach((link: Element) => {
            const href = link.getAttribute('href');
            if (href) {
              const match = href.match(/\/status\/(\d+)/);
              if (match && match[1]) {
                ids.push(match[1]);
              }
            }
          });
        });
        
        return [...new Set(ids)];
      });
      
      const newTweetsFound = currentTweetIds.filter(id => !lastTweetIds.includes(id));
      
      if (newTweetsFound.length === 0 && currentTweetIds.length > 0) {
        this.log(`End detected: all visible tweets (${currentTweetIds.length}) were already collected`);
        return true;
      }
    }
    
    // 3. Check date of older tweets
    if (searchFromDate && collectedTweets.length >= 5) {
      const lastTweet = collectedTweets[collectedTweets.length - 1];
      const lastTweetDate = new Date(lastTweet.created_at);
      const searchFromDateObj = new Date(searchFromDate);
      
      if (lastTweetDate < searchFromDateObj) {
        this.log(`End detected: reached tweets before start date (${searchFromDate})`);
        return true;
      }
    }
    
    // 4. Check scrolls without new tweets
    if (collectedTweets.length === lastTweetCount) {
      if (scrollsWithoutNewTweets >= MAX_SCROLLS_WITHOUT_TWEETS) {
        this.log(`End detected: ${MAX_SCROLLS_WITHOUT_TWEETS} consecutive scrolls without new tweets`);
        return true;
      }
    }
    
    // 5. Check page height ONLY if we already have multiple negative indicators
    if (scrollsWithoutNewTweets >= 3 && consecutiveTimeouts >= 2) {
      const currentHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
      if (currentHeight === lastPageHeight) {
        if (sameHeightCount >= MAX_SAME_HEIGHT_COUNT) {
          this.log(`End detected as last resort: height unchanged after ${MAX_SAME_HEIGHT_COUNT} attempts`);
          return true;
        }
      }
    }
    
    return false;
  }

  async crawl(options: CrawlTweetsOptions): Promise<TweetHash[]> {
    const {
      searchKeywords,
      searchFromDate,
      searchToDate,
      targetCount = 10,
      delayEachTweetSeconds,
      delayEvery100TweetsSeconds,
      tweetThreadUrl,
      searchTab = "LATEST",
      searchUsernames = [],
      configType
    } = options;

    this.onLog = options.onLog;
    this.onProgress = options.onProgress;

    const IS_SEARCH_MODE = Boolean(searchKeywords || searchUsernames.length > 0);
    const IS_DETAIL_MODE = Boolean(tweetThreadUrl);
    const IS_UNLIMITED_SEARCH = targetCount === -1;

    if (!IS_SEARCH_MODE && !IS_DETAIL_MODE) {
      throw new Error("Please provide either searchKeywords, searchUsernames or tweetThreadUrl");
    }

    // Modificar keywords para incluir usernames si es necesario
    let MODIFIED_SEARCH_KEYWORDS = searchKeywords || "";
    if (searchUsernames.length > 0) {
      const usernameQueries = searchUsernames.map(username => `from:${username}`).join(" OR ");
      MODIFIED_SEARCH_KEYWORDS = MODIFIED_SEARCH_KEYWORDS ? 
        `(${MODIFIED_SEARCH_KEYWORDS}) (${usernameQueries})` : 
        usernameQueries;
    }
    
    // Add filter to exclude replies
    MODIFIED_SEARCH_KEYWORDS = MODIFIED_SEARCH_KEYWORDS ? 
      `${MODIFIED_SEARCH_KEYWORDS} -filter:replies` : 
      "-filter:replies";

    const timeoutLimits = getTimeoutLimits(this.config, IS_UNLIMITED_SEARCH);
    const DELAY_EACH_TWEET_SECONDS_FINAL = delayEachTweetSeconds ?? this.config.DELAY_EACH_TWEET_SECONDS;
    const DELAY_EVERY_100_TWEETS_SECONDS_FINAL = delayEvery100TweetsSeconds ?? this.config.DELAY_EVERY_100_TWEETS_SECONDS;

    const browser = await chromium.launch({
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
    });

    const page = await context.newPage();

    try {
      // Configure cookies for authentication
      await page.context().addCookies([
        {
          name: "auth_token",
          value: this.authToken,
          domain: ".x.com",
          path: "/"
        }
      ]);

      // Go to search page
      await page.goto(IS_DETAIL_MODE ? tweetThreadUrl! : TWITTER_SEARCH_ADVANCED_URL[searchTab]);

      // Verify login
      const isLoggedIn = !page.url().includes("/login");
      if (!isLoggedIn) {
        throw new Error("Invalid twitter auth token. Please check your auth token");
      }

      // Realizar el crawling
      const tweets = await this.scrollAndCollectTweets(page, {
        TARGET_TWEET_COUNT: targetCount,
        TIMEOUT_LIMIT: timeoutLimits.TIMEOUT_LIMIT,
        REACH_TIMEOUT_MAX: timeoutLimits.REACH_TIMEOUT_MAX,
        MAX_EXECUTION_TIME: timeoutLimits.MAX_EXECUTION_TIME,
        startTime: Date.now(),
        IS_SEARCH_MODE,
        IS_DETAIL_MODE,
        DELAY_EACH_TWEET_SECONDS: DELAY_EACH_TWEET_SECONDS_FINAL,
        DELAY_EVERY_100_TWEETS_SECONDS: DELAY_EVERY_100_TWEETS_SECONDS_FINAL,
        SEARCH_FROM_DATE: searchFromDate,
        SEARCH_TO_DATE: searchToDate,
        SEARCH_KEYWORDS: searchKeywords,
        MODIFIED_SEARCH_KEYWORDS,
        SEARCH_TAB: searchTab
      });

      return tweets;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Error during crawling: ${errorMessage}`);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async scrollAndCollectTweets(
    page: Page,
    options: {
      TARGET_TWEET_COUNT: number;
      TIMEOUT_LIMIT: number;
      REACH_TIMEOUT_MAX: number;
      MAX_EXECUTION_TIME: number;
      startTime: number;
      IS_SEARCH_MODE: boolean;
      IS_DETAIL_MODE: boolean;
      DELAY_EACH_TWEET_SECONDS: number;
      DELAY_EVERY_100_TWEETS_SECONDS: number;
      SEARCH_FROM_DATE?: string;
      SEARCH_TO_DATE?: string;
      SEARCH_KEYWORDS?: string;
      MODIFIED_SEARCH_KEYWORDS?: string;
      SEARCH_TAB?: "LATEST" | "TOP";
    }
  ): Promise<TweetHash[]> {
    const {
      TARGET_TWEET_COUNT,
      TIMEOUT_LIMIT,
      REACH_TIMEOUT_MAX,
      MAX_EXECUTION_TIME,
      startTime,
      IS_SEARCH_MODE,
      IS_DETAIL_MODE,
      DELAY_EACH_TWEET_SECONDS,
      DELAY_EVERY_100_TWEETS_SECONDS,
      SEARCH_FROM_DATE,
      MODIFIED_SEARCH_KEYWORDS,
      SEARCH_TAB
    } = options;

    let timeoutCount = 0;
    let reachTimeout = 0;
    let additionalTweetsCount = 0;
    let rateLimitRetries = 0;
    const collectedTweets: TweetHash[] = [];
    
    let lastPageHeight = 0;
    let sameHeightCount = 0;
    let scrollsWithoutNewTweets = 0;
    let lastTweetCount = 0;
    let consecutiveTimeouts = 0;
    
    let currentTokenIndex = 0;
    let tweetsWithCurrentToken = 0;
    const TOKEN_ROTATION_THRESHOLD = this.config.TOKEN_ROTATION_THRESHOLD;

    const blacklistedTokens = new Map<number, number>();
    const TOKEN_BLACKLIST_DURATION = 60000;

    const blacklistToken = (tokenIndex: number, reason: string) => {
      const recoveryTime = Date.now() + TOKEN_BLACKLIST_DURATION;
      blacklistedTokens.set(tokenIndex, recoveryTime);
      this.log(`Token ${tokenIndex + 1}/${this.authTokensPool.length} marked as problematic: ${reason}`);
    };

    const cleanupBlacklist = () => {
      const now = Date.now();
      for (const [tokenIndex, recoveryTime] of blacklistedTokens.entries()) {
        if (now >= recoveryTime) {
          blacklistedTokens.delete(tokenIndex);
        }
      }
    };

    const getNextAvailableToken = (): { index: number; waitTime: number } | null => {
      cleanupBlacklist();
      
      if (this.authTokensPool.length > 0 && blacklistedTokens.size >= this.authTokensPool.length) {
        const earliestRecovery = Math.min(...Array.from(blacklistedTokens.values()));
        const waitTime = Math.max(0, earliestRecovery - Date.now());
        return { index: -1, waitTime };
      }

      for (let i = 0; i < this.authTokensPool.length; i++) {
        const tokenIndex = (currentTokenIndex + i + 1) % this.authTokensPool.length;
        if (!blacklistedTokens.has(tokenIndex)) {
          return { index: tokenIndex, waitTime: 0 };
        }
      }

      return null;
    };

    const rotateAuthToken = async (reason: string = "scheduled rotation"): Promise<boolean> => {
      if (this.authTokensPool.length <= 1) {
        return false;
      }
      
      const nextToken = getNextAvailableToken();
      
      if (!nextToken || nextToken.index === -1) {
        if (nextToken) {
          const waitMinutes = Math.ceil(nextToken.waitTime / 60000);
          this.log(`Waiting ${waitMinutes}min - all tokens are marked`);
          await page.waitForTimeout(nextToken.waitTime + 5000);
          return await rotateAuthToken(reason);
        }
        return false;
      }
      
      const previousIndex = currentTokenIndex;
      currentTokenIndex = nextToken.index;
      const newToken = this.authTokensPool[currentTokenIndex];
      
      this.log(`Rotating token: ${previousIndex + 1} → ${currentTokenIndex + 1} (${reason})`);
      
      try {
        await page.context().addCookies([
          {
            name: "auth_token",
            value: newToken,
            domain: ".x.com",
            path: "/"
          }
        ]);
        
        await page.waitForTimeout(this.config.SCROLL.TOKEN_ROTATION_DELAY);
        tweetsWithCurrentToken = 0;
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        blacklistToken(currentTokenIndex, `Rotation error: ${errorMessage}`);
        return false;
      }
    };

    // Perform search using search box if we're in search mode
    if (IS_SEARCH_MODE && MODIFIED_SEARCH_KEYWORDS) {
      this.log("=== STARTING SEARCH WITH SEARCH BOX ===");
      
      const parseDateString = (dateString: string): string => {
        if (!dateString) return "";
        const cleanDate = dateString.trim().split(" ")[0];
        
        if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return cleanDate;
        } else if (cleanDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = cleanDate.split("-");
          return `${year}-${month}-${day}`;
        }
        return cleanDate;
      };

      let searchQuery = MODIFIED_SEARCH_KEYWORDS;

      if (SEARCH_FROM_DATE) {
        const formattedFromDate = parseDateString(SEARCH_FROM_DATE);
        searchQuery += ` since:${formattedFromDate}`;
      }

      if (options.SEARCH_TO_DATE) {
        const formattedToDate = parseDateString(options.SEARCH_TO_DATE);
        searchQuery += ` until:${formattedToDate}`;
      }

      const humanTypeText = async (element: any, text: string) => {
        await element.click();
        await page.waitForTimeout(500 + Math.random() * 1000);
        await element.fill('');
        await page.waitForTimeout(200 + Math.random() * 300);
        
        for (let i = 0; i < text.length; i++) {
          await element.type(text[i]);
          const delay = 50 + Math.random() * 150;
          await page.waitForTimeout(delay);
          
          if (Math.random() < 0.1) {
            await page.waitForTimeout(200 + Math.random() * 500);
          }
        }
        
        await page.waitForTimeout(500 + Math.random() * 1000);
      };

      try {
        const searchBox = await page.waitForSelector('[data-testid="SearchBox_Search_Input"]', {
          state: "visible",
          timeout: 10000
        });
        
        await humanTypeText(searchBox, searchQuery);
        await searchBox.press('Enter');
        
        await page.waitForSelector('[data-testid="primaryColumn"]', {
          state: "visible",
          timeout: 15000
        });
        
        if (SEARCH_TAB === "LATEST") {
          try {
            const latestButton = await page.waitForSelector('[data-testid="SearchTab_Latest"]', {
              state: "visible",
              timeout: 5000
            });
            
            if (latestButton) {
              await latestButton.click();
              await page.waitForTimeout(2000);
            }
          } catch (error) {
            // Continue without changing tab
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.log(`Error in search: ${errorMessage}`);
        blacklistToken(currentTokenIndex, "Search box failure");
        
        if (this.authTokensPool.length > 1) {
          const rotationSuccess = await rotateAuthToken("problematic token detected");
          if (rotationSuccess) {
            await page.reload();
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    // Main collection loop
    while (
      (TARGET_TWEET_COUNT === -1 || collectedTweets.length < TARGET_TWEET_COUNT) &&
      (timeoutCount < TIMEOUT_LIMIT || reachTimeout < REACH_TIMEOUT_MAX) &&
      (Date.now() - startTime < MAX_EXECUTION_TIME)
    ) {
      if (timeoutCount > TIMEOUT_LIMIT && reachTimeout < REACH_TIMEOUT_MAX) {
        reachTimeout++;
        timeoutCount = 0;
        await scrollUp(page);
        await page.waitForTimeout(this.config.SCROLL.STABILIZATION_DELAY / 2);
        await scrollDown(page);
      }

      const response = await Promise.race([
        page.waitForResponse(
          (response) => {
            const url = response.url();
            return url.includes("SearchTimeline") || 
                   url.includes("TweetDetail") || 
                   url.includes("SearchAdaptive") ||
                   url.includes("UserTweets");
          }
        ),
        page.waitForTimeout(this.config.SCROLL.WAIT_FOR_RESPONSE_TIMEOUT)
      ]);

      if (response) {
        timeoutCount = 0;
        consecutiveTimeouts = 0;
        
        try {
          const responseText = await response.text();
          const errorDetection = detectTokenError(responseText);
          
          if (errorDetection.hasError) {
            rateLimitRetries++;
            blacklistToken(currentTokenIndex, errorDetection.reason);
            
            if (this.authTokensPool.length > 1) {
              const rotationSuccess = await rotateAuthToken(errorDetection.reason);
              if (rotationSuccess) {
                rateLimitRetries = 0;
                continue;
              }
            }
            
            const tiempoTranscurrido = Date.now() - startTime;
            if (tiempoTranscurrido > this.config.RATE_LIMIT.RECOVERY_TIMEOUT) {
              this.log(`Maximum retry time reached. Returning ${collectedTweets.length} tweets.`);
              break;
            }
            
            if (rateLimitRetries > this.config.RATE_LIMIT.MAX_RETRIES) {
              const baseWaitTime = this.config.RATE_LIMIT.BASE_WAIT_TIME;
              this.log(`Waiting ${baseWaitTime/1000}s for cooldown...`);
              await page.waitForTimeout(baseWaitTime);
              await page.reload();
              await page.waitForTimeout(this.config.SCROLL.STABILIZATION_DELAY);
              rateLimitRetries = 0;
              timeoutCount = 0;
              continue;
            }
            
            const waitTime = Math.min(
              this.config.RATE_LIMIT.BASE_WAIT_TIME * Math.pow(2, rateLimitRetries), 
              this.config.RATE_LIMIT.MAX_WAIT_TIME
            );
            this.log(`Rate limit reached, waiting ${waitTime/1000}s...`);
            await page.waitForTimeout(waitTime);
            continue;
          }

          rateLimitRetries = 0;
          const responseJson = JSON.parse(responseText);
          
          let tweets = null;
          
          if (IS_DETAIL_MODE) {
            tweets = responseJson.data?.threaded_conversation_with_injections_v2?.instructions[0]?.entries;
          } else {
            tweets = responseJson.data?.search_by_raw_query?.search_timeline?.timeline?.instructions?.[0]?.entries;
            
            if (!tweets && responseJson.data?.search_by_raw_query?.search_timeline?.timeline?.instructions) {
              for (const instruction of responseJson.data.search_by_raw_query.search_timeline.timeline.instructions) {
                if (instruction.entries && instruction.entries.length > 0) {
                  tweets = instruction.entries;
                  break;
                }
              }
            }
            
            if (!tweets && responseJson.data?.user?.result?.timeline_v2?.timeline?.instructions) {
              for (const instruction of responseJson.data.user.result.timeline_v2.timeline.instructions) {
                if (instruction.entries && instruction.entries.length > 0) {
                  tweets = instruction.entries;
                  break;
                }
              }
            }
          }

          if (!tweets || !tweets.length) {
            const isEndOfContent = await this.checkEndOfContent(
              page,
              collectedTweets,
              lastTweetCount,
              scrollsWithoutNewTweets,
              lastPageHeight,
              sameHeightCount,
              consecutiveTimeouts,
              SEARCH_FROM_DATE
            );
            
            if (isEndOfContent) {
              this.log(`End of content confirmed. Total tweets collected: ${collectedTweets.length}`);
              break;
            }
            
            if (timeoutCount > 2) {
              for (let recovery = 0; recovery < 2; recovery++) {
                await scrollUp(page);
                await page.waitForTimeout(this.config.SCROLL.STABILIZATION_DELAY / 2);
                await scrollDown(page);
                await page.waitForTimeout(this.config.SCROLL.STABILIZATION_DELAY / 2);
              }
            }
            
            continue;
          }

          const processedTweets = await Promise.all(tweets
            .filter((entry: any) => {
              const isPromoted = entry.entryId.includes("promoted");
              if (isPromoted) return false;

              const entryType = entry.content?.entryType || entry.content?.__typename;
              if (entryType === "TimelineTimelineCursor" || 
                  entryType === "TimelineTimelineModule" ||
                  entryType === "TimelineTimelineItem" && !entry.content?.itemContent?.tweet_results) {
                return false;
              }

              const hasTweetContent = IS_SEARCH_MODE 
                ? entry.content?.itemContent?.tweet_results?.result
                : entry.content?.items?.[0]?.item?.itemContent?.tweet_results?.result;
              
              return !!hasTweetContent;
            })
            .map(async (tweet: any) => {
              const result = IS_SEARCH_MODE
                ? tweet.content?.itemContent?.tweet_results?.result
                : tweet.content?.items?.[0]?.item?.itemContent?.tweet_results?.result;

              if (!result?.tweet?.core?.user_results && !result?.core?.user_results) {
                return null;
              }

              const tweetContent = result.legacy || result.tweet?.legacy;
              const userContent = result.core?.user_results?.result?.legacy || result.tweet?.core?.user_results?.result?.legacy;
              const userData = result.core?.user_results?.result || result.tweet?.core?.user_results?.result;

              if (!tweetContent || !userContent || !userData) {
                return null;
              }

              const username = userData.core?.screen_name;
              if (!username) {
                return null;
              }

              let photoUser: string | undefined;
              try {
                const avatarUrl = userData.avatar?.image_url || 
                                 userData.legacy?.profile_image_url_https ||
                                 result.core?.user_results?.result?.avatar?.image_url ||
                                 result.tweet?.core?.user_results?.result?.avatar?.image_url;
                if (avatarUrl) {
                  photoUser = avatarUrl;
                }
              } catch (error) {
                // Continue without photo
              }

              let quotedText: string | undefined;
              try {
                const quotedStatus = result.quoted_status_result?.result?.legacy?.full_text || 
                                   result.tweet?.quoted_status_result?.result?.legacy?.full_text;
                if (quotedStatus) {
                  quotedText = quotedStatus;
                }
              } catch (error) {
                // Continue without quoted text
              }
              
              const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
              
              return {
                full_text: this.cleanTweetText(tweetContent.full_text, IS_DETAIL_MODE, tweetContent.entities?.user_mentions, quotedText),
                username: username,
                tweet_url: `https://x.com/${cleanUsername}/status/${tweetContent.id_str}`,
                image_url: tweetContent.entities?.media?.[0]?.media_url_https || "",
                location: userContent.location || "", 
                in_reply_to_screen_name: tweetContent.in_reply_to_screen_name || "",
                views: (result.views?.count || result.tweet?.views?.count || "0").toString(),
                created_at: tweetContent.created_at,
                id_str: tweetContent.id_str,
                quote_count: tweetContent.quote_count,
                reply_count: tweetContent.reply_count,
                retweet_count: tweetContent.retweet_count,
                favorite_count: tweetContent.favorite_count,
                lang: tweetContent.lang,
                user_id_str: tweetContent.user_id_str,
                conversation_id_str: tweetContent.conversation_id_str,
                has_quoted_text: !!quotedText,
                photo_user: photoUser || ""
              };
            })
          );

          const validTweets = processedTweets.filter((tweet): tweet is TweetHash => tweet !== null);
          collectedTweets.push(...validTweets);
          tweetsWithCurrentToken += validTweets.length;
          
          this.log(`Total tweets collected: ${collectedTweets.length}`);
          if (this.onProgress) {
            this.onProgress({ collectedTweets: collectedTweets.length });
          }
          
          if (tweetsWithCurrentToken >= TOKEN_ROTATION_THRESHOLD && this.authTokensPool.length > 1) {
            await rotateAuthToken("scheduled rotation");
            await page.waitForTimeout(this.config.SCROLL.STABILIZATION_DELAY);
          }

          additionalTweetsCount += processedTweets.length;
          if (additionalTweetsCount > 100) {
            additionalTweetsCount = 0;
            if (DELAY_EVERY_100_TWEETS_SECONDS) {
              await page.waitForTimeout(DELAY_EVERY_100_TWEETS_SECONDS * 1000);
            }
          } else if (additionalTweetsCount > 20) {
            await page.waitForTimeout(DELAY_EACH_TWEET_SECONDS * 1000);
          }

          // Actualizar contadores para checkEndOfContent
          if (collectedTweets.length === lastTweetCount) {
            scrollsWithoutNewTweets++;
          } else {
            scrollsWithoutNewTweets = 0;
            lastTweetCount = collectedTweets.length;
          }

          const currentHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
          if (currentHeight === lastPageHeight) {
            sameHeightCount++;
          } else {
            lastPageHeight = currentHeight;
            sameHeightCount = 0;
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (!detectTokenErrorInMessage(errorMessage)) {
            this.log(`Error not related to rate limit, stopping: ${errorMessage}`);
            break;
          }
        }
      } else {
        timeoutCount++;
        consecutiveTimeouts++;
        
        if (timeoutCount >= 5) {
          const isEndOfContent = await this.checkEndOfContent(
            page,
            collectedTweets,
            lastTweetCount,
            scrollsWithoutNewTweets,
            lastPageHeight,
            sameHeightCount,
            consecutiveTimeouts,
            SEARCH_FROM_DATE
          );
          if (isEndOfContent) {
            break;
          }
        }
      }

      await scrollDown(page);
      
      if (timeoutCount > 0) {
        const isEndOfContent = await this.checkEndOfContent(
          page,
          collectedTweets,
          lastTweetCount,
          scrollsWithoutNewTweets,
          lastPageHeight,
          sameHeightCount,
          consecutiveTimeouts,
          SEARCH_FROM_DATE
        );
        if (isEndOfContent) {
          break;
        }
      }
    }

    this.log(`Collection loop finished. Tweets collected: ${collectedTweets.length}`);
    return collectedTweets;
  }
}

