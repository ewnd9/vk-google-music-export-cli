'use strict';

const meow = require('meow');
const path = require('path');

const cli = meow(`
  Usage
    $ vk-google-music-export --auth
    $ vk-google-music-export

  Options
    --limit <n>  Sync only last <n> audios
    --concurrency <n>  Limit concurrent downloads / uploads
    --skip-missing  Ignore missing tracks (404 error) from VK
    --uploader-id <mac-address>  Use if there is error about wrong mac address
`);

const pythonScript = path.resolve(__dirname, '..', 'vendor', 'gmupload.py');

if (cli.flags.auth) {
  require('child_process').spawn('python3', [pythonScript], { stdio: [0, 1, 2] });
} else {
  require('./upload')(pythonScript, cli.flags.limit, cli.flags.concurrency, cli.flags.skipMissing, cli.flags.uploaderId);
}
