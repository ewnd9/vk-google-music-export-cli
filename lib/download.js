'use strict';

const fs = require('fs');
const got = require('got');

const pify = require('pify');
const ffmetadata = require('ffmetadata');

const readTags = pify(ffmetadata.read);
const writeTags = pify(ffmetadata.write);

module.exports = function(url, dest, artist, title) {
  return new Promise((resolve, reject) => {
    got
      .stream(url)
      .pipe(fs.createWriteStream(dest))
      .on('error', err => {
        reject(err);
      })
      .on('close', () => {
        resolve();
      });
  })
  .then(() => readTags(dest))
  .then(
    data => {
      data.artist = artist.trim();
      data.title = title.trim();

      return writeTags(dest, data);
    },
    err => {
      const data = { artist, title };
      return writeTags(dest, data);
    }
  );
};
