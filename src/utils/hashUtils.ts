/**
 * Utilities for tweet hash generation
 */
import crypto from "crypto";
import { TweetHash } from "../types/Tweet";

/**
 * Generates a unique hash for a tweet based on immutable data
 * @param tweet Tweet data
 * @returns SHA256 hash in hexadecimal
 */
export function generateTweetHash(tweet: Partial<TweetHash>): string {
  const data = `${tweet.username}_${tweet.created_at}_${tweet.id_str}_${tweet.full_text}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

