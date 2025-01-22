import fs from "fs";

const SCRAPED_DATA_FILE = "data/scraped-tweets/davidgoggins-tweets.json";
const TARGET_FILE = "data/extracted-tweets/davidgoggins.json";

// Read the scraped data from the JSON file
const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_DATA_FILE, "utf-8"));

console.log("Total tweets loaded:", scrapedData.length);
console.log("Sample tweet:", JSON.stringify(scrapedData[0], null, 2));

const usernameToMatch = "davidgoggins".toLowerCase();

// Extract tweet data with additional metadata
const extractedTweets = scrapedData
    .map((tweet) => {
        if (!tweet.username) {
            console.log("No username found for tweet");
            return null;
        }

        const normalizedUsername = tweet.username.toLowerCase();
        if (normalizedUsername !== usernameToMatch) {
            console.log("Username didn't match:", normalizedUsername);
            return null;
        }

        // Handle retweets
        if (tweet.isRetweet && tweet.retweetedStatus) {
            return {
                type: "retweet",
                text: tweet.retweetedStatus.text,
                originalText: tweet.text,
                originalAuthor: tweet.retweetedStatus.username,
                engagement: {
                    likes: tweet.retweetedStatus.likes,
                    replies: tweet.retweetedStatus.replies,
                    retweets: tweet.retweetedStatus.retweets,
                    views: tweet.retweetedStatus.views || 0,
                    bookmarks: tweet.retweetedStatus.bookmarkCount || 0
                },
                metadata: {
                    id: tweet.id,
                    conversationId: tweet.conversationId,
                    timestamp: tweet.timestamp,
                    timeParsed: tweet.timeParsed
                },
                media: {
                    hasPhotos: tweet.photos?.length > 0,
                    hasVideos: tweet.videos?.length > 0,
                    photos: tweet.photos || [],
                    videos: tweet.videos || []
                }
            };
        }

        // Handle quotes
        if (tweet.isQuoted && tweet.quotedStatus) {
            return {
                type: "quote",
                text: tweet.text,
                quotedText: tweet.quotedStatus.text,
                quotedAuthor: tweet.quotedStatus.username,
                engagement: {
                    likes: tweet.likes,
                    replies: tweet.replies,
                    retweets: tweet.retweets,
                    views: tweet.views || 0,
                    bookmarks: tweet.bookmarkCount || 0
                },
                metadata: {
                    id: tweet.id,
                    conversationId: tweet.conversationId,
                    timestamp: tweet.timestamp,
                    timeParsed: tweet.timeParsed
                },
                media: {
                    hasPhotos: tweet.photos?.length > 0,
                    hasVideos: tweet.videos?.length > 0,
                    photos: tweet.photos || [],
                    videos: tweet.videos || []
                }
            };
        }

        // Handle replies
        if (tweet.isReply) {
            return {
                type: "reply",
                text: tweet.text,
                inReplyToId: tweet.inReplyToStatusId,
                engagement: {
                    likes: tweet.likes,
                    replies: tweet.replies,
                    retweets: tweet.retweets,
                    views: tweet.views || 0,
                    bookmarks: tweet.bookmarkCount || 0
                },
                metadata: {
                    id: tweet.id,
                    conversationId: tweet.conversationId,
                    timestamp: tweet.timestamp,
                    timeParsed: tweet.timeParsed
                },
                media: {
                    hasPhotos: tweet.photos?.length > 0,
                    hasVideos: tweet.videos?.length > 0,
                    photos: tweet.photos || [],
                    videos: tweet.videos || []
                }
            };
        }

        // Handle regular posts
        return {
            type: "post",
            text: tweet.text,
            engagement: {
                likes: tweet.likes,
                replies: tweet.replies,
                retweets: tweet.retweets,
                views: tweet.views || 0,
                bookmarks: tweet.bookmarkCount || 0
            },
            metadata: {
                id: tweet.id,
                conversationId: tweet.conversationId,
                timestamp: tweet.timestamp,
                timeParsed: tweet.timeParsed
            },
            media: {
                hasPhotos: tweet.photos?.length > 0,
                hasVideos: tweet.videos?.length > 0,
                photos: tweet.photos || [],
                videos: tweet.videos || []
            }
        };
    })
    .filter((tweet) => tweet !== null);

// Add debug logging
console.log("Extracted tweets count:", extractedTweets.length);

// Create directory if it doesn't exist
fs.mkdirSync("data/extracted-tweets", { recursive: true });

// Write the extracted tweet data to the file
fs.writeFileSync(TARGET_FILE, JSON.stringify(extractedTweets, null, 2));

console.log("Tweet data extracted and saved to", TARGET_FILE);

// Optional: Generate some basic analytics
const analytics = {
    total: extractedTweets.length,
    byType: {
        posts: extractedTweets.filter(t => t.type === "post").length,
        replies: extractedTweets.filter(t => t.type === "reply").length,
        retweets: extractedTweets.filter(t => t.type === "retweet").length,
        quotes: extractedTweets.filter(t => t.type === "quote").length
    },
    withMedia: extractedTweets.filter(t => t.media.hasPhotos || t.media.hasVideos).length,
    averageEngagement: {
        likes: Math.floor(extractedTweets.reduce((acc, t) => acc + t.engagement.likes, 0) / extractedTweets.length),
        retweets: Math.floor(extractedTweets.reduce((acc, t) => acc + t.engagement.retweets, 0) / extractedTweets.length),
        replies: Math.floor(extractedTweets.reduce((acc, t) => acc + t.engagement.replies, 0) / extractedTweets.length)
    }
};

console.log("\nAnalytics:", JSON.stringify(analytics, null, 2));
