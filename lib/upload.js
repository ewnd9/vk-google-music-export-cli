'use strict';

const fs = require('fs');
const chalk = require('chalk');

const config = require('./config');
const spawn = require('child_process').spawn;

const bluebird = require('bluebird');
const unlink = bluebird.promisify(fs.unlink);

const download = require('./download');
const vkApi = require('vk-universal-api');

const log = console.log.bind(console);

let processedCount = 0;
const errors = [];

module.exports = function(pythonScript, fetchParams, concurrency, skipMissing, uploaderId) {
  log(chalk.green('Loading audio list from VK'));
  const limit = fetchParams.count;

  return vkApi.get('audio.get', fetchParams)
    .then(audios => {
      log(chalk.green(`Loaded info about ${audios.length} audios`));

      return bluebird
        .map(audios.slice(0, limit), (audio, i) => {
          const name = `${audio.artist} - ${audio.title}`;
          const dest = `/tmp/${audio.aid}.mp3`;

          const prefix = status => `${chalk.green(`${i + 1}: ${status}`)} ${name}`;
          log(`${prefix('Downloading')} (${dest})`);

          return downloadAndUpload(prefix, pythonScript, audio, dest, skipMissing, uploaderId)
            .catch(err => {
              errors.push(name);
              log(prefix('error'), err.stack || err);
            })
            .then(status => {
              log(`${prefix('Finish')} ${++processedCount} / ${Math.min(audios.length, limit)} ${status && ('(' + status + ')') || ''}`);
            });
        }, { concurrency });
    })
    .then(() => {
      if (errors.length > 0) {
        console.log('\nerrors:\n\n', errors.join('\n'));
      }
    });
};

function downloadAndUpload(prefix, pythonScript, audio, dest, skipMissing, uploaderId) {
  const googleMusicId = getAudio(audio);

  if (googleMusicId) {
    return Promise.resolve('Already Uploaded');
  } else if (skipMissing) {
    const name = `${audio.artist} - ${audio.title}`;
    return Promise.reject(new Error(`"${name}" is missed`));
  }

  return download(audio.url, dest)
    .then(() => new Promise((resolve, reject) => {
      log(prefix('Downloaded'));
      log(prefix('Uploading'));

      const args = [pythonScript, dest];

      if (uploaderId) {
        args.push('--uploader-id');
        args.push(uploaderId);
      }

      const download = spawn('python3', args);
      let result = 'unknown state';

      download.on('error', err => reject(err));
      download.on('close', code => {
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`python script exited with code: ${code}`));
        }
      });

      download.stdout.on('data', processOutput);
      download.stderr.on('data', processOutput);

      function processOutput(rawData) {
        const data = rawData.toString();

        const successRegex = /Successfully uploaded .* \(([\w-]+)\)/g;
        const successMatch = successRegex.exec(data);

        if (successMatch) {
          const googleMusicId = successMatch[1];
          setAudio(audio, googleMusicId);

          result = 'Successfully uploaded';
        }

        const existsRegex = /Failed to upload .* \(([\w-]+)\) \| ALREADY EXISTS/g;
        const existsMatch = existsRegex.exec(data);

        if (existsMatch) {
          const googleMusicId = existsMatch[1];
          setAudio(audio, googleMusicId);

          result = 'Already exists';
        }
      }
    }))
    .then(() => unlink(dest));
}

function getAudio(audio) {
  return config.get(`audio.audio-${audio.aid}`);
}

function setAudio(audio, id) {
  config.set(`audio.audio-${audio.aid}`, id);
}
