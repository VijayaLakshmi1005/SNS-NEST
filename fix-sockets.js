const fs = require('fs');
const glob = require('glob');

const dir = 'c:/Users/sreen/Desktop/SNS-NEST/frontend/src';
const files = glob.sync(dir + '/**/*.{jsx,js}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("io('http://localhost:5000'")) {
    content = content.replace(/io\('http:\/\/localhost:5000'/g, "io(API_URL.replace('/api', '')");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
