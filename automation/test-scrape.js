const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const baseUrl = 'https://beyondchats.com/blogs';

  console.log('Fetching main page...');
  const response = await axios.get(baseUrl);
  const $ = cheerio.load(response.data);

  // Find last page
  let lastPage = 1;
  $('.ct-pagination a.page-numbers').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/page/')) {
      const pageMatch = href.match(/\/page\/(\d+)\//);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        if (pageNum > lastPage) lastPage = pageNum;
      }
    }
  });

  console.log('Last page detected:', lastPage);

  // Fetch last page
  const lastPageUrl = `${baseUrl}/page/${lastPage}/`;
  console.log('Fetching last page:', lastPageUrl);
  const lastPageRes = await axios.get(lastPageUrl);
  const $last = cheerio.load(lastPageRes.data);

  // Extract articles from last page
  const lastPageArticles = [];
  $last('a').each((i, el) => {
    const href = $last(el).attr('href');
    if (href && href.startsWith('https://beyondchats.com/blogs/') &&
        href !== 'https://beyondchats.com/blogs/' &&
        !href.includes('/page/') &&
        !href.includes('/tag/') &&
        !lastPageArticles.includes(href)) {
      lastPageArticles.push(href);
    }
  });

  console.log('\nArticles found on LAST page (' + lastPage + '):', lastPageArticles.length);
  lastPageArticles.forEach((u, i) => console.log('  ' + (i+1) + '. ' + u));

  // Fetch page 1 for comparison
  console.log('\nFetching page 1...');
  const page1Res = await axios.get(baseUrl);
  const $p1 = cheerio.load(page1Res.data);

  const page1Articles = [];
  $p1('a').each((i, el) => {
    const href = $p1(el).attr('href');
    if (href && href.startsWith('https://beyondchats.com/blogs/') &&
        href !== 'https://beyondchats.com/blogs/' &&
        !href.includes('/page/') &&
        !href.includes('/tag/') &&
        !page1Articles.includes(href)) {
      page1Articles.push(href);
    }
  });

  console.log('\nArticles found on PAGE 1:', page1Articles.length);
  page1Articles.forEach((u, i) => console.log('  ' + (i+1) + '. ' + u));
}

test().catch(err => console.error('Error:', err.message));

