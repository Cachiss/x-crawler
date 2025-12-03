/**
 * Configuration types for Twitter Crawler library
 */

export type SearchTab = "LATEST" | "TOP";
export type ConfigType = 'default' | 'aggressive' | 'conservative';

export interface CrawlTweetsOptions {
  searchKeywords?: string;
  searchFromDate?: string;
  searchToDate?: string;
  targetCount?: number;
  delayEachTweetSeconds?: number;
  delayEvery100TweetsSeconds?: number;
  debugMode?: boolean;
  outputFilename?: string;
  tweetThreadUrl?: string;
  searchTab?: SearchTab;
  searchUsernames?: string[];
  authTokensPool?: string[];
  configType?: ConfigType;
  onLog?: (message: string) => void;
  onProgress?: (progress: { collectedTweets: number }) => void;
}

export interface CrawlRepliesOptions {
  tweetUrl: string;
  idTweet?: number;
  maxReplies?: number;
  onLog?: (message: string) => void;
}

export interface CrawlMultipleRepliesOptions {
  tweets: Array<{ id: number; tweet_url: string; usuario_twitter: string }>;
  maxReplies?: number;
  onLog?: (message: string) => void;
}

export interface GetTweetMetricsOptions {
  tweetUrl: string;
  onLog?: (message: string) => void;
}

export interface TwitterCrawlerInitOptions {
  authToken: string;
  configType?: ConfigType;
  authTokensPool?: string[];
}

