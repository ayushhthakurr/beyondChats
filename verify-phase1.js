#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

console.log('=== PHASE 1 VERIFICATION ===\n');

let server;

function startServer() {
  return new Promise((resolve, reject) => {
    server = spawn('node', ['src/server.js'], {
      cwd: '/Users/priyanshigupta/Documents/Ayush/Company Tasks/beyondchats/backend'
    });

    server.stdout.on('data', (data) => {
      console.log('[SERVER]', data.toString().trim());
      if (data.toString().includes('Server running')) {
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error('[SERVER ERROR]', data.toString().trim());
    });

    setTimeout(() => resolve(), 5000);
  });
}

function testAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n1. Testing GET /api/articles (before scraping)...');

    http.get('http://localhost:3000/api/articles', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const articles = JSON.parse(data);
          console.log('   ✓ GET /api/articles works');
          console.log('   Current articles in DB:', articles.length);
          resolve(articles.length);
        } catch (e) {
          console.error('   ✗ Failed to parse response:', data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('   ✗ HTTP request failed:', err.message);
      reject(err);
    });
  });
}

function runScraper() {
  return new Promise((resolve, reject) => {
    console.log('\n2. Running scraper (automation/src/index.js)...');

    const scraper = spawn('node', ['src/index.js'], {
      cwd: '/Users/priyanshigupta/Documents/Ayush/Company Tasks/beyondchats/automation'
    });

    scraper.stdout.on('data', (data) => {
      console.log('[SCRAPER]', data.toString().trim());
    });

    scraper.stderr.on('data', (data) => {
      console.error('[SCRAPER ERROR]', data.toString().trim());
    });

    scraper.on('close', (code) => {
      if (code === 0) {
        console.log('   ✓ Scraper completed successfully');
        resolve();
      } else {
        reject(new Error(`Scraper exited with code ${code}`));
      }
    });
  });
}

function verifyArticlesSaved() {
  return new Promise((resolve, reject) => {
    console.log('\n3. Verifying articles were saved via API...');

    http.get('http://localhost:3000/api/articles', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const articles = JSON.parse(data);
        console.log('   ✓ GET /api/articles works');
        console.log('   Articles now in DB:', articles.length);

        if (articles.length > 0) {
          console.log('   Sample article:');
          console.log('     - ID:', articles[0].id);
          console.log('     - Title:', articles[0].title.substring(0, 50) + '...');
          console.log('     - Source:', articles[0].source_type);
        }

        resolve(articles);
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    await startServer();
    console.log('✓ Server started\n');

    const beforeCount = await testAPI();

    await runScraper();

    const articles = await verifyArticlesSaved();

    console.log('\n=== PHASE 1 VERIFICATION RESULT ===');

    if (articles.length > beforeCount) {
      console.log('✅ PHASE 1 COMPLETE');
      console.log('   - Scraper POSTs to /api/articles ✓');
      console.log('   - API writes to SQLite via articleModel ✓');
      console.log('   - GET /api/articles returns scraped data ✓');
      console.log(`   - ${articles.length - beforeCount} new articles saved`);
    } else {
      console.log('❌ PHASE 1 INCOMPLETE');
      console.log('   - No new articles were saved');
      console.log('   - Check scraper or API logs above');
    }

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
  } finally {
    if (server) {
      server.kill();
      console.log('\n✓ Server stopped');
    }
    process.exit(0);
  }
}

main();

