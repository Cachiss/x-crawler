import { TwitterCrawlerInitOptions, CrawlTweetsOptions, CrawlRepliesOptions, CrawlMultipleRepliesOptions, GetTweetMetricsOptions } from "./types/Config";
import { TweetHash, TweetAnswer, CrawlRepliesResult } from "./types/Tweet";
export declare class TwitterCrawler {
    private authToken;
    private authTokensPool;
    private configType;
    private config;
    private constructor();
    /**
     * Initializes a new instance of TwitterCrawler
     * @param options Initialization options
     * @returns TwitterCrawler instance
     */
    static init(options: TwitterCrawlerInitOptions): TwitterCrawler;
    /**
     * Crawls tweets based on keywords, users or thread URL
     * @param options Crawl options
     * @returns Array of collected tweets
     */
    crawlTweets(options: CrawlTweetsOptions): Promise<TweetHash[]>;
    /**
     * Crawls replies from a single tweet
     * @param options Reply crawl options
     * @returns Array of collected replies
     */
    crawlReplies(options: CrawlRepliesOptions): Promise<TweetAnswer[]>;
    /**
     * Crawls replies from multiple tweets using a single browser
     * @param options Multiple replies crawl options
     * @returns Array of results with replies per tweet
     */
    crawlMultipleReplies(options: CrawlMultipleRepliesOptions): Promise<CrawlRepliesResult[]>;
    /**
     * Gets the current crawler configuration
     */
    getConfig(): import("./config/CrawlConfig").CrawlConfig;
    /**
     * Updates the crawler configuration
     */
    setConfigType(configType: 'default' | 'aggressive' | 'conservative'): void;
    /**
     * Gets metrics from a specific tweet by URL
     * @param options GetTweetMetrics options
     * @returns Tweet with all its metrics or null if not found
     */
    getTweetMetrics(options: GetTweetMetricsOptions): Promise<TweetHash | null>;
}
//# sourceMappingURL=TwitterCrawler.d.ts.map