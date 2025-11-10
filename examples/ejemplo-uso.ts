/**
 * Twitter Crawler library usage examples
 * 
 * This file shows how to use the different functionalities of the library
 */

import { TwitterCrawler } from '../src/index';
import type { TweetHash, TweetAnswer, CrawlRepliesResult } from '../src/index';

/**
 * Example 1: Basic initialization
 */
async function exampleInitialization() {
  console.log('=== Example 1: Initialization ===');
  
  // Initialize with required token
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here',
    configType: 'default' // optional: 'default' | 'aggressive' | 'conservative'
  });
  
  console.log('Crawler initialized successfully');
  return crawler;
}

/**
 * Example 2: Crawl tweets by keywords
 */
async function exampleCrawlTweetsByKeywords() {
  console.log('\n=== Example 2: Crawl tweets by keywords ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'javascript typescript',
    targetCount: 50,
    searchTab: 'LATEST', // 'LATEST' | 'TOP'
    searchFromDate: '2024-01-01',
    searchToDate: '2024-12-31',
    onLog: (message) => {
      console.log(`[LOG] ${message}`);
    },
    onProgress: (progress) => {
      console.log(`[PROGRESS] Tweets collected: ${progress.collectedTweets}`);
    }
  });
  
  console.log(`Collected ${tweets.length} tweets`);
  console.log('First tweet:', tweets[0]);
  
  return tweets;
}

/**
 * Example 3: Crawl tweets by users
 */
async function exampleCrawlTweetsByUsers() {
  console.log('\n=== Example 3: Crawl tweets by users ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  const tweets = await crawler.crawlTweets({
    searchUsernames: ['user1', 'user2'],
    targetCount: 100,
    searchTab: 'LATEST',
    onLog: (message) => console.log(`[LOG] ${message}`)
  });
  
  console.log(`Collected ${tweets.length} tweets from specified users`);
  
  return tweets;
}

/**
 * Example 4: Crawl complete thread of a tweet
 */
async function exampleCrawlThread() {
  console.log('\n=== Example 4: Crawl complete thread ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  const tweets = await crawler.crawlTweets({
    tweetThreadUrl: 'https://x.com/user/status/1234567890',
    targetCount: -1, // -1 for unlimited
    onLog: (message) => console.log(`[LOG] ${message}`)
  });
  
  console.log(`Collected ${tweets.length} tweets from thread`);
  
  return tweets;
}

/**
 * Example 5: Crawl replies from a tweet
 */
async function exampleCrawlReplies() {
  console.log('\n=== Example 5: Crawl replies from a tweet ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  const replies = await crawler.crawlReplies({
    tweetUrl: 'https://x.com/user/status/1234567890',
    idTweet: 1, // optional: tweet ID in your database
    maxReplies: 50, // -1 for unlimited
    onLog: (message) => console.log(`[LOG] ${message}`)
  });
  
  console.log(`Collected ${replies.length} replies`);
  console.log('First reply:', replies[0]);
  
  return replies;
}

/**
 * Example 6: Crawl replies from multiple tweets
 */
async function exampleCrawlMultipleReplies() {
  console.log('\n=== Example 6: Crawl replies from multiple tweets ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  const tweets = [
    { 
      id: 1, 
      tweet_url: 'https://x.com/user1/status/1234567890', 
      usuario_twitter: 'user1' 
    },
    { 
      id: 2, 
      tweet_url: 'https://x.com/user2/status/0987654321', 
      usuario_twitter: 'user2' 
    }
  ];
  
  const results = await crawler.crawlMultipleReplies({
    tweets: tweets,
    maxReplies: 50, // -1 for unlimited
    onLog: (message) => console.log(`[LOG] ${message}`)
  });
  
  console.log(`Processed ${results.length} tweets`);
  console.log(`Successful tweets: ${results.filter(r => r.success).length}`);
  console.log(`Failed tweets: ${results.filter(r => !r.success).length}`);
  
  // Show results per tweet
  results.forEach(result => {
    console.log(`Tweet ${result.tweetId}: ${result.repliesCount} replies - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  return results;
}

/**
 * Example 7: Use aggressive configuration
 */
async function exampleAggressiveConfig() {
  console.log('\n=== Example 7: Aggressive configuration ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here',
    configType: 'aggressive' // Faster but riskier
  });
  
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'keyword',
    targetCount: 200,
    onLog: (message) => console.log(`[LOG] ${message}`)
  });
  
  console.log(`Collected ${tweets.length} tweets with aggressive configuration`);
  
  return tweets;
}

/**
 * Example 8: Change configuration dynamically
 */
async function exampleChangeConfig() {
  console.log('\n=== Example 8: Change configuration dynamically ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here',
    configType: 'default'
  });
  
  console.log('Initial configuration:', crawler.getConfig().TOKEN_ROTATION_THRESHOLD);
  
  // Change to conservative
  crawler.setConfigType('conservative');
  console.log('Configuration after change:', crawler.getConfig().TOKEN_ROTATION_THRESHOLD);
  
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'keyword',
    targetCount: 50
  });
  
  console.log(`Collected ${tweets.length} tweets with conservative configuration`);
  
  return tweets;
}

/**
 * Example 9: Use token pool for rotation
 */
async function exampleTokenPool() {
  console.log('\n=== Example 9: Token pool for rotation ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'main_token',
    authTokensPool: [
      'secondary_token_1',
      'secondary_token_2',
      'secondary_token_3'
    ],
    configType: 'default'
  });
  
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'keyword',
    targetCount: 500, // With many tweets, tokens will rotate automatically
    onLog: (message) => {
      if (message.includes('Rotating token')) {
        console.log(`[TOKEN ROTATION] ${message}`);
      }
    }
  });
  
  console.log(`Collected ${tweets.length} tweets with token rotation`);
  
  return tweets;
}

/**
 * Example 10: Process and save results
 */
async function exampleProcessResults() {
  console.log('\n=== Example 10: Process and save results ===');
  
  const crawler = TwitterCrawler.init({
    authToken: 'your_token_here'
  });
  
  // Crawl tweets
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'javascript',
    targetCount: 100
  });
  
  // Process results
  const processedTweets = tweets.map(tweet => ({
    id: tweet.id_str,
    user: tweet.username,
    text: tweet.full_text,
    date: tweet.created_at,
    url: tweet.tweet_url,
    retweets: tweet.retweet_count,
    likes: tweet.favorite_count,
    views: tweet.views
  }));
  
  console.log(`Processed ${processedTweets.length} tweets`);
  console.log('Example processed tweet:', processedTweets[0]);
  
  // Here you could save to database, JSON file, Excel, etc.
  // Example: save to JSON
  // const fs = require('fs');
  // fs.writeFileSync('tweets.json', JSON.stringify(processedTweets, null, 2));
  
  return processedTweets;
}

/**
 * Main function that runs all examples
 */
async function main() {
  try {
    // Uncomment the example you want to run:
    
    // await exampleInitialization();
    // await exampleCrawlTweetsByKeywords();
    // await exampleCrawlTweetsByUsers();
    // await exampleCrawlThread();
    // await exampleCrawlReplies();
    // await exampleCrawlMultipleReplies();
    // await exampleAggressiveConfig();
    // await exampleChangeConfig();
    // await exampleTokenPool();
    // await exampleProcessResults();
    
    console.log('\nAll examples are ready to use');
    console.log('Uncomment the example you want to run in the main() function');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export {
  exampleInitialization,
  exampleCrawlTweetsByKeywords,
  exampleCrawlTweetsByUsers,
  exampleCrawlThread,
  exampleCrawlReplies,
  exampleCrawlMultipleReplies,
  exampleAggressiveConfig,
  exampleChangeConfig,
  exampleTokenPool,
  exampleProcessResults
};
