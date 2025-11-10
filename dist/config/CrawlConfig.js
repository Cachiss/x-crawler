"use strict";
/**
 * Centralized configuration for the crawling system
 * All constants and configurable parameters for crawling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSERVATIVE_CRAWL_CONFIG = exports.AGGRESSIVE_CRAWL_CONFIG = exports.DEFAULT_CRAWL_CONFIG = void 0;
exports.getCrawlConfig = getCrawlConfig;
exports.getTimeoutLimits = getTimeoutLimits;
/**
 * Default crawl configuration
 */
exports.DEFAULT_CRAWL_CONFIG = {
    // Rotate tokens every 50 tweets
    TOKEN_ROTATION_THRESHOLD: 50,
    // Increased timeout limits for more scrolling
    TIMEOUT_LIMIT: {
        UNLIMITED_SEARCH: 8,
        LIMITED_SEARCH: 4
    },
    REACH_TIMEOUT_MAX: {
        UNLIMITED_SEARCH: 6,
        LIMITED_SEARCH: 3
    },
    // Optimized maximum execution times
    MAX_EXECUTION_TIME: {
        UNLIMITED_SEARCH: 1800000, // 30 minutes
        LIMITED_SEARCH: 600000 // 10 minutes
    },
    // Optimized delays for more scrolling while avoiding rate limiting
    DELAY_EACH_TWEET_SECONDS: 2,
    DELAY_EVERY_100_TWEETS_SECONDS: 8,
    // Improved rate limiting configuration to reduce errors
    RATE_LIMIT: {
        MAX_RETRIES: 5,
        BASE_WAIT_TIME: 90000, // 1.5 minutes
        MAX_WAIT_TIME: 180000, // 3 minutes
        RECOVERY_TIMEOUT: 600000 // 10 minutes
    },
    // Optimized scroll configuration for more scrolling
    SCROLL: {
        WAIT_FOR_RESPONSE_TIMEOUT: 1500,
        STABILIZATION_DELAY: 2000,
        TOKEN_ROTATION_DELAY: 3000
    },
    // Timeline loading configuration
    TIMELINE: {
        LOAD_TIMEOUT: 30000,
        RETRY_DELAY: 5000
    },
    // Persistence configuration to avoid premature stops
    PERSISTENCE: {
        MAX_EMPTY_RESPONSES: 8,
        RECOVERY_ATTEMPTS: 6,
        AGGRESSIVE_SCROLL_COUNT: 5
    },
    // Optimized batch configuration for more scrolling
    BATCH: {
        SIZE: 150,
        TWEETS_PER_SCROLL: 15
    }
};
/**
 * Aggressive crawl configuration (faster but riskier)
 */
exports.AGGRESSIVE_CRAWL_CONFIG = {
    ...exports.DEFAULT_CRAWL_CONFIG,
    TOKEN_ROTATION_THRESHOLD: 30, // Rotate more frequently
    TIMEOUT_LIMIT: {
        UNLIMITED_SEARCH: 12,
        LIMITED_SEARCH: 6
    },
    REACH_TIMEOUT_MAX: {
        UNLIMITED_SEARCH: 8,
        LIMITED_SEARCH: 4
    },
    MAX_EXECUTION_TIME: {
        UNLIMITED_SEARCH: 600000,
        LIMITED_SEARCH: 300000
    },
    DELAY_EACH_TWEET_SECONDS: 0.5,
    DELAY_EVERY_100_TWEETS_SECONDS: 3,
    SCROLL: {
        WAIT_FOR_RESPONSE_TIMEOUT: 800,
        STABILIZATION_DELAY: 800,
        TOKEN_ROTATION_DELAY: 1500
    },
    TIMELINE: {
        LOAD_TIMEOUT: 20000,
        RETRY_DELAY: 3000
    },
    PERSISTENCE: {
        MAX_EMPTY_RESPONSES: 12,
        RECOVERY_ATTEMPTS: 10,
        AGGRESSIVE_SCROLL_COUNT: 8
    },
    BATCH: {
        SIZE: 200,
        TWEETS_PER_SCROLL: 12
    }
};
/**
 * Conservative crawl configuration (slower but safer)
 */
exports.CONSERVATIVE_CRAWL_CONFIG = {
    ...exports.DEFAULT_CRAWL_CONFIG,
    TOKEN_ROTATION_THRESHOLD: 75, // Rotate less frequently
    TIMEOUT_LIMIT: {
        UNLIMITED_SEARCH: 5,
        LIMITED_SEARCH: 3
    },
    REACH_TIMEOUT_MAX: {
        UNLIMITED_SEARCH: 4,
        LIMITED_SEARCH: 2
    },
    MAX_EXECUTION_TIME: {
        UNLIMITED_SEARCH: 3600000, // 1 hour
        LIMITED_SEARCH: 1800000 // 30 minutes
    },
    DELAY_EACH_TWEET_SECONDS: 3,
    DELAY_EVERY_100_TWEETS_SECONDS: 12,
    RATE_LIMIT: {
        MAX_RETRIES: 5,
        BASE_WAIT_TIME: 120000, // 2 minutes
        MAX_WAIT_TIME: 300000, // 5 minutes
        RECOVERY_TIMEOUT: 1800000 // 30 minutes
    },
    SCROLL: {
        WAIT_FOR_RESPONSE_TIMEOUT: 2500,
        STABILIZATION_DELAY: 4000,
        TOKEN_ROTATION_DELAY: 5000
    },
    TIMELINE: {
        LOAD_TIMEOUT: 45000,
        RETRY_DELAY: 8000
    },
    PERSISTENCE: {
        MAX_EMPTY_RESPONSES: 5,
        RECOVERY_ATTEMPTS: 4,
        AGGRESSIVE_SCROLL_COUNT: 3
    },
    BATCH: {
        SIZE: 100,
        TWEETS_PER_SCROLL: 25
    }
};
/**
 * Get configuration based on search type
 */
function getCrawlConfig(configType = 'default') {
    switch (configType) {
        case 'aggressive':
            return exports.AGGRESSIVE_CRAWL_CONFIG;
        case 'conservative':
            return exports.CONSERVATIVE_CRAWL_CONFIG;
        default:
            return exports.DEFAULT_CRAWL_CONFIG;
    }
}
/**
 * Get specific limits based on whether it's unlimited search
 */
function getTimeoutLimits(config, isUnlimitedSearch) {
    return {
        TIMEOUT_LIMIT: isUnlimitedSearch
            ? config.TIMEOUT_LIMIT.UNLIMITED_SEARCH
            : config.TIMEOUT_LIMIT.LIMITED_SEARCH,
        REACH_TIMEOUT_MAX: isUnlimitedSearch
            ? config.REACH_TIMEOUT_MAX.UNLIMITED_SEARCH
            : config.REACH_TIMEOUT_MAX.LIMITED_SEARCH,
        MAX_EXECUTION_TIME: isUnlimitedSearch
            ? config.MAX_EXECUTION_TIME.UNLIMITED_SEARCH
            : config.MAX_EXECUTION_TIME.LIMITED_SEARCH
    };
}
//# sourceMappingURL=CrawlConfig.js.map