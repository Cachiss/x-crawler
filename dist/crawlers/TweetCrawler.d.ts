import { CrawlConfig } from "../config/CrawlConfig";
import { CrawlTweetsOptions } from "../types/Config";
import { TweetHash } from "../types/Tweet";
export declare class TweetCrawler {
    private authToken;
    private authTokensPool;
    private config;
    private onLog?;
    private onProgress?;
    constructor(authToken: string, authTokensPool: string[], config: CrawlConfig, onLog?: (message: string) => void, onProgress?: (progress: {
        collectedTweets: number;
    }) => void);
    private log;
    private cleanTweetText;
    private checkEndOfContent;
    crawl(options: CrawlTweetsOptions): Promise<TweetHash[]>;
    private scrollAndCollectTweets;
}
//# sourceMappingURL=TweetCrawler.d.ts.map