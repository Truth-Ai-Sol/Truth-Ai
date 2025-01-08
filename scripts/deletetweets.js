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

// Browser-based deletion method
// To use this method:
// 1. Go to your Twitter profile
// 2. Open browser developer tools (F12)
// 3. Paste this code in the console and press Enter
// This will automatically click through and delete tweets on your profile page
// (async function deleteItems() {
//     let menu = document.querySelector("[data-testid='caret']")

//     while (menu) {
//         // Click the menu button
//         menu.click()
//         console.log("Clicked menu button")
//         await new Promise((resolve) => setTimeout(resolve, 100))

//         // Click the delete button in the menu
//         const deleteButton = document.querySelectorAll("div[role='menuitem']")[0]
//         if (deleteButton) {
//             deleteButton.click()
//             console.log("Clicked delete button")
//             await new Promise((resolve) => setTimeout(resolve, 100))
//         } else {
//             console.log("Delete button not found")
//             break
//         }

//         // Click the confirmation button in the modal
//         const confirmButton = document.querySelector("[data-testid='confirmationSheetConfirm']")
//         if (confirmButton) {
//             confirmButton.click()
//             console.log("Clicked confirmation button")
//             await new Promise((resolve) => setTimeout(resolve, 100))
//         } else {
//             console.log("Confirmation button not found")
//             break
//         }

//         // Reassign menu to check if there are more items to delete
//         menu = document.querySelector("[data-testid='caret']")
//     }
// })()


// (async function deleteReplies() {
//     // Find all tweet elements
//     const tweets = Array.from(document.querySelectorAll('[data-testid="tweet"]'))

//     // Find the first tweet containing "TeeJay"
//     let tweet = tweets.find(tweetEl => {
//         const tweetText = tweetEl.textContent || ''
//         return tweetText.includes('TeeJay')
//     })

//     while (tweet) {
//         // Find the menu button within this specific tweet
//         const menu = tweet.querySelector('[data-testid="caret"]')
//         if (!menu) {
//             console.log("Menu button not found")
//             break
//         }

//         // Click the menu button
//         menu.click()
//         console.log("Clicked menu button")
//         await new Promise((resolve) => setTimeout(resolve, 100))

//         // Click the delete button in the menu
//         const deleteButton = document.querySelectorAll("div[role='menuitem']")[0]
//         if (deleteButton) {
//             deleteButton.click()
//             console.log("Clicked delete button")
//             await new Promise((resolve) => setTimeout(resolve, 100))
//         } else {
//             console.log("Delete button not found")
//             continue
//         }

//         // Click the confirmation button in the modal
//         const confirmButton = document.querySelector("[data-testid='confirmationSheetConfirm']")
//         if (confirmButton) {
//             confirmButton.click()
//             console.log("Clicked confirmation button")
//             await new Promise((resolve) => setTimeout(resolve, 100))
//         } else {
//             console.log("Confirmation button not found")
//             continue
//         }

//         // Add a longer delay between deletions to ensure the UI updates
//         await new Promise((resolve) => setTimeout(resolve, 100))

//         // Find the next tweet containing "TeeJay"
//         const remainingTweets = Array.from(document.querySelectorAll('[data-testid="tweet"]'))
//         tweet = remainingTweets.find(tweetEl => {
//             const tweetText = tweetEl.textContent || ''
//             return tweetText.includes('TeeJay')
//         })
//     }
// })()

// (async function removeLikes() {
//     const unlikeButtons = document.querySelectorAll("[data-testId='unlike']")

//     for (const unlikeButton of unlikeButtons) {
//         unlikeButton.click()
//         console.log("Clicked unlike button")
//     }
// })()

