import { Scraper } from "agent-twitter-client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const TWEETS_FILE = "davidgoggins-tweets.json";

// Ensure the output directory exists
const outputDir = path.resolve(process.cwd(), 'data', 'scraped-tweets');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const OUTPUT_PATH = path.join(outputDir, TWEETS_FILE);

(async () => {
    try {
        // Create a new instance of the Scraper
        const scraper = new Scraper();

        // Log in to Twitter using the configured environment variables
        await scraper.login(
            process.env.TWITTER_USERNAME,
            process.env.TWITTER_PASSWORD
        );

        // Check if login was successful
        if (await scraper.isLoggedIn()) {
            console.log("Logged in successfully!");

            // Initialize an empty array to store the fetched tweets
            let fetchedTweets = [];

            // Load existing tweets if file exists
            if (fs.existsSync(OUTPUT_PATH)) {
                try {
                    const fileContent = fs.readFileSync(OUTPUT_PATH, "utf-8");
                    fetchedTweets = JSON.parse(fileContent);
                    console.log(`Loaded ${fetchedTweets.length} existing tweets`);
                } catch (error) {
                    console.error("Error loading existing tweets:", error);
                }
            }

            try {
                console.log("Starting to fetch tweets...")
                const tweets = scraper.getTweets("davidgoggins", 2000)
                let count = 0

                for await (const tweet of tweets) {
                    console.log(`Processing tweet ${count + 1}`)

                    console.log("--------------------")
                    console.log("Tweet ID:", tweet.id)
                    console.log("Text:", tweet.text)
                    console.log("Created At:", tweet.createdAt)
                    console.log("Retweets:", tweet.retweetCount)
                    console.log("Likes:", tweet.likeCount)
                    console.log("--------------------")

                    // Add the new tweet to the fetched tweets array
                    fetchedTweets.push(tweet)
                    count++

                    // Save after every 10 tweets
                    if (count % 10 === 0) {
                        try {
                            fs.writeFileSync(
                                OUTPUT_PATH,
                                JSON.stringify(fetchedTweets, null, 2)
                            )
                            console.log(`Saved batch of ${count} tweets to ${OUTPUT_PATH}`)
                        } catch (error) {
                            console.error(`Error saving tweets batch ${count}:`, error)
                        }
                    }
                }

                // Save any remaining tweets
                if (fetchedTweets.length > 0) {
                    fs.writeFileSync(
                        OUTPUT_PATH,
                        JSON.stringify(fetchedTweets, null, 2)
                    )
                    console.log(`Final save: ${fetchedTweets.length} total tweets saved to ${OUTPUT_PATH}`)
                } else {
                    console.log("No tweets were fetched!")
                }
            } catch (error) {
                console.error("Error fetching tweets:", error);
            }

            // Log out from Twitter
            await scraper.logout();
            console.log("Logged out successfully!");
        } else {
            console.log("Login failed. Please check your credentials.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();
