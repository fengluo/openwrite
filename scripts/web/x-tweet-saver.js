const process = require('process');
const fs = require('fs');
const path = require('path');
// require('dotenv').config(); // Load .env file
const { downloadMedia, parseTweetData, generateMarkdown } = require('./utils'); // Import utility functions

// --- Configuration ---
const TWEETS_DIR = '03_Resources/Tweets/';
const ATTACHMENTS_DIR = '05_Attachments/Tweets/';
const CONFIG_FILE = path.join(__dirname, '../config/x-config.json');

// Ensure directories exist
fs.mkdirSync(TWEETS_DIR, { recursive: true });
fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });

// --- Argument Parsing ---
const args = process.argv.slice(2);

let tweetUrl = null;
let fetchLikes = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
        tweetUrl = args[i + 1];
        i++;
    } else if (args[i] === '--likes') {
        fetchLikes = true;
    }
}

if (!tweetUrl && !fetchLikes) {
    console.log('Usage: node scripts/web/x-tweet-saver.js [--url <tweet_url>] [--likes]');
    process.exit(1);
}

// --- Config Loading ---
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading config file:', error);
    }
    return {};
}

const config = loadConfig();

let X_AUTH_TOKEN = config.X_AUTH_TOKEN;
let X_CT0 = config.X_CT0;
const X_USER_ID = config.X_USER_ID;
const X_COOKIE = config.X_COOKIE;

// Handle potential prefixes from copy-pasting cookies
if (X_AUTH_TOKEN && X_AUTH_TOKEN.startsWith('auth_token=')) {
    X_AUTH_TOKEN = X_AUTH_TOKEN.replace('auth_token=', '');
}
if (X_CT0 && X_CT0.startsWith('ct0=')) {
    X_CT0 = X_CT0.replace('ct0=', '');
}

// Extract ct0 from X_COOKIE if X_CT0 is missing
if (X_COOKIE && !X_CT0) {
    const match = X_COOKIE.match(/ct0=([^;]+)/);
    if (match) {
        X_CT0 = match[1];
        console.log(`Extracted X_CT0 from X_COOKIE: ${X_CT0.substring(0, 4)}...`);
    }
}

if (X_AUTH_TOKEN) {
    console.log(`X_AUTH_TOKEN loaded: ${X_AUTH_TOKEN.substring(0, 4)}... (Length: ${X_AUTH_TOKEN.length})`);
} else if (!X_COOKIE) {
    console.error('Error: X_AUTH_TOKEN is missing or empty, and X_COOKIE is not provided.');
}

if (X_CT0) {
    console.log(`X_CT0 loaded: ${X_CT0.substring(0, 4)}... (Length: ${X_CT0.length})`);
} else {
    console.error('Error: X_CT0 is missing or empty (could not be extracted from X_COOKIE).');
}

if ((!X_AUTH_TOKEN && !X_COOKIE) || !X_CT0) {
    console.error(`Error: You must provide either X_COOKIE (recommended) OR (X_AUTH_TOKEN and X_CT0) in your ${CONFIG_FILE} file.`);
    process.exit(1);
}

if (fetchLikes && !X_USER_ID) {
    console.error(`Error: X_USER_ID must be set in your ${CONFIG_FILE} file to fetch likes.`);
    process.exit(1);
}

console.log('Tweet URL:', tweetUrl);
console.log('Fetch Likes:', fetchLikes);

// --- Main Logic ---
function updateConfig(updates) {
    try {
        const currentConfig = loadConfig();
        const newConfig = { ...currentConfig, ...updates };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
        Object.assign(config, newConfig);
    } catch (error) {
        console.error('Error saving config file:', error);
    }
}

async function fetchTweetDetail(url) {
    const tweetIdMatch = url.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) {
        console.error('Invalid tweet URL:', url);
        return null;
    }
    const tweetId = tweetIdMatch[1];

    const variables = {
        tweetId: tweetId,
        includePromotedContent: true,
        withBirdwatchNotes: true,
        withVoice: true,
        withCommunity: true
    };

    const features = {
        creator_subscriptions_tweet_preview_api_enabled: true,
        premium_content_api_read_enabled: false,
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        responsive_web_grok_analyze_button_fetch_trends_enabled: false,
        responsive_web_grok_analyze_post_followups_enabled: true,
        responsive_web_jetfuel_frame: true,
        responsive_web_grok_share_attachment_enabled: true,
        responsive_web_grok_annotations_enabled: false,
        articles_preview_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        responsive_web_grok_show_grok_translated_post: false,
        responsive_web_grok_analysis_button_from_backend: true,
        post_ctas_fetch_enabled: true,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        profile_label_improvements_pcf_label_in_post_enabled: true,
        responsive_web_profile_redirect_enabled: false,
        rweb_tipjar_consumption_enabled: true,
        verified_phone_label_enabled: false,
        responsive_web_grok_image_annotation_enabled: true,
        responsive_web_grok_imagine_annotation_enabled: true,
        responsive_web_grok_community_note_auto_translation_is_enabled: false,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_enhance_cards_enabled: false
    };

    const fieldToggles = {
        withArticleRichContentState: true,
        withArticlePlainText: false
    };

    const queryId = "YTLCpNxePO-aAmb57DAblw";

    // Serialize parameters for GET request
    const params = new URLSearchParams();
    params.append('variables', JSON.stringify(variables));
    params.append('features', JSON.stringify(features));
    params.append('fieldToggles', JSON.stringify(fieldToggles));

    const graphqlUrl = `https://x.com/i/api/graphql/${queryId}/TweetResultByRestId?${params.toString()}`;

    try {
        const response = await fetch(graphqlUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'x-twitter-active-user': 'yes',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-csrf-token': X_CT0,
                'Cookie': X_COOKIE || `auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const parsedTweet = parseTweetData(data.data.tweetResult.result);

        if (parsedTweet) {
            // Download media for single tweet
            if (parsedTweet.mediaList && parsedTweet.mediaList.length > 0) {
                console.log('Found media:', parsedTweet.mediaList.length);
                for (const item of parsedTweet.mediaList) {
                    await downloadMedia(item.url, item.filename, ATTACHMENTS_DIR);
                }
            }

            const markdownContent = generateMarkdown(parsedTweet);
            if (markdownContent) {
                const datePrefix = parsedTweet.createdAt ? parsedTweet.createdAt.split('T')[0] : '';
                const filename = `${TWEETS_DIR}${datePrefix ? datePrefix + '-' : ''}${parsedTweet.userScreenName}-${parsedTweet.id}.md`;
                fs.writeFileSync(filename, markdownContent);
                console.log(`Saved tweet to ${filename}`);
            }
        }
        return data;

    } catch (error) {
        console.error('Error fetching tweet detail:', error);
        return null;
    }
}

async function fetchLikedTweets() {
    let userId = X_USER_ID;

    // Try to extract numeric ID if it's a Global ID (User:123...)
    try {
        if (userId && !/^\d+$/.test(userId)) {
             const decoded = Buffer.from(userId, 'base64').toString('utf-8');
             if (decoded.startsWith('User:')) {
                 userId = decoded.split(':')[1];
                 console.log(`Converted Global ID ${X_USER_ID} to numeric ID ${userId}`);
             }
        }
    } catch (e) {
        // If decoding fails, assume it is already correct or will fail later
    }

    // GraphQL Query ID for Likes
    const queryId = "WsqDNb0R6LiZS9SW6ZF3-w";

    const lastLikedTweetId = config.lastLikedTweetId;
    console.log('Last synced liked tweet ID:', lastLikedTweetId);

    let cursor = null;
    let hasNextPage = true;
    const likedTweets = [];
    const MAX_LIKES_TO_FETCH = 100; // Limit to prevent excessive fetching for now
    let newLastLikedTweetId = null;
    let stopFetching = false;

    while (hasNextPage && likedTweets.length < MAX_LIKES_TO_FETCH && !stopFetching) {
        const variables = {
            userId: userId,
            count: 20, // Number of tweets per page
            includePromotedContent: false, // Changed from true to match browser
            withClientEventToken: false, // Added
            withBirdwatchNotes: false, // Added
            withVoice: true, // Added
            cursor: cursor // Pagination cursor
        };

        const features = {
            rweb_video_screen_enabled: false,
            profile_label_improvements_pcf_label_in_post_enabled: true,
            responsive_web_profile_redirect_enabled: false,
            rweb_tipjar_consumption_enabled: true,
            verified_phone_label_enabled: false,
            creator_subscriptions_tweet_preview_api_enabled: true,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            premium_content_api_read_enabled: false,
            communities_web_enable_tweet_community_results_fetch: true,
            c9s_tweet_anatomy_moderator_badge_enabled: true,
            responsive_web_grok_analyze_button_fetch_trends_enabled: false,
            responsive_web_grok_analyze_post_followups_enabled: true,
            responsive_web_jetfuel_frame: true,
            responsive_web_grok_share_attachment_enabled: true,
            responsive_web_grok_annotations_enabled: false,
            articles_preview_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            responsive_web_twitter_article_tweet_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            responsive_web_grok_show_grok_translated_post: true,
            responsive_web_grok_analysis_button_from_backend: true,
            post_ctas_fetch_enabled: true,
            creator_subscriptions_quote_tweet_preview_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: true,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
            longform_notetweets_rich_text_read_enabled: true,
            longform_notetweets_inline_media_enabled: true,
            responsive_web_grok_image_annotation_enabled: true,
            responsive_web_grok_imagine_annotation_enabled: true,
            responsive_web_grok_community_note_auto_translation_is_enabled: false,
            responsive_web_enhance_cards_enabled: false
        };

        const fieldToggles = {
            withArticlePlainText: false
        };

        const params = new URLSearchParams();
        params.append('variables', JSON.stringify(variables));
        params.append('features', JSON.stringify(features));
        params.append('fieldToggles', JSON.stringify(fieldToggles));

        const graphqlUrl = `https://x.com/i/api/graphql/${queryId}/Likes?${params.toString()}`;

        console.log('Requesting URL:', graphqlUrl); // Debugging
        // console.log('Variables:', JSON.stringify(variables, null, 2));
        // console.log('Features:', JSON.stringify(features, null, 2));

        try {
            const response = await fetch(graphqlUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                    'x-twitter-active-user': 'yes',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'x-csrf-token': X_CT0,
                    'Cookie': X_COOKIE || `auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const instructions = data.data.user.result.timeline.timeline.instructions;
            const entries = instructions.find(i => i.type === 'TimelineAddEntries')?.entries;

            if (!entries) {
                console.log('No entries found in timeline.');
                hasNextPage = false;
                continue;
            }

            const tweets = entries.filter(entry => entry.entryId.startsWith('tweet-')).map(entry => entry.content.itemContent.tweet_results.result);

            for (const tweetResult of tweets) {
                const parsedTweet = parseTweetData(tweetResult);
                if (parsedTweet) {
                    // Check if we reached the last synced tweet
                    if (lastLikedTweetId && parsedTweet.id === lastLikedTweetId) {
                        console.log('Reached last synced tweet. Stopping.');
                        stopFetching = true;
                        break;
                    }

                    // Capture the ID of the very first tweet we process (the newest one)
                    if (!newLastLikedTweetId) {
                        newLastLikedTweetId = parsedTweet.id;
                    }

                    console.log(`Processing liked tweet: ${parsedTweet.url}`);
                    // Download media for liked tweets
                    if (parsedTweet.mediaList && parsedTweet.mediaList.length > 0) {
                        for (const item of parsedTweet.mediaList) {
                            await downloadMedia(item.url, item.filename, ATTACHMENTS_DIR);
                        }
                    }

                    const markdownContent = generateMarkdown(parsedTweet);
                    if (markdownContent) {
                        const datePrefix = parsedTweet.createdAt ? parsedTweet.createdAt.split('T')[0] : '';
                        const filename = `${TWEETS_DIR}${datePrefix ? datePrefix + '-' : ''}${parsedTweet.userScreenName}-${parsedTweet.id}.md`;
                        fs.writeFileSync(filename, markdownContent);
                        console.log(`Saved liked tweet to ${filename}`);
                    }

                    likedTweets.push(parsedTweet);
                }
            }

            if (stopFetching) break;

            const bottomCursorEntry = entries.find(entry => entry.entryId.startsWith('cursor-bottom'));
            if (bottomCursorEntry) {
                cursor = bottomCursorEntry.content.value;
                hasNextPage = bottomCursorEntry.content.cursorType === 'Bottom';
            } else {
                hasNextPage = false;
            }

        } catch (error) {
            console.error('Error fetching liked tweets:', error);
            hasNextPage = false;
        }
    }

    // Update state if we processed any new tweets
    if (newLastLikedTweetId) {
        updateConfig({
            lastLikedTweetId: newLastLikedTweetId,
            lastSyncTime: new Date().toISOString()
        });
        console.log(`Updated state with new lastLikedTweetId: ${newLastLikedTweetId}`);
    } else {
        console.log('No new likes found.');
    }

    return likedTweets;
}

async function main() {
    if (tweetUrl) {
        console.log('Fetching single tweet:', tweetUrl);
        await fetchTweetDetail(tweetUrl);
    } else if (fetchLikes) {
        console.log('Fetching liked tweets...');
        await fetchLikedTweets();
    }
}

main().catch(console.error);
