// Placeholder for utility functions
const fs = require('fs');
const path = require('path');

async function downloadMedia(mediaUrl, filename, ATTACHMENTS_DIR) {
    try {
        const response = await fetch(mediaUrl);
        if (!response.ok) {
            throw new Error(`Failed to download media: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = path.join(ATTACHMENTS_DIR, filename);

        fs.writeFileSync(filePath, buffer);
        console.log(`Downloaded: ${filePath}`);
        return filename;
    } catch (error) {
        console.error(`Error downloading media from ${mediaUrl}:`, error);
        return null;
    }
}

function parseTweetData(tweetResult) {
    const tweet = tweetResult?.legacy;
    const noteTweetResult = tweetResult?.note_tweet?.note_tweet_results?.result;
    const articleResult = tweetResult?.article?.article_results?.result;

    // Source
    const source = tweetResult?.source || tweet?.source || (articleResult ? 'X Article' : '');

    // User Data
    const userResult = tweetResult?.core?.user_results?.result;
    const userLegacy = userResult?.legacy || {};
    const userCore = userResult?.core || {};

    const userName = userLegacy.name || userCore.name;
    const userScreenName = userLegacy.screen_name || userCore.screen_name;
    const userProfileImageUrl = userLegacy.profile_image_url_https || userResult?.avatar?.image_url;

    if ((!tweet && !articleResult) || !userScreenName) {
        console.error("Could not parse tweet or user data.");
        if (tweetResult) {
            console.log("TweetResult keys:", Object.keys(tweetResult));
        }
        return null;
    }

    const id = tweet?.id_str || articleResult?.rest_id || tweetResult?.rest_id;
    let fullText = '';
    let mediaList = [];

    // Date
    let createdAt = tweet?.created_at;
    if (createdAt) {
        // Convert Twitter date format to ISO
        createdAt = new Date(createdAt).toISOString();
    } else if (articleResult?.metadata?.first_published_at_secs) {
        createdAt = new Date(articleResult.metadata.first_published_at_secs * 1000).toISOString();
    } else {
        createdAt = new Date().toISOString();
    }

    // 1. Extract Media Candidates
    if (articleResult) {
         if (articleResult.cover_media?.media_info?.original_img_url) {
             mediaList.push({
                 url: articleResult.cover_media.media_info.original_img_url,
                 type: 'photo',
                 id: articleResult.cover_media.media_id || 'cover'
             });
         }
         if (articleResult.media_entities) {
             articleResult.media_entities.forEach(m => {
                 if (m.media_info?.original_img_url) {
                      mediaList.push({
                          url: m.media_info.original_img_url,
                          type: 'photo',
                          id: m.media_id
                      });
                 }
             });
         }
    } else {
        const media = tweet?.extended_entities?.media || [];
        media.forEach(item => {
             let url = item.media_url_https;
             let type = 'photo';
             if (item.type === 'video' || item.type === 'animated_gif') {
                 type = 'video';
                 const videoUrl = item.video_info?.variants.reduce((prev, current) => {
                     return (prev.bitrate || 0) > (current.bitrate || 0) ? prev : current;
                 })?.url;
                 if (videoUrl) url = videoUrl;
             }
             mediaList.push({
                 url: url,
                 type: type,
                 id: item.id_str
             });
        });
    }

    // 2. Assign Filenames
    mediaList.forEach(item => {
        // Sanitize IDs
        const safeId = id.replace(/[^a-zA-Z0-9]/g, '_');
        const safeItemId = String(item.id).replace(/[^a-zA-Z0-9]/g, '_');
        // Extract extension from URL, preserving query params is bad for extname, so use pathname
        let ext = path.extname(new URL(item.url).pathname);
        if (!ext || ext.length > 5) ext = '.jpg'; // Fallback
        item.filename = `${safeId}_${safeItemId}${ext}`;
    });

    // Helper for Markdown embedding
    const getMediaMarkdown = (mediaId) => {
        const item = mediaList.find(m => m.id === mediaId);
        if (!item) return '';
        if (item.type === 'video') {
             return `<video src="../../../05_Attachments/Tweets/${item.filename}" controls width="100%"></video>`;
        }
        return `![${item.filename}](../../../05_Attachments/Tweets/${item.filename})`;
    };

    // 3. Build Full Text (with embedded media)
    if (articleResult) {
        const title = articleResult.title || 'Untitled';
        fullText = `# ${title}\n\n`;
        const blocks = articleResult.content_state?.blocks || [];
        let entityMap = articleResult.content_state?.entityMap || {};
        // Normalize entityMap array to object
        if (Array.isArray(entityMap)) {
            const mapObj = {};
            entityMap.forEach(item => {
                mapObj[item.key] = item.value;
            });
            entityMap = mapObj;
        }

        blocks.forEach(block => {
            if (block.type === 'atomic' && block.entityRanges.length > 0) {
                const entityKey = block.entityRanges[0].key;
                const entity = entityMap[entityKey];
                if (entity && entity.type === 'MEDIA' && entity.data?.mediaItems?.length > 0) {
                    const mediaId = entity.data.mediaItems[0].mediaId;
                    fullText += getMediaMarkdown(mediaId) + '\n\n';
                    return; // Skip text for atomic media blocks
                }
            }

            switch (block.type) {
                case 'header-one': fullText += `# ${block.text}\n\n`; break;
                case 'header-two': fullText += `## ${block.text}\n\n`; break;
                case 'header-three': fullText += `### ${block.text}\n\n`; break;
                case 'blockquote': fullText += `> ${block.text}\n\n`; break;
                case 'unordered-list-item': fullText += `- ${block.text}\n`; break;
                case 'ordered-list-item': fullText += `1. ${block.text}\n`; break;
                case 'code-block': fullText += `\`\`\`\n${block.text}\n\`\`\`\n\n`; break;
                default: fullText += `${block.text}\n\n`;
            }
        });

        // Append cover image if not inline? Usually cover is header.
        // Let's prepend cover image if it exists and isn't inline (though Articles usually treat cover separate)
        // For now, let's append any media NOT inserted to be safe.
        // Actually, let's mark inserted items.
        // The block loop above handles inserted media.
        // We should check 'cover' media.
        const coverItem = mediaList.find(m => m.id === 'cover');
        if (coverItem) {
            // Insert cover after title
            fullText = fullText.replace(`# ${title}\n\n`, `# ${title}\n\n${getMediaMarkdown('cover')}\n\n`);
            coverItem._inserted = true;
        }

    } else {
        // Standard / Note Tweet
        fullText = noteTweetResult?.text || tweet.full_text;

        // Inline Media Replacement
        const mediaItems = tweet?.extended_entities?.media || [];
        mediaItems.forEach(mItem => {
             const tcoUrl = mItem.url;
             if (fullText.includes(tcoUrl)) {
                 const item = mediaList.find(i => i.id === mItem.id_str);
                 if (item) {
                     fullText = fullText.replace(tcoUrl, getMediaMarkdown(item.id));
                     item._inserted = true;
                 }
             }
        });

        // Append remaining (e.g. attached images that don't have t.co link in text, or if link wasn't found)
        mediaList.forEach(item => {
            if (!item._inserted) {
                fullText += '\n\n' + getMediaMarkdown(item.id);
            }
        });
    }

    // 4. Generate Wiki-links for footer
    const mediaFiles = mediaList.map(item => `[[05_Attachments/Tweets/${item.filename}]]`);

    return {
        id: id,
        fullText: fullText,
        createdAt: createdAt,
        userName: userName,
        userScreenName: userScreenName,
        userProfileImageUrl: userProfileImageUrl,
        retweetCount: tweet?.retweet_count || 0,
        favoriteCount: tweet?.favorite_count || 0,
        replyCount: tweet?.reply_count || 0,
        quoteCount: tweet?.quote_count || 0,
        bookmarkCount: tweet?.bookmark_count || 0,
        url: `https://twitter.com/${userScreenName}/status/${id}`,
        mediaFiles: mediaFiles, // For footer
        mediaList: mediaList,   // For downloader
        hashtags: tweet?.entities?.hashtags ? tweet.entities.hashtags.map(tag => tag.text) : [],
        mentions: tweet?.entities?.user_mentions ? tweet.entities.user_mentions.map(mention => mention.screen_name) : [],
        urls: tweet?.entities?.urls ? tweet.entities.urls.map(u => u.expanded_url) : [],
        source: source
    };
}

function generateMarkdown(tweetData, ATTACHMENTS_DIR_RELATIVE) {
    if (!tweetData) return null;

    let content = tweetData.fullText;

    // Replace remaining t.co URLs
    if (tweetData.urls) {
        tweetData.urls.forEach(url => {
            if (url && url.url && url.expanded_url) {
                 content = content.replace(new RegExp(url.url, 'g'), url.expanded_url);
            }
        });
    }

    // YAML Front Matter
    let markdown = `---\n`;
    markdown += `id: ${tweetData.id}\n`;
    markdown += `author: ${tweetData.userName} (@${tweetData.userScreenName})\n`;
    markdown += `url: ${tweetData.url}\n`;
    markdown += `date: ${tweetData.createdAt}\n`;
    if (tweetData.hashtags && tweetData.hashtags.length > 0) {
        markdown += `tags: [${tweetData.hashtags.map(tag => `'${tag}'`).join(', ')}]\n`;
    } else {
        markdown += `tags: []\n`;
    }
    markdown += `source: X (Twitter)\n`;
    markdown += `---\n\n`;

    // Tweet content
    markdown += `${content}\n\n`;

    // Add media links (Wiki-style)
    if (tweetData.mediaFiles && tweetData.mediaFiles.length > 0) {
        markdown += `### Media\n`;
        tweetData.mediaFiles.forEach(mediaLink => {
            markdown += `- ${mediaLink}\n`;
        });
        markdown += `\n`;
    }

    markdown += `---\n`;
    markdown += `Retweets: ${tweetData.retweetCount} | Likes: ${tweetData.favoriteCount} | Replies: ${tweetData.replyCount} | Quotes: ${tweetData.quoteCount} | Bookmarks: ${tweetData.bookmarkCount}\n`;
    markdown += `Original Source: ${tweetData.source || 'Unknown'}\n`;

    return markdown;
}

module.exports = {
    downloadMedia,
    parseTweetData,
    generateMarkdown,
};
