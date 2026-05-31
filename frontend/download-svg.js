import fs from 'fs';

const url = 'https://unpkg.com/hero-patterns@latest/src/patterns/topography.svg';
const dest = './Assets/topography.svg';

async function download() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const text = await res.text();
    fs.writeFileSync(dest, text);
    console.log('Successfully downloaded topography.svg');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

download();
