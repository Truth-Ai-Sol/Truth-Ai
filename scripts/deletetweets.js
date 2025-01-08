import { TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'

dotenv.config()

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function waitForRateLimit(resetTime) {
    const resetDate = new Date(resetTime * 1000)
    const waitTime = resetDate - new Date()
    console.log(`Rate limited. Waiting until ${resetDate.toLocaleTimeString()}...`)
    await delay(waitTime + 1000) // Add 1 second buffer
}

;(async () => {
    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        })

        console.log("Starting to fetch and delete tweets...")
        let deleted = 0
        let failed = 0

        // First get the authenticated user's ID
        let me
        try {
            me = await client.v2.me()
        } catch (error) {
            if (error.code === 429) {
                await waitForRateLimit(error.rateLimit.reset)
                me = await client.v2.me()
            } else {
                throw error
            }
        }

        // Then fetch their tweets
        let tweets
        try {
            tweets = await client.v2.userTimeline(me.data.id)
        } catch (error) {
            if (error.code === 429) {
                await waitForRateLimit(error.rateLimit.reset)
                tweets = await client.v2.userTimeline(me.data.id)
            } else {
                throw error
            }
        }

        for await (const tweet of tweets) {
            console.log(`\nProcessing tweet:`)
            console.log("--------------------")
            console.log("Tweet ID:", tweet.id)
            console.log("Text:", tweet.text)

            try {
                await client.v2.deleteTweet(tweet.id)
                console.log("✓ Tweet deleted successfully")
                deleted++
                await delay(5000) // Increased delay between deletions
            } catch (error) {
                if (error.code === 429) {
                    await waitForRateLimit(error.rateLimit.reset)
                    await client.v2.deleteTweet(tweet.id)
                    console.log("✓ Tweet deleted successfully (after rate limit)")
                    deleted++
                } else {
                    console.error("✗ Failed to delete tweet:", error)
                    failed++
                }
            }
        }

        console.log("\nDeletion complete!")
        console.log(`Successfully deleted: ${deleted} tweets`)
        console.log(`Failed to delete: ${failed} tweets`)

    } catch (error) {
        console.error("An error occurred:", error)
    }
})()
