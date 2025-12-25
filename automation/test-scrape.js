const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  console.log('Testing BeyondChats blog scraping...\n');

  const baseUrl = 'https://beyondchats.com/blogs';

  console.log(`Fetching ${baseUrl}...`);
  const response = await axios.get(baseUrl);
  const $ = cheerio.load(response.data);

  console.log('\nAll links on the page:');
  const allLinks = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      allLinks.push(href);
    }
  });

  console.log(`Total links found: ${allLinks.length}`);

  const blogLinks = allLinks.filter(href => href.includes('blog'));
  console.log(`\nLinks containing 'blog': ${blogLinks.length}`);
  blogLinks.slice(0, 10).forEach(link => console.log(`  - ${link}`));

  const paginationLinks = allLinks.filter(href => href.includes('page='));
  console.log(`\nPagination links: ${paginationLinks.length}`);
  paginationLinks.forEach(link => console.log(`  - ${link}`));

  process.exit(0);
}

testScrape().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

