require('dotenv').config();
const { google } = require('googleapis');
const open = require('open');
const fs = require('fs');
const path = require('path');

// 🔐 Replace with your actual credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BLOG_ID = process.env.BLOG_ID;
const TOKEN_PATH = path.join(__dirname, 'tokens.json');

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// 🚀 Main function
async function postToBlogger(postData, isDraft = true) {

  // 🔁 Load or request tokens
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);
  } else {
    // If no tokens, we need to authenticate.
    // Generate the auth URL and throw an error to signal this to the caller.
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/blogger'],
    });
    const error = new Error('Authentication required.');
    error.authUrl = authUrl;
    throw error;
  }

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    const res = await blogger.posts.insert({
      blogId: BLOG_ID,
      isDraft: isDraft,
      requestBody: {
        title: postData.title,
        content: postData.content,
        labels: postData.labels || [],
      },
    });
    console.log('✅ Post published:', res.data.url);
    return res.data; // Resolve the promise with the result
  } catch (err) {
    console.error('❌ Failed to publish post:', err.message);
    throw err; // Re-throw the error to be caught by the caller
  }
}

async function updatePostOnBlogger(postData) {
  // Token loading/authentication is the same
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);
  } else {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/blogger'],
    });
    const error = new Error('Authentication required.');
    error.authUrl = authUrl;
    throw error;
  }

  if (!postData.postId) {
    throw new Error('postId is required for updating a post.');
  }

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    /*console.log(`Fetching post ${postData.postId} before updating...`);
    const existingPost = await getPostFromBlogger(postData.postId);
    console.log('Found post:', existingPost.url);*/

    const res = await blogger.posts.update({
      blogId: BLOG_ID,
      postId: postData.postId,
      requestBody: {
        title: postData.title,
        content: postData.content,
        labels: postData.labels || [],
      },
    });
    console.log('✅ Post updated:', res.data.url);
    return res.data;
  } catch (err) {
    console.error('❌ Failed to update post:', err.message);
    throw err;
  }
}


async function getPostFromBlogger(postId) {
  // Token loading/authentication is the same
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);
  } else {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/blogger'],
    });
    const error = new Error('Authentication required.');
    error.authUrl = authUrl;
    throw error;
  }

  if (!postId) {
    throw new Error('postId is required for fetching a post.');
  }

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    const res = await blogger.posts.get({
      blogId: BLOG_ID,
      postId: postId,
    });
    console.log('✅ Post fetched:', res.data.url);
    return res.data;
  } catch (err) {
    console.error('❌ Failed to fetch post:', err.message);
    throw err;
  }
}

module.exports = { postToBlogger, updatePostOnBlogger, getPostFromBlogger, oauth2Client };


/*
// Sample post input:
const postData = {
  title: 'This is the post title',
  content: '<p>This is the post content</p>',
  labels: ['label1', 'label2', 'label3'],
};

// Usage:
postToBlogger(postData);

*/