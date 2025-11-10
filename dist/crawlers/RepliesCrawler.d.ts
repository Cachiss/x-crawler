import { CrawlRepliesOptions, CrawlMultipleRepliesOptions } from "../types/Config";
import { TweetAnswer, CrawlRepliesResult } from "../types/Tweet";
export declare class RepliesCrawler {
    private authToken;
    private onLog?;
    constructor(authToken: string, onLog?: (message: string) => void);
    private log;
    private clickShowSpamButton;
    private extractRepliesFromPage;
    crawlReplies(options: CrawlRepliesOptions): Promise<TweetAnswer[]>;
    crawlMultipleReplies(options: CrawlMultipleRepliesOptions): Promise<CrawlRepliesResult[]>;
}
//# sourceMappingURL=RepliesCrawler.d.ts.map