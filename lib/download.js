'use strict';

const fs = require('fs');
const got = require('got');

module.exports = function(url, dest) {
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
  });
};
