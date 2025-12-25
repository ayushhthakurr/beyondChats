const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeBeyondChats() {
  const baseUrl = 'https://beyondchats.com/blogs';

  console.log('Fetching blog page...');
  const response = await axios.get(baseUrl);
  const $ = cheerio.load(response.data);

  const paginationLinks = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/blogs?page=')) {
      const pageNum = parseInt(href.split('page=')[1]);
      if (!isNaN(pageNum)) {
        paginationLinks.push(pageNum);
      }
    }
  });

  const lastPage = paginationLinks.length > 0 ? Math.max(...paginationLinks) : 1;
  console.log(`Last page: ${lastPage}`);

  console.log(`Fetching page ${lastPage}...`);
  const lastPageResponse = await axios.get(`${baseUrl}?page=${lastPage}`);
  const $lastPage = cheerio.load(lastPageResponse.data);

  const articleUrls = [];
  $lastPage('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/blog/') && !articleUrls.includes(href)) {
      articleUrls.push('https://beyondchats.com' + href);
    }
  });

  const oldestArticles = articleUrls.slice(0, 5);
  console.log(`Found ${oldestArticles.length} articles to scrape`);

  for (let i = 0; i < oldestArticles.length; i++) {
    const url = oldestArticles[i];
    console.log(`Scraping article ${i + 1}/${oldestArticles.length}: ${url}`);

    try {
      const articleResponse = await axios.get(url);
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

      const payload = {
        title: title,
        content: content,
        source_url: url,
        source_type: 'beyondchats',
        is_generated: false
      };

      console.log(`Posting article: ${title.substring(0, 50)}...`);
      await axios.post('http://localhost:3000/api/articles', payload);
      console.log(`Article ${i + 1} saved successfully`);

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
    }
  }

  console.log('Scraping complete');
}

module.exports = scrapeBeyondChats;

