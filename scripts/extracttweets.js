import fs from "fs";

const SCRAPED_DATA_FILE = "data/scraped-tweets/realDonaldTrump.json";
const TARGET_FILE = "data/extracted-tweets/realDonaldTrump.json";

// Read the scraped data from the JSON file
const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_DATA_FILE, "utf-8"));

// Add debug logging
console.log("Total tweets loaded:", scrapedData.length);
console.log("Sample tweet:", JSON.stringify(scrapedData[0], null, 2));

const usernameToMatch = "realDonaldTrump".toLowerCase();

// Extract the text of each tweet
const tweetTexts = scrapedData
    .map((tweet) => {
        // Add debug logging for username check
        console.log("Checking tweet username:", tweet.username);

        if (!tweet.username) {
            console.log("No username found for tweet");
            return null;
        }

        // Try both lowercase and original case matching
        const normalizedUsername = tweet.username.toLowerCase();
        if (normalizedUsername !== usernameToMatch) {
            console.log("Username didn't match:", normalizedUsername);
            return null;
        }

        if (tweet.isRetweet && tweet.retweetedStatus) {
            return tweet.retweetedStatus.text;
        } else {
            return tweet.text;
        }
    })
    .filter((tweet) => tweet !== null);

// Add debug logging
console.log("Extracted tweets count:", tweetTexts.length);

// Create directory if it doesn't exist
fs.mkdirSync("data/extracted-tweets", { recursive: true });

// Write the array of tweet texts to the tweets.json file
fs.writeFileSync(TARGET_FILE, JSON.stringify(tweetTexts, null, 2));

console.log("Tweet texts extracted and saved to", TARGET_FILE);
