/**
 * Main class for Twitter crawler
 * Requires initialization with init() before use
 */
import { getCrawlConfig } from "./config/CrawlConfig";
import { TweetCrawler } from "./crawlers/TweetCrawler";
import { RepliesCrawler } from "./crawlers/RepliesCrawler";
import {
  TwitterCrawlerInitOptions,
  CrawlTweetsOptions,
  CrawlRepliesOptions,
  CrawlMultipleRepliesOptions,
  GetTweetMetricsOptions
} from "./types/Config";
import { TweetHash, TweetAnswer, CrawlRepliesResult } from "./types/Tweet";

export class TwitterCrawler {
  private authToken: string;
  private authTokensPool: string[];
  private configType: 'default' | 'aggressive' | 'conservative';
  private config: ReturnType<typeof getCrawlConfig>;

  private constructor(options: TwitterCrawlerInitOptions) {
    this.authToken = options.authToken;
    this.authTokensPool = options.authTokensPool || [];
    this.configType = options.configType || 'default';
    this.config = getCrawlConfig(this.configType);
  }

  /**
   * Initializes a new instance of TwitterCrawler
   * @param options Initialization options
   * @returns TwitterCrawler instance
   */
  static init(options: TwitterCrawlerInitOptions): TwitterCrawler {
    if (!options.authToken) {
      throw new Error("authToken is required to initialize TwitterCrawler");
    }
    return new TwitterCrawler(options);
  }

  /**
   * Crawls tweets based on keywords, users or thread URL
   * @param options Crawl options
   * @returns Array of collected tweets
   */
  async crawlTweets(options: CrawlTweetsOptions): Promise<TweetHash[]> {
    const tweetCrawler = new TweetCrawler(
      this.authToken,
      this.authTokensPool,
      this.config,
      options.onLog,
      options.onProgress
    );

    // Merge configType if provided in options
    if (options.configType) {
      const customConfig = getCrawlConfig(options.configType);
      const customTweetCrawler = new TweetCrawler(
        this.authToken,
        this.authTokensPool,
        customConfig,
        options.onLog,
        options.onProgress
      );
      return customTweetCrawler.crawl(options);
    }

    return tweetCrawler.crawl(options);
  }

  /**
   * Crawls replies from a single tweet
   * @param options Reply crawl options
   * @returns Array of collected replies
   */
  async crawlReplies(options: CrawlRepliesOptions): Promise<TweetAnswer[]> {
    const repliesCrawler = new RepliesCrawler(this.authToken, options.onLog);
    return repliesCrawler.crawlReplies(options);
  }

  /**
   * Crawls replies from multiple tweets using a single browser
   * @param options Multiple replies crawl options
   * @returns Array of results with replies per tweet
   */
  async crawlMultipleReplies(options: CrawlMultipleRepliesOptions): Promise<CrawlRepliesResult[]> {
    const repliesCrawler = new RepliesCrawler(this.authToken, options.onLog);
    return repliesCrawler.crawlMultipleReplies(options);
  }

  /**
   * Gets the current crawler configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Updates the crawler configuration
   */
  setConfigType(configType: 'default' | 'aggressive' | 'conservative') {
    this.configType = configType;
    this.config = getCrawlConfig(configType);
  }

  /**
   * Gets metrics from a specific tweet by URL
   * @param options GetTweetMetrics options
   * @returns Tweet with all its metrics or null if not found
   */
  async getTweetMetrics(options: GetTweetMetricsOptions): Promise<TweetHash | null> {
    const repliesCrawler = new RepliesCrawler(this.authToken, options.onLog);
    return repliesCrawler.getTweetMetrics(options);
  }
}

