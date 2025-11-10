/**
 * Types related to tweets for Twitter Crawler library
 */
export interface TweetHash {
    username: string;
    created_at: string;
    full_text: string;
    id_str: string;
    views: string;
    tweet_url?: string;
    image_url?: string;
    location?: string;
    in_reply_to_screen_name?: string;
    quote_count?: number;
    reply_count?: number;
    retweet_count?: number;
    favorite_count?: number;
    lang?: string;
    user_id_str?: string;
    conversation_id_str?: string;
    has_quoted_text?: boolean;
    photo_user?: string;
}
export interface TweetAnswer {
    id_tweet?: number;
    full_text: string;
    tweet_url: string;
    image_url?: string;
    location?: string;
    in_reply_to_screen_name?: string;
    views?: number;
    created_at: Date | string;
    id_str: string;
    quote_count: number;
    reply_count: number;
    retweet_count: number;
    favorite_count: number;
    lang: string;
    user_id_str: string;
    conversation_id_str: string;
    usuario_twitter: string;
    has_quoted_text?: boolean;
    photo_user?: string;
    hash_tweet?: string;
    parent_tweet_url?: string;
}
export interface TweetInput {
    id: number;
    tweet_url: string;
    usuario_twitter: string;
}
export interface CrawlRepliesResult {
    tweetId: number;
    repliesCount: number;
    replies: TweetAnswer[];
    success: boolean;
    error?: string;
}
//# sourceMappingURL=Tweet.d.ts.map