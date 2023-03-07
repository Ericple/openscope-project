<p>
  <a href="https://openvmsys.cn/openscope">
    <img alt="openscope" src="https://openvmsys.cn/openscope/img/logo.svg">
  </a>
</p>

<p>
A cross platform ATC terminal
</p>

<p>
  <img alt="package-version" src="https://img.shields.io/github/package-json/v/Ericple/openscope-project?style=flat-square">
  <img alt="license-GPL-v3" src="https://img.shields.io/github/license/Ericple/openscope-project?logo=github&style=flat-square">
  <img alt="issues" src="https://img.shields.io/github/issues/Ericple/openscope-project?style=flat-square">
  <img alt="dep-version" src="https://img.shields.io/github/package-json/dependency-version/Ericple/openscope-project/electron?style=flat-square">
  <img alt="stars" src="https://img.shields.io/github/stars/Ericple/openscope-project?style=social">
</p>

> Openscope is a cross-platform controller terminal for [VATSIM](https://vatsim.net/) FSD Server (not recognized yet) & [TeleFlight Server](https://openvmsys.cn/tfs/#/), supporting Windows / Linux / macOS. I wrote this software mainly for those linux (and of course, macOS!) users who want to be a controller but restricted by windows based Euroscope controller software. I made it open source because I want to grow a community of controller, in which there are men and women full of passion for challenge, and have the courage to break free.

<p>
<img alt="release" src="https://img.shields.io/github/v/release/Ericple/openscope-project?include_prereleases&style=for-the-badge">
<img alt="downloads" src="https://img.shields.io/github/downloads/Ericple/openscope-project/total?style=for-the-badge"><br>
<a href="https://github.com/Ericple/openscope-project/releases/latest" style="position: relative;width:120px;height:40px;border-radius:6px;background-color:rgb(0, 119, 255);color:white;border:none;font-size:16px;top:16px;cursor:pointer;padding:8px 16px 8px 16px">Download</a>
</p>

# Screenshots

![](https://openvmsys.cn/openscope/img/Openscope5.png)
![](https://openvmsys.cn/openscope/img/Openscope1.png)
![](https://openvmsys.cn/openscope/img/Openscope2.png)


# Contributing

All contributions are welcomed. Before forking this repository, please consider the followings:

- Am I familier with [TypeScript](https://www.typescriptlang.org/) and [Electron](https://electronjs.org/)?
- Am I familier with [Euroscope](https://www.euroscope.hu/wp/) and its configuration files?
- Do I know the basic knowledge of ATC?

## Debug

For the first start, run:

```bash
npm i && npm run electron:serve
```

# Thanks to

- ***iconv-jschardet*** package for supporting gbk format.


- ***Wenlue Zhang*** for pointing out the sucked code for UTC Time Display interval function, and his code review helps a lot.

- ***Ian Cowan*** for his [AviationAPI](https://aviationapi.com/about).

# FAQ

- How to request metar in openscope?
  - Use the built in metar req.

- How to switch between each sector?
  - Press Shift+Q/W/E/R to switch from these sector views.
