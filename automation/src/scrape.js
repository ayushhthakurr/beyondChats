const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');

const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false })
});

async function scrapeArticles() {
  const baseUrl = 'https://beyondchats.com/blogs';

  console.log('Fetching blog page...');
  const response = await httpClient.get(baseUrl);
  const $ = cheerio.load(response.data);

  // Find the last page number from pagination
  let lastPage = 1;
  $('.ct-pagination a.page-numbers').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/page/')) {
      const pageMatch = href.match(/\/page\/(\d+)\//);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        if (pageNum > lastPage) {
          lastPage = pageNum;
        }
      }
    }
  });

  console.log(`Last page: ${lastPage}`);
  console.log(`Fetching page ${lastPage}...`);

  // Fetch the last page to get the oldest articles
  const lastPageUrl = lastPage > 1 ? `${baseUrl}/page/${lastPage}/` : baseUrl;
  const lastPageResponse = await httpClient.get(lastPageUrl);
  const $lastPage = cheerio.load(lastPageResponse.data);

  const articleUrls = [];
  $lastPage('a').each((i, el) => {
    const href = $lastPage(el).attr('href');
    if (href && href.startsWith('https://beyondchats.com/blogs/') &&
        href !== 'https://beyondchats.com/blogs/' &&
        !href.includes('/page/') &&
        !href.includes('/tag/') &&
        !articleUrls.includes(href)) {
      articleUrls.push(href);
    }
  });

  const articlesToScrape = articleUrls.slice(0, 5);
  console.log(`Found ${articlesToScrape.length} articles to scrape`);

  const scrapedArticles = [];

  for (let i = 0; i < articlesToScrape.length; i++) {
    const url = articlesToScrape[i];
    console.log(`Scraping article ${i + 1}/${articlesToScrape.length}: ${url}`);

    try {
      const articleResponse = await httpClient.get(url);
      const $article = cheerio.load(articleResponse.data);

      const title = $article('h1').first().text().trim() ||
                    $article('title').text().trim() ||
                    'Untitled Article';

      let content = '';
      $article('article p, .content p, .post-content p, main p').each((i, el) => {
        const text = $article(el).text().trim();
        if (text) {
          content += text + '\n\n';
        }
      });

      if (!content) {
        $article('p').each((i, el) => {
          const text = $article(el).text().trim();
          if (text && text.length > 50) {
            content += text + '\n\n';
          }
        });
      }

      content = content.trim();

      const article = {
        title: title,
        content: content,
        source_url: url,
        source_type: 'beyondchats',
        is_generated: false
      };

      scrapedArticles.push(article);
      console.log(`Article ${i + 1} scraped: ${title.substring(0, 50)}...`);

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
    }
  }

  console.log(`Scraping complete. ${scrapedArticles.length} articles scraped.`);
  return scrapedArticles;
}

module.exports = scrapeArticles;

