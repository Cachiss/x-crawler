/**
 * Centralized configuration for the crawling system
 * All constants and configurable parameters for crawling
 */

export interface CrawlConfig {
  // Token rotation configuration
  TOKEN_ROTATION_THRESHOLD: number;
  
  // Timeout and limit configuration
  TIMEOUT_LIMIT: {
    UNLIMITED_SEARCH: number;
    LIMITED_SEARCH: number;
  };
  
  REACH_TIMEOUT_MAX: {
    UNLIMITED_SEARCH: number;
    LIMITED_SEARCH: number;
  };
  
  MAX_EXECUTION_TIME: {
    UNLIMITED_SEARCH: number; // in milliseconds
    LIMITED_SEARCH: number;   // in milliseconds
  };
  
  // Delay configuration
  DELAY_EACH_TWEET_SECONDS: number;
  DELAY_EVERY_100_TWEETS_SECONDS: number;
  
  // Rate limiting configuration
  RATE_LIMIT: {
    MAX_RETRIES: number;
    BASE_WAIT_TIME: number;      // base time in ms
    MAX_WAIT_TIME: number;       // maximum time in ms
    RECOVERY_TIMEOUT: number;    // maximum retry time in ms
  };
  
  // Scroll and collection configuration
  SCROLL: {
    WAIT_FOR_RESPONSE_TIMEOUT: number;
    STABILIZATION_DELAY: number;
    TOKEN_ROTATION_DELAY: number;
  };
  
  // Timeline loading configuration
  TIMELINE: {
    LOAD_TIMEOUT: number;
    RETRY_DELAY: number;
  };
  
  // Persistence configuration to avoid premature stops
  PERSISTENCE: {
    MAX_EMPTY_RESPONSES: number;      // Maximum empty responses before stopping
    RECOVERY_ATTEMPTS: number;        // Recovery attempts before giving up
    AGGRESSIVE_SCROLL_COUNT: number;  // Number of scrolls in aggressive recovery
  };
  
  // Batch processing configuration
  BATCH: {
    SIZE: number;
    TWEETS_PER_SCROLL: number;
  };
}

/**
 * Default crawl configuration
 */
export const DEFAULT_CRAWL_CONFIG: CrawlConfig = {
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
    UNLIMITED_SEARCH: 1800000,  // 30 minutes
    LIMITED_SEARCH: 600000      // 10 minutes
  },
  
  // Optimized delays for more scrolling while avoiding rate limiting
  DELAY_EACH_TWEET_SECONDS: 2,
  DELAY_EVERY_100_TWEETS_SECONDS: 8,
  
  // Improved rate limiting configuration to reduce errors
  RATE_LIMIT: {
    MAX_RETRIES: 5,
    BASE_WAIT_TIME: 90000,      // 1.5 minutes
    MAX_WAIT_TIME: 180000,      // 3 minutes
    RECOVERY_TIMEOUT: 600000    // 10 minutes
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
export const AGGRESSIVE_CRAWL_CONFIG: CrawlConfig = {
  ...DEFAULT_CRAWL_CONFIG,
  TOKEN_ROTATION_THRESHOLD: 30,  // Rotate more frequently
  
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
export const CONSERVATIVE_CRAWL_CONFIG: CrawlConfig = {
  ...DEFAULT_CRAWL_CONFIG,
  TOKEN_ROTATION_THRESHOLD: 75,  // Rotate less frequently
  
  TIMEOUT_LIMIT: {
    UNLIMITED_SEARCH: 5,
    LIMITED_SEARCH: 3
  },
  
  REACH_TIMEOUT_MAX: {
    UNLIMITED_SEARCH: 4,
    LIMITED_SEARCH: 2
  },
  
  MAX_EXECUTION_TIME: {
    UNLIMITED_SEARCH: 3600000,  // 1 hour
    LIMITED_SEARCH: 1800000     // 30 minutes
  },
  
  DELAY_EACH_TWEET_SECONDS: 3,
  DELAY_EVERY_100_TWEETS_SECONDS: 12,
  
  RATE_LIMIT: {
    MAX_RETRIES: 5,
    BASE_WAIT_TIME: 120000,     // 2 minutes
    MAX_WAIT_TIME: 300000,      // 5 minutes
    RECOVERY_TIMEOUT: 1800000   // 30 minutes
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
export function getCrawlConfig(configType: 'default' | 'aggressive' | 'conservative' = 'default'): CrawlConfig {
  switch (configType) {
    case 'aggressive':
      return AGGRESSIVE_CRAWL_CONFIG;
    case 'conservative':
      return CONSERVATIVE_CRAWL_CONFIG;
    default:
      return DEFAULT_CRAWL_CONFIG;
  }
}

/**
 * Get specific limits based on whether it's unlimited search
 */
export function getTimeoutLimits(config: CrawlConfig, isUnlimitedSearch: boolean) {
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
