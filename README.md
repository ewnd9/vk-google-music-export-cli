# vk-google-music-export-cli

[![Build Status](https://travis-ci.org/ewnd9/vk-google-music-export-cli.svg?branch=master)](https://travis-ci.org/ewnd9/vk-google-music-export-cli)

One way export of audio from vk.com to google music

- [x] VK auth
- [x] Download from a VK authed user page and upload to google music with a python lib
- [ ] Download from a VK post by a post id and upload to google music
- [ ] Add uploaded tracks to a tracklist, sort by vk audio list
- [ ] Fix id3 tags

## Config

Location: `~/.config/configstore/vk-google-music-export-cli.json`

- `vkToken`
- `tracklistId`

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
