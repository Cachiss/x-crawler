"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterCrawler = void 0;
/**
 * Main class for Twitter crawler
 * Requires initialization with init() before use
 */
const CrawlConfig_1 = require("./config/CrawlConfig");
const TweetCrawler_1 = require("./crawlers/TweetCrawler");
const RepliesCrawler_1 = require("./crawlers/RepliesCrawler");
class TwitterCrawler {
    constructor(options) {
        this.authToken = options.authToken;
        this.authTokensPool = options.authTokensPool || [];
        this.configType = options.configType || 'default';
        this.config = (0, CrawlConfig_1.getCrawlConfig)(this.configType);
    }
    /**
     * Initializes a new instance of TwitterCrawler
     * @param options Initialization options
     * @returns TwitterCrawler instance
     */
    static init(options) {
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
    async crawlTweets(options) {
        const tweetCrawler = new TweetCrawler_1.TweetCrawler(this.authToken, this.authTokensPool, this.config, options.onLog, options.onProgress);
        // Merge configType if provided in options
        if (options.configType) {
            const customConfig = (0, CrawlConfig_1.getCrawlConfig)(options.configType);
            const customTweetCrawler = new TweetCrawler_1.TweetCrawler(this.authToken, this.authTokensPool, customConfig, options.onLog, options.onProgress);
            return customTweetCrawler.crawl(options);
        }
        return tweetCrawler.crawl(options);
    }
    /**
     * Crawls replies from a single tweet
     * @param options Reply crawl options
     * @returns Array of collected replies
     */
    async crawlReplies(options) {
        const repliesCrawler = new RepliesCrawler_1.RepliesCrawler(this.authToken, options.onLog);
        return repliesCrawler.crawlReplies(options);
    }
    /**
     * Crawls replies from multiple tweets using a single browser
     * @param options Multiple replies crawl options
     * @returns Array of results with replies per tweet
     */
    async crawlMultipleReplies(options) {
        const repliesCrawler = new RepliesCrawler_1.RepliesCrawler(this.authToken, options.onLog);
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
    setConfigType(configType) {
        this.configType = configType;
        this.config = (0, CrawlConfig_1.getCrawlConfig)(configType);
    }
    /**
     * Gets metrics from a specific tweet by URL
     * @param options GetTweetMetrics options
     * @returns Tweet with all its metrics or null if not found
     */
    async getTweetMetrics(options) {
        const repliesCrawler = new RepliesCrawler_1.RepliesCrawler(this.authToken, options.onLog);
        return repliesCrawler.getTweetMetrics(options);
    }
}
exports.TwitterCrawler = TwitterCrawler;
//# sourceMappingURL=TwitterCrawler.js.map