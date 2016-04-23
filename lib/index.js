'use strict';

const meow = require('meow');
const fs = require('fs');
const got = require('got');
const config = require('./config');
const spawn = require('child_process').spawn;
const debug = require('debug')('vk-google-music-export-cli');
const cpuCount = require('os').cpus().length;

const bluebird = require('bluebird');
const unlink = bluebird.promisify(fs.unlink);

global.Promise = bluebird; // don't want to mix different implementations

const cli = meow(`
  Usage
    $ vk-google-music-export <path-to-gmusicapi_scripts>/gmupload.py
`);

const vkAuth = require('./vk-auth');
const vkApi = require('vk-universal-api');

let processedCount = 0;
const errors = [];

vkAuth()
  .then(token => {
    vkApi.setToken(token);
    return vkApi.get('audio.get');
  })
  .then(audios => {
    const limit = cli.flags.max || 10;

    return bluebird.map(audios.slice(0, limit), audio => {
      const name = `${audio.artist} - ${audio.title}`;

      return downloadAndUpload(audio)
        .catch(err => {
          errors.push(name);
          console.log(name, err.stack || err);
        })
        .then(() => {
          console.log(`${++processedCount} / ${Math.min(audios.length, limit)} ${name}`);
        });
    }, { concurrency: cli.flags.concurrency || cpuCount });
  })
  .then(() => {
    if (errors.length > 0) {
      console.log('\nerrors:\n\n', errors.join('\n'));
    }
  });

function downloadAndUpload(audio) {
  const dest = `/tmp/${audio.aid}.mp3`;

  const googleMusicId = getAudio(audio);

  if (googleMusicId) {
    return Promise.resolve();
  } else if (cli.flags.skipMissing) {
    const name = `${audio.artist} - ${audio.title}`;
    return Promise.reject(new Error(`"${name}" is missed`));
  }

  return new Promise((resolve, reject) => {
    got
      .stream(audio.url)
      .on('error', err => {
        reject(err);
      })
      .pipe(fs.createWriteStream(dest))
      .on('error', err => {
        reject(err);
      })
      .on('close', () => {
        resolve();
      });
  })
  .then(() => new Promise((resolve, reject) => {
    const download = spawn('python3', [cli.input[0], dest]);

    download.on('error', err => reject(err));
    download.on('close', () => resolve());

    download.stdout.on('data', processOutput);
    download.stderr.on('data', processOutput);

    function processOutput(data) {
      saveGoogleMusicId(audio, /Successfully uploaded .* \(([\w-]+)\)/g, data);
      saveGoogleMusicId(audio, /Failed to upload .* \(([\w-]+)\) \| ALREADY EXISTS/g, data);
    }
  }))
  .then(() => unlink(dest));
}

function saveGoogleMusicId(audio, regex, data) {
  const match = regex.exec(data);

  if (match) {
    const googleMusicId = match[1];
    setAudio(audio, googleMusicId);
    debug(`${googleMusicId} saved`);
  }
}

function getAudio(audio) {
  return config.get(`audio.audio-${audio.aid}`);
}

function setAudio(audio, id) {
  config.set(`audio.audio-${audio.aid}`, id);
}
