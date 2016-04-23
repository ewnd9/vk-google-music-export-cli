'use strict';

const vkAuth = require('vk-auth-prompt');
const config = require('./config');

const vkTokenKey = 'vkToken';

module.exports = function() {
  return vkAuth('5430225', 'audio,offline', config.get.bind(config, vkTokenKey), config.set.bind(config, vkTokenKey));
};
