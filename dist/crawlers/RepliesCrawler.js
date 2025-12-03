"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepliesCrawler = void 0;
const playwright_extra_1 = require("playwright-extra");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const dateUtils_1 = require("../utils/dateUtils");
const hashUtils_1 = require("../utils/hashUtils");
const scrollUtils_1 = require("../utils/scrollUtils");
playwright_extra_1.chromium.use((0, puppeteer_extra_plugin_stealth_1.default)());
class RepliesCrawler {
    constructor(authToken, onLog) {
        this.authToken = authToken;
        this.onLog = onLog;
    }
    log(message) {
        if (this.onLog) {
            this.onLog(message);
        }
        else {
            console.log(message);
        }
    }
    async clickShowSpamButton(page) {
        try {
            const spamButtonSelectors = [
                'div[role="button"]:has-text("Show")',
                'div[role="button"]:has-text("Mostrar")',
                'span:has-text("Show probable spam")',
                'span:has-text("Mostrar posible spam")',
                '[data-testid="showMoreReplies"]'
            ];
            for (const selector of spamButtonSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        this.log('Show spam button detected, clicking...');
                        await button.click();
                        await page.waitForTimeout(1000);
                        return true;
                    }
                }
                catch (e) {
                    // Continue with next selector
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async extractRepliesFromPage(page, parentTweetUrl) {
        const replies = await page.evaluate((parentUrl) => {
            const extractedReplies = [];
            const parentIdMatch = parentUrl.match(/status\/(\d+)/);
            const parentTweetId = parentIdMatch ? parentIdMatch[1] : '';
            const articles = document.querySelectorAll('article[data-testid="tweet"]');
            articles.forEach((article) => {
                try {
                    const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
                    const fullText = tweetTextElement?.textContent || '';
                    const userLink = article.querySelector('a[role="link"][href*="/"]');
                    const username = userLink?.getAttribute('href')?.replace('/', '') || '';
                    const timeElement = article.querySelector('time');
                    const tweetLink = timeElement?.parentElement;
                    const tweetUrl = tweetLink?.href || '';
                    const idMatch = tweetUrl.match(/status\/(\d+)/);
                    const idStr = idMatch ? idMatch[1] : '';
                    if (idStr === parentTweetId) {
                        return; // Skip parent tweet
                    }
                    const createdAt = timeElement?.getAttribute('datetime') || '';
                    const replyButton = article.querySelector('[data-testid="reply"]');
                    const replyCount = replyButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                    const retweetButton = article.querySelector('[data-testid="retweet"]');
                    const retweetCount = retweetButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                    const likeButton = article.querySelector('[data-testid="like"]');
                    const favoriteCount = likeButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                    const viewsElement = article.querySelector('[href*="/analytics"]');
                    const views = viewsElement?.getAttribute('aria-label')?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0';
                    const avatarImg = article.querySelector('img[alt*="' + username + '"]');
                    const photoUser = avatarImg?.getAttribute('src') || '';
                    const tweetImage = article.querySelector('[data-testid="tweetPhoto"] img');
                    const imageUrl = tweetImage?.getAttribute('src') || '';
                    const replyingToElement = article.querySelector('[data-testid="tweetText"]')?.closest('div')?.previousElementSibling;
                    const inReplyToScreenName = replyingToElement?.textContent?.includes('Replying to')
                        ? replyingToElement?.querySelector('a')?.textContent?.replace('@', '') || ''
                        : '';
                    if (username && fullText && idStr) {
                        extractedReplies.push({
                            username,
                            full_text: fullText,
                            tweet_url: tweetUrl,
                            created_at: createdAt,
                            id_str: idStr,
                            reply_count: parseInt(replyCount) || 0,
                            retweet_count: parseInt(retweetCount) || 0,
                            favorite_count: parseInt(favoriteCount) || 0,
                            views: views,
                            photo_user: photoUser,
                            image_url: imageUrl,
                            in_reply_to_screen_name: inReplyToScreenName,
                            quote_count: 0,
                            lang: 'es',
                            user_id_str: '',
                            conversation_id_str: idStr,
                            location: '',
                            has_quoted_text: false
                        });
                    }
                }
                catch (error) {
                    console.error('Error extrayendo reply:', error);
                }
            });
            return extractedReplies;
        }, parentTweetUrl);
        return replies;
    }
    async extractTweetFromPage(page, tweetUrl) {
        const tweet = await page.evaluate((url) => {
            const parentIdMatch = url.match(/status\/(\d+)/);
            const parentTweetId = parentIdMatch ? parentIdMatch[1] : '';
            const articles = document.querySelectorAll('article[data-testid="tweet"]');
            for (const article of Array.from(articles)) {
                try {
                    const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
                    const fullText = tweetTextElement?.textContent || '';
                    const userLink = article.querySelector('a[role="link"][href*="/"]');
                    const username = userLink?.getAttribute('href')?.replace('/', '') || '';
                    const timeElement = article.querySelector('time');
                    const tweetLink = timeElement?.parentElement;
                    const tweetUrl = tweetLink?.href || '';
                    const idMatch = tweetUrl.match(/status\/(\d+)/);
                    const idStr = idMatch ? idMatch[1] : '';
                    // Only return the parent tweet
                    if (idStr === parentTweetId) {
                        const createdAt = timeElement?.getAttribute('datetime') || '';
                        const replyButton = article.querySelector('[data-testid="reply"]');
                        const replyCount = replyButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                        const retweetButton = article.querySelector('[data-testid="retweet"]');
                        const retweetCount = retweetButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                        const likeButton = article.querySelector('[data-testid="like"]');
                        const favoriteCount = likeButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
                        const viewsElement = article.querySelector('[href*="/analytics"]');
                        const views = viewsElement?.getAttribute('aria-label')?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0';
                        const avatarImg = article.querySelector('img[alt*="' + username + '"]');
                        const photoUser = avatarImg?.getAttribute('src') || '';
                        const tweetImage = article.querySelector('[data-testid="tweetPhoto"] img');
                        const imageUrl = tweetImage?.getAttribute('src') || '';
                        const replyingToElement = article.querySelector('[data-testid="tweetText"]')?.closest('div')?.previousElementSibling;
                        const inReplyToScreenName = replyingToElement?.textContent?.includes('Replying to')
                            ? replyingToElement?.querySelector('a')?.textContent?.replace('@', '') || ''
                            : '';
                        return {
                            username,
                            full_text: fullText,
                            tweet_url: tweetUrl,
                            created_at: createdAt,
                            id_str: idStr,
                            reply_count: parseInt(replyCount) || 0,
                            retweet_count: parseInt(retweetCount) || 0,
                            favorite_count: parseInt(favoriteCount) || 0,
                            views: views,
                            photo_user: photoUser,
                            image_url: imageUrl,
                            in_reply_to_screen_name: inReplyToScreenName,
                            quote_count: 0,
                            lang: 'es',
                            user_id_str: '',
                            conversation_id_str: idStr,
                            location: '',
                            has_quoted_text: false
                        };
                    }
                }
                catch (error) {
                    console.error('Error extracting tweet:', error);
                }
            }
            return null;
        }, tweetUrl);
        return tweet;
    }
    async crawlReplies(options) {
        const { tweetUrl, idTweet, maxReplies = -1 } = options;
        this.onLog = options.onLog;
        this.log('Starting tweet replies crawl...');
        this.log(`Tweet URL: ${tweetUrl}`);
        this.log(`Reply limit: ${maxReplies === -1 ? 'Unlimited' : maxReplies}`);
        const browser = await playwright_extra_1.chromium.launch({
            headless: process.env.DEBUG !== 'true',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
        });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        try {
            await page.goto('https://twitter.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.context().addCookies([
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.twitter.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.x.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
            ]);
            this.log('Authentication token injected');
            this.log('Navigating to tweet...');
            await page.goto(tweetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.waitForTimeout(3000);
            let tweetsDetected = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
                    this.log('Tweets detected on page');
                    tweetsDetected = true;
                    break;
                }
                catch (error) {
                    this.log(`Attempt ${i + 1}/3: No tweets detected, waiting...`);
                    await page.waitForTimeout(1500);
                    await page.evaluate(() => window.scrollBy(0, 300));
                    await page.waitForTimeout(1000);
                }
            }
            if (!tweetsDetected) {
                throw new Error('Could not detect tweets after 3 attempts. Verify URL and token.');
            }
            this.log('Tweet page loaded successfully');
            const collectedReplies = new Map();
            let scrollsWithoutNewReplies = 0;
            let lastReplyCount = 0;
            const MAX_SCROLLS_WITHOUT_NEW_REPLIES = 5;
            const delayBetweenScrolls = 1500;
            this.log('Starting replies collection...');
            while (true) {
                const currentReplies = await this.extractRepliesFromPage(page, tweetUrl);
                currentReplies.forEach(reply => {
                    if (reply.id_str) {
                        collectedReplies.set(reply.id_str, reply);
                    }
                });
                const currentCount = collectedReplies.size;
                this.log(`Replies collected: ${currentCount}`);
                if (maxReplies > 0 && currentCount >= maxReplies) {
                    this.log(`Reply limit reached: ${currentCount}`);
                    break;
                }
                if (currentCount === lastReplyCount) {
                    scrollsWithoutNewReplies++;
                    this.log(`No new replies (${scrollsWithoutNewReplies}/${MAX_SCROLLS_WITHOUT_NEW_REPLIES})`);
                    if (scrollsWithoutNewReplies >= MAX_SCROLLS_WITHOUT_NEW_REPLIES) {
                        this.log('No more replies found. Finishing...');
                        break;
                    }
                }
                else {
                    scrollsWithoutNewReplies = 0;
                }
                lastReplyCount = currentCount;
                await this.clickShowSpamButton(page);
                await (0, scrollUtils_1.humanScrollDown)(page);
                await page.waitForTimeout(delayBetweenScrolls);
                const extraScroll = Math.floor(Math.random() * 250) + 200;
                await page.evaluate((scroll) => window.scrollBy(0, scroll), extraScroll);
                await page.waitForTimeout(Math.floor(Math.random() * 200) + 150);
            }
            const finalReplies = Array.from(collectedReplies.values());
            this.log(`\nScraping completed!`);
            this.log(`Total replies collected: ${finalReplies.length}`);
            if (finalReplies.length > 0) {
                const tweetAnswers = finalReplies.map(reply => ({
                    id_tweet: idTweet,
                    full_text: reply.full_text,
                    tweet_url: reply.tweet_url || '',
                    image_url: reply.image_url,
                    location: reply.location,
                    in_reply_to_screen_name: reply.in_reply_to_screen_name,
                    views: parseInt(reply.views) || 0,
                    created_at: (0, dateUtils_1.convertTweetDateToMexicanTime)(reply.created_at),
                    id_str: reply.id_str,
                    quote_count: reply.quote_count || 0,
                    reply_count: reply.reply_count || 0,
                    retweet_count: reply.retweet_count || 0,
                    favorite_count: reply.favorite_count || 0,
                    lang: reply.lang || 'es',
                    user_id_str: reply.user_id_str || '',
                    conversation_id_str: reply.conversation_id_str || reply.id_str,
                    usuario_twitter: reply.username,
                    has_quoted_text: reply.has_quoted_text || false,
                    photo_user: reply.photo_user,
                    hash_tweet: (0, hashUtils_1.generateTweetHash)(reply),
                    parent_tweet_url: tweetUrl
                }));
                this.log(`\nPrepared ${tweetAnswers.length} replies`);
                return tweetAnswers;
            }
            else {
                this.log('No replies found');
                return [];
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.log(`Error during crawl: ${errorMessage}`);
            throw error;
        }
        finally {
            await browser.close();
            this.log('Browser closed');
        }
    }
    async crawlMultipleReplies(options) {
        const { tweets, maxReplies = -1 } = options;
        this.onLog = options.onLog;
        this.log('Starting replies crawl for multiple tweets...');
        this.log(`Total tweets: ${tweets.length}`);
        this.log(`Reply limit per tweet: ${maxReplies === -1 ? 'Unlimited' : maxReplies}`);
        const browser = await playwright_extra_1.chromium.launch({
            headless: process.env.DEBUG !== 'true',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
        });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        const results = [];
        try {
            await page.goto('https://twitter.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.context().addCookies([
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.twitter.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.x.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
            ]);
            this.log('Authentication token injected');
            for (let i = 0; i < tweets.length; i++) {
                const tweet = tweets[i];
                try {
                    this.log(`\nProcessing tweet ${i + 1}/${tweets.length}: ${tweet.usuario_twitter}`);
                    this.log(`URL: ${tweet.tweet_url}`);
                    await page.goto(tweet.tweet_url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 60000
                    });
                    await page.waitForTimeout(1500);
                    let tweetsDetected = false;
                    for (let j = 0; j < 3; j++) {
                        try {
                            await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
                            this.log('Tweets detected on page');
                            tweetsDetected = true;
                            break;
                        }
                        catch (error) {
                            this.log(`Attempt ${j + 1}/3: No tweets detected, waiting...`);
                            await page.waitForTimeout(1500);
                            await page.evaluate(() => window.scrollBy(0, 300));
                            await page.waitForTimeout(1000);
                        }
                    }
                    if (!tweetsDetected) {
                        throw new Error('Could not detect tweets after 3 attempts');
                    }
                    const collectedReplies = new Map();
                    let scrollsWithoutNewReplies = 0;
                    let lastReplyCount = 0;
                    const MAX_SCROLLS_WITHOUT_NEW_REPLIES = 5;
                    const delayBetweenScrolls = 1500;
                    this.log('Starting replies collection...');
                    while (true) {
                        const currentReplies = await this.extractRepliesFromPage(page, tweet.tweet_url);
                        currentReplies.forEach(reply => {
                            if (reply.id_str) {
                                collectedReplies.set(reply.id_str, reply);
                            }
                        });
                        const currentCount = collectedReplies.size;
                        this.log(`Replies collected: ${currentCount}`);
                        if (maxReplies > 0 && currentCount >= maxReplies) {
                            this.log(`Reply limit reached: ${currentCount}`);
                            break;
                        }
                        if (currentCount === lastReplyCount) {
                            scrollsWithoutNewReplies++;
                            this.log(`No new replies (${scrollsWithoutNewReplies}/${MAX_SCROLLS_WITHOUT_NEW_REPLIES})`);
                            if (scrollsWithoutNewReplies >= MAX_SCROLLS_WITHOUT_NEW_REPLIES) {
                                this.log('No more replies found. Finishing...');
                                break;
                            }
                        }
                        else {
                            scrollsWithoutNewReplies = 0;
                        }
                        lastReplyCount = currentCount;
                        await this.clickShowSpamButton(page);
                        await (0, scrollUtils_1.humanScrollDown)(page);
                        await page.waitForTimeout(delayBetweenScrolls);
                        const extraScroll = Math.floor(Math.random() * 250) + 200;
                        await page.evaluate((scroll) => window.scrollBy(0, scroll), extraScroll);
                        await page.waitForTimeout(Math.floor(Math.random() * 200) + 150);
                    }
                    const finalReplies = Array.from(collectedReplies.values());
                    this.log(`Scraping completed for tweet ${tweet.id}`);
                    this.log(`Total replies collected: ${finalReplies.length}`);
                    if (finalReplies.length > 0) {
                        const tweetAnswers = finalReplies.map(reply => ({
                            id_tweet: tweet.id,
                            full_text: reply.full_text,
                            tweet_url: reply.tweet_url || '',
                            image_url: reply.image_url,
                            location: reply.location,
                            in_reply_to_screen_name: reply.in_reply_to_screen_name,
                            views: parseInt(reply.views) || 0,
                            created_at: (0, dateUtils_1.convertTweetDateToMexicanTime)(reply.created_at),
                            id_str: reply.id_str,
                            quote_count: reply.quote_count || 0,
                            reply_count: reply.reply_count || 0,
                            retweet_count: reply.retweet_count || 0,
                            favorite_count: reply.favorite_count || 0,
                            lang: reply.lang || 'es',
                            user_id_str: reply.user_id_str || '',
                            conversation_id_str: reply.conversation_id_str || reply.id_str,
                            usuario_twitter: reply.username,
                            has_quoted_text: reply.has_quoted_text || false,
                            photo_user: reply.photo_user,
                            hash_tweet: (0, hashUtils_1.generateTweetHash)(reply),
                            parent_tweet_url: tweet.tweet_url
                        }));
                        this.log(`Prepared ${tweetAnswers.length} replies`);
                        results.push({
                            tweetId: tweet.id,
                            repliesCount: tweetAnswers.length,
                            replies: tweetAnswers,
                            success: true
                        });
                    }
                    else {
                        this.log('No replies found');
                        results.push({
                            tweetId: tweet.id,
                            repliesCount: 0,
                            replies: [],
                            success: true
                        });
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.log(`Error processing tweet ${tweet.id}: ${errorMessage}`);
                    results.push({
                        tweetId: tweet.id,
                        repliesCount: 0,
                        replies: [],
                        success: false,
                        error: errorMessage
                    });
                }
            }
            this.log(`\nMultiple tweets crawl completed!`);
            this.log(`Total tweets processed: ${tweets.length}`);
            this.log(`Successful tweets: ${results.filter(r => r.success).length}`);
            this.log(`Failed tweets: ${results.filter(r => !r.success).length}`);
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.log(`Error during multiple tweets crawl: ${errorMessage}`);
            throw error;
        }
        finally {
            await browser.close();
            this.log('Browser closed');
        }
    }
    async getTweetMetrics(options) {
        const { tweetUrl } = options;
        this.onLog = options.onLog;
        this.log('Starting tweet metrics extraction...');
        this.log(`Tweet URL: ${tweetUrl}`);
        const browser = await playwright_extra_1.chromium.launch({
            headless: process.env.DEBUG !== 'true',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
        });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        try {
            await page.goto('https://twitter.com', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.context().addCookies([
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.twitter.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
                {
                    name: 'auth_token',
                    value: this.authToken,
                    domain: '.x.com',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                },
            ]);
            this.log('Authentication token injected');
            this.log('Navigating to tweet...');
            await page.goto(tweetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.waitForTimeout(3000);
            let tweetsDetected = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
                    this.log('Tweet detected on page');
                    tweetsDetected = true;
                    break;
                }
                catch (error) {
                    this.log(`Attempt ${i + 1}/3: No tweet detected, waiting...`);
                    await page.waitForTimeout(1500);
                    await page.evaluate(() => window.scrollBy(0, 300));
                    await page.waitForTimeout(1000);
                }
            }
            if (!tweetsDetected) {
                throw new Error('Could not detect tweet after 3 attempts. Verify URL and token.');
            }
            this.log('Tweet page loaded successfully');
            const tweet = await this.extractTweetFromPage(page, tweetUrl);
            if (tweet) {
                this.log('Tweet metrics extracted successfully');
                this.log(`ID: ${tweet.id_str}`);
                this.log(`Views: ${tweet.views}`);
                this.log(`Replies: ${tweet.reply_count}`);
                this.log(`Retweets: ${tweet.retweet_count}`);
                this.log(`Likes: ${tweet.favorite_count}`);
                return tweet;
            }
            else {
                this.log('Could not extract tweet metrics');
                return null;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.log(`Error during tweet metrics extraction: ${errorMessage}`);
            throw error;
        }
        finally {
            await browser.close();
            this.log('Browser closed');
        }
    }
}
exports.RepliesCrawler = RepliesCrawler;
//# sourceMappingURL=RepliesCrawler.js.map