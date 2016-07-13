'use strict';

const config = require('./config');

const path = require('path');
const vkApi = require('vk-universal-api');

const spawn = require('child_process').spawn;
const Promise = require('bluebird');

const log = console.log.bind(console);

module.exports = function(fetchParams, concurrency) {
  const limit = fetchParams.count;
  const uploaded = Object.keys(config.all.audio).reduce((total, id) => {
    total[id.slice(6)] = config.all.audio[id];
    return total;
  }, {});

  let i = 0;

  return vkApi.get('audio.get', fetchParams)
    .then(audios => {
      return Promise
        .map(audios.slice(0, limit), audio => {
          const data = [audio.artist.trim(), audio.title.trim()];
          const id = uploaded[audio.aid];

          if (!id) {
            log(`${data} is not uploaded yet`);
            return;
          }

          return spawnShellScript(id, data)
            .then(() => {
              log(`${data} changed (${++i} / ${limit} (${audios.length}))`);
            });
        }, { concurrency });
    });
};

function spawnShellScript(id, data) {
  return new Promise((resolve, reject) => {
    spawn('sh', [path.resolve(__dirname, '..', 'change-metadata.sh'), id].concat(data))
      .on('error', err => reject(err))
      .on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${data} returned code ${code}`));
        }
      });
  });
}
