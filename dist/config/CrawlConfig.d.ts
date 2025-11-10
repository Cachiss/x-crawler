/**
 * Centralized configuration for the crawling system
 * All constants and configurable parameters for crawling
 */
export interface CrawlConfig {
    TOKEN_ROTATION_THRESHOLD: number;
    TIMEOUT_LIMIT: {
        UNLIMITED_SEARCH: number;
        LIMITED_SEARCH: number;
    };
    REACH_TIMEOUT_MAX: {
        UNLIMITED_SEARCH: number;
        LIMITED_SEARCH: number;
    };
    MAX_EXECUTION_TIME: {
        UNLIMITED_SEARCH: number;
        LIMITED_SEARCH: number;
    };
    DELAY_EACH_TWEET_SECONDS: number;
    DELAY_EVERY_100_TWEETS_SECONDS: number;
    RATE_LIMIT: {
        MAX_RETRIES: number;
        BASE_WAIT_TIME: number;
        MAX_WAIT_TIME: number;
        RECOVERY_TIMEOUT: number;
    };
    SCROLL: {
        WAIT_FOR_RESPONSE_TIMEOUT: number;
        STABILIZATION_DELAY: number;
        TOKEN_ROTATION_DELAY: number;
    };
    TIMELINE: {
        LOAD_TIMEOUT: number;
        RETRY_DELAY: number;
    };
    PERSISTENCE: {
        MAX_EMPTY_RESPONSES: number;
        RECOVERY_ATTEMPTS: number;
        AGGRESSIVE_SCROLL_COUNT: number;
    };
    BATCH: {
        SIZE: number;
        TWEETS_PER_SCROLL: number;
    };
}
/**
 * Default crawl configuration
 */
export declare const DEFAULT_CRAWL_CONFIG: CrawlConfig;
/**
 * Aggressive crawl configuration (faster but riskier)
 */
export declare const AGGRESSIVE_CRAWL_CONFIG: CrawlConfig;
/**
 * Conservative crawl configuration (slower but safer)
 */
export declare const CONSERVATIVE_CRAWL_CONFIG: CrawlConfig;
/**
 * Get configuration based on search type
 */
export declare function getCrawlConfig(configType?: 'default' | 'aggressive' | 'conservative'): CrawlConfig;
/**
 * Get specific limits based on whether it's unlimited search
 */
export declare function getTimeoutLimits(config: CrawlConfig, isUnlimitedSearch: boolean): {
    TIMEOUT_LIMIT: number;
    REACH_TIMEOUT_MAX: number;
    MAX_EXECUTION_TIME: number;
};
//# sourceMappingURL=CrawlConfig.d.ts.map