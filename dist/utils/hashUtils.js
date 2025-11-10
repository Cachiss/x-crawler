"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTweetHash = generateTweetHash;
/**
 * Utilities for tweet hash generation
 */
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a unique hash for a tweet based on immutable data
 * @param tweet Tweet data
 * @returns SHA256 hash in hexadecimal
 */
function generateTweetHash(tweet) {
    const data = `${tweet.username}_${tweet.created_at}_${tweet.id_str}_${tweet.full_text}`;
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
}
//# sourceMappingURL=hashUtils.js.map