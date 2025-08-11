import axios from 'axios';
import fs from 'fs';

const login = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;
const auth = Buffer.from(`${login}:${password}`).toString('base64');

// Accept keywords from command line or a file
let keywords = process.argv.slice(2);

if (keywords.length === 1 && keywords[0].endsWith('.txt')) {
  // Read keywords from file
  const fileContent = fs.readFileSync(keywords[0], 'utf-8');
  keywords = fileContent.split('\n').map(k => k.trim()).filter(Boolean);
}

if (keywords.length === 0) {
  console.error('Usage: node dataforseo-mcp.js <keyword1> <keyword2> ... OR node dataforseo-mcp.js keywords.txt');
  process.exit(1);
}

const payload = [
  {
    keywords: keywords,
    sort_by: 'relevance'
  }
];

axios.post(
  'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
  payload,
  {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  }
).then(res => {
  const results = res.data.tasks?.[0]?.result || [];
  results.forEach(r => {
    console.log(`${r.keyword}: ${r.search_volume || 0}`);
  });
}).catch(err => {
  console.error('Error:', err.response?.data || err.message);
});
