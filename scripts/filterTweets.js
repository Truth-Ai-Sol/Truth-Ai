// Filter high-engagement tweets from extracted tweets JSON file
import { readFileSync, writeFileSync } from 'fs'

// const EXTRACTED_DATA_FILE = "data/extracted-tweets/TateTheTalisman.json";
const EXTRACTED_DATA_FILE = "data/extracted-tweets/TateTheTalisman-filtered.json";
const TARGET_FILE = "data/extracted-tweets/TateTheTalisman-filtered.json";


function filterHighEngagementTweets({ inputPath, outputPath }) {
  try {
    // Read and parse JSON file
    const tweets = JSON.parse(readFileSync(inputPath, 'utf-8'))

    // Add engagement score and sort
    const tweetsWithScore = tweets
      .map(tweet => ({
        ...tweet,
        engagementScore: tweet.engagement.likes + tweet.engagement.replies
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)

    // Keep top 50%
    const halfLength = Math.ceil(tweetsWithScore.length / 2)
    const topTweets = tweetsWithScore
      .slice(0, halfLength)
      .map(({ engagementScore, ...tweet }) => tweet)

    // Write filtered tweets back to file
    writeFileSync(
      outputPath,
      JSON.stringify(topTweets, null, 2),
      'utf-8'
    )

    console.log(`Successfully filtered tweets. Kept ${topTweets.length} out of ${tweets.length}`)

  } catch (error) {
    console.error('Error filtering tweets:', error)
  }
}

filterHighEngagementTweets({
    inputPath: EXTRACTED_DATA_FILE,
    outputPath: TARGET_FILE
})
