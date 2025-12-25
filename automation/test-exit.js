const axios = require('axios/dist/node/axios.cjs');

const httpClient = axios.default.create({
  httpAgent: new (require('http').Agent)({ keepAlive: false }),
  httpsAgent: new (require('https').Agent)({ keepAlive: false })
});

async function test() {
  console.log('Testing axios with keepAlive disabled...');

  try {
    const response = await httpClient.get('https://beyondchats.com');
    console.log('Response status:', response.status);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('Test complete');
}

test()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });

