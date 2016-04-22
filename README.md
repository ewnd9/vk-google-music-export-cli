# vk-google-music-export-cli

[![Build Status](https://travis-ci.org/ewnd9/vk-google-music-export-cli.svg?branch=master)](https://travis-ci.org/ewnd9/vk-google-music-export-cli)

One way export of audio from vk.com to google music

- [ ] VK auth
- [ ] Download from VK, upload to google music with a python lib
- [ ] Add uploaded tracks to a tracklist

## Config

- `vkToken`
- `tracklistId`
- `currentPage`

## Install

```
$ npm install -g vk-google-music-export-cli
$ pip3 install docopt
$ pip3 install gmusicapi
$ pip3 install gmusicapi_wrapper
$ git clone https://github.com/thebigmunch/gmusicapi-scripts.git
```

## Usage

```
$ vk-google-music-export <path-to-gmusicapi_scripts>/gmupload.py
```

## License

MIT © [ewnd9](http://ewnd9.com)
