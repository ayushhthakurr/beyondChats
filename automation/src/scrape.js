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

  console.log('Fetching blog homepage...');
  const response = await httpClient.get(baseUrl);
  const $ = cheerio.load(response.data);

  // Detect last pagination page
  let lastPage = 1;
  $('.ct-pagination a.page-numbers').each((_, el) => {
    const href = $(el).attr('href');
    const match = href && href.match(/\/page\/(\d+)\//);
    if (match) {
      lastPage = Math.max(lastPage, parseInt(match[1], 10));
    }
  });

  console.log(`Last page detected: ${lastPage}`);

  // Extract ONLY real article URLs
  function extractArticleUrls($page) {
    const urls = [];

    $page('article a[href^="https://beyondchats.com/blogs/"]').each((_, el) => {
      const href = $page(el).attr('href');

      if (
        href &&
        !href.includes('/page/') &&
        !href.includes('/tag/') &&
        !urls.includes(href)
      ) {
        urls.push(href);
      }
    });

    return urls;
  }

  // Collect 5 oldest articles
  const targetCount = 5;
  let currentPage = lastPage;
  const articlesToScrape = [];

  while (articlesToScrape.length < targetCount && currentPage >= 1) {
    console.log(`Fetching page ${currentPage}...`);

    const pageUrl =
      currentPage === 1 ? baseUrl : `${baseUrl}/page/${currentPage}/`;

    const pageResponse = await httpClient.get(pageUrl);
    const $page = cheerio.load(pageResponse.data);

    let pageArticles = extractArticleUrls($page);

    // Page shows newest → oldest, so reverse it
    pageArticles = pageArticles.reverse();

    for (const url of pageArticles) {
      if (articlesToScrape.length < targetCount) {
        articlesToScrape.push(url);
      } else {
        break;
      }
    }

    currentPage--;
  }

  console.log(
    `Scraping ${articlesToScrape.length} oldest articles`,
    articlesToScrape
  );

  // Scrape article content
  const scrapedArticles = [];

  for (let i = 0; i < articlesToScrape.length; i++) {
    const url = articlesToScrape[i];
    console.log(`Scraping article ${i + 1}/${articlesToScrape.length}: ${url}`);

    try {
      const articleResponse = await httpClient.get(url);
      const $article = cheerio.load(articleResponse.data);

      const title =
        $article('h1').first().text().trim() ||
        $article('title').text().trim() ||
        'Untitled Article';

      let content = '';

      $article('article p, .content p, .post-content p, main p').each(
        (_, el) => {
          const text = $article(el).text().trim();
          if (text) {
            content += text + '\n\n';
          }
        }
      );

      if (!content) {
        $article('p').each((_, el) => {
          const text = $article(el).text().trim();
          if (text && text.length > 50) {
            content += text + '\n\n';
          }
        });
      }

      scrapedArticles.push({
        title,
        content: content.trim(),
        source_url: url,
        source_type: 'beyondchats',
        is_generated: false
      });

      console.log(`✔ Scraped: ${title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`✖ Error scraping ${url}:`, error.message);
    }
  }

  console.log(`Scraping complete. ${scrapedArticles.length} articles scraped.`);
  return scrapedArticles;
}

module.exports = scrapeArticles;
