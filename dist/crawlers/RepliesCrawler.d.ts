import { CrawlRepliesOptions, CrawlMultipleRepliesOptions, GetTweetMetricsOptions } from "../types/Config";
import { TweetHash, TweetAnswer, CrawlRepliesResult } from "../types/Tweet";
export declare class RepliesCrawler {
    private authToken;
    private onLog?;
    constructor(authToken: string, onLog?: (message: string) => void);
    private log;
    private clickShowSpamButton;
    private extractRepliesFromPage;
    private extractTweetFromPage;
    crawlReplies(options: CrawlRepliesOptions): Promise<TweetAnswer[]>;
    crawlMultipleReplies(options: CrawlMultipleRepliesOptions): Promise<CrawlRepliesResult[]>;
    getTweetMetrics(options: GetTweetMetricsOptions): Promise<TweetHash | null>;
}
//# sourceMappingURL=RepliesCrawler.d.ts.map