const https = require('https');
const fs = require('fs');

const url = 'https://unpkg.com/hero-patterns@latest/src/patterns/topography.svg';
const dest = './Assets/topography.svg';

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to get topography.svg: ${res.statusCode}`);
    process.exit(1);
  }
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Successfully downloaded topography.svg');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
