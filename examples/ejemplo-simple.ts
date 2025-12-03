/**
 * Simple and quick example of using the Twitter Crawler library
 */

import { TwitterCrawler } from '../src/index';

async function simpleExample() {
  // 1. Initialize the crawler (required)
  const crawler = TwitterCrawler.init({
    authToken: '' // Replace with your real token
  });
  
  // 2. Crawl tweets by keywords
  console.log('Starting tweet crawl...');
  const tweets = await crawler.crawlTweets({
    searchKeywords: 'javascript',
    targetCount: 10,
    searchTab: 'LATEST',
    onLog: (message) => console.log(message),
    onProgress: (progress) => {
      console.log(`Progress: ${progress.collectedTweets} tweets collected`);
    }
  });
  
  console.log(`\nCompleted! Collected ${tweets.length} tweets`);
  console.log('\nFirst tweet:', tweets[0]);
  
  // 3. Crawl replies from a tweet
  if (tweets.length > 0) {
    console.log('\n\nCrawling replies from first tweet...');
    const replies = await crawler.crawlReplies({
      tweetUrl: tweets[0].tweet_url!,
      maxReplies: 5,
      onLog: (message) => console.log(message)
    });

    console.log(`\nCollected ${replies.length} replies`);
  }

  // 4. Get metrics from a specific tweet
  console.log('\n\nGetting metrics from a specific tweet...');
  const tweetMetrics = await crawler.getTweetMetrics({
    tweetUrl: 'https://x.com/lopezdoriga/status/1995893221839245382',
    onLog: (message) => console.log(message)
  });

  if (tweetMetrics) {
    console.log('\nTweet metrics:');
    console.log(`ID: ${tweetMetrics.id_str}`);
    console.log(`Username: @${tweetMetrics.username}`);
    console.log(`Text: ${tweetMetrics.full_text}`);
    console.log(`Views: ${tweetMetrics.views}`);
    console.log(`Replies: ${tweetMetrics.reply_count}`);
    console.log(`Retweets: ${tweetMetrics.retweet_count}`);
    console.log(`Quotes: ${tweetMetrics.quote_count}`);
    console.log(`Likes: ${tweetMetrics.favorite_count}`);
  } else {
    console.log('Could not extract tweet metrics');
  }
}

// Execute
simpleExample().catch(console.error);

