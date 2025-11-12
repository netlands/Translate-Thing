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

// 🚀 Main function
async function postToBlogger(postData) {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // 🔁 Load or request tokens
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);
  } else {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/blogger'],
    });

    console.log('🔗 Authorize this app by visiting this URL:', authUrl);
    await open(authUrl);

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) =>
      readline.question('Enter the code from the page: ', (code) => {
        readline.close();
        resolve(code);
      })
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('🔐 Tokens saved for future use.');
  }

  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  try {
    const res = await blogger.posts.insert({
      blogId: BLOG_ID,
      requestBody: {
        title: postData.title,
        content: postData.content,
        labels: postData.labels || [],
      },
    });
    console.log('✅ Post published:', res.data.url);
  } catch (err) {
    console.error('❌ Failed to publish post:', err.message);
  }
}

module.exports = { postToBlogger };

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