# vk-google-music-export-cli

[![Build Status](https://travis-ci.org/ewnd9/vk-google-music-export-cli.svg?branch=master)](https://travis-ci.org/ewnd9/vk-google-music-export-cli)

One way export of audio from vk.com to google music

- [x] VK auth
- [x] Download from a VK authed user page and upload to google music with a python lib
- [x] Fix id3 tags
- [ ] Download from a VK post by a post id and upload to google music
- [ ] Add uploaded tracks to a tracklist, sort by vk audio list

## Config

Location: `~/.config/configstore/vk-google-music-export-cli.json`

- `vkToken`
- `tracklistId`

## Install

```sh
$ npm install -g vk-google-music-export-cli

$ sudo apt-get install ffmpeg
$ sudo apt-get install python3-setuptools

$ sudo pip3 install docopt
$ sudo pip3 install gmusicapi
$ sudo pip3 install gmusicapi_wrapper
```

## Usage

```sh
$ vk-google-music-export --help

  Usage
    $ vk-google-music-export --auth
    $ vk-google-music-export

  Options
    --limit <n>  Sync only last <n> audios
    --concurrency <n>  Limit concurrent downloads / uploads
    --skip-missing  Ignore missing tracks (404 error) from VK
    --uploader-id <mac-address>  Use if there is error about wrong mac addres
```

## Related

- [gmusicapi](https://github.com/simon-weber/gmusicapi)
- [gmusicapi-wrapper](https://github.com/thebigmunch/gmusicapi-wrapper)
- [gmusicapi-scripts](https://github.com/thebigmunch/gmusicapi-scripts)

## License

MIT © [ewnd9](http://ewnd9.com)
