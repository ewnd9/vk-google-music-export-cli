'use strict';

const meow = require('meow');
const path = require('path');

const vkApi = require('vk-universal-api');
const vkAuth = require('./vk-auth');

const cpuCount = require('os').cpus().length;

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
  vkAuth()
    .then(token => {
      vkApi.setToken(token);

      const fetchParams = {
        count: cli.flags.limit || 10,
        album_id: cli.flags.albumId
      };

      const concurrency = cli.flags.concurrency || cpuCount;

      if (cli.flags.changeMetadata) {
        // script is a curl request copied from devtools
        // open google music web app, open dev tools, change track info, click "Save as cURL"

        return require('./change-metadata')(cli.flags.changeMetadata, fetchParams, concurrency);
      } else {
        return require('./upload')(pythonScript, fetchParams, concurrency, cli.flags.skipMissing, cli.flags.uploaderId);
      }
    })
    .catch(err => console.log(err.stack || err));
}
