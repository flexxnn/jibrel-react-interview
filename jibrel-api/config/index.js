const path = require('path');
const yaml = require('js-yaml');
const fs   = require('fs');

const conf = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config.yaml'), 'utf8'));

module.exports  = conf;
