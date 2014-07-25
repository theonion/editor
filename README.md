# Onion Editor Readme

## Overview

Onion Editor is built on top of The Guardian's Scribe, with extra features for inserting inline media.

## Getting started

Install dependencies:

    npm install
    npm install -g bower
    bower install

Run `grunt` to build

## Adding modules

Because Scribe uses requirejs so are we. 

See Scribe's readme for more info about writing plugins:
https://github.com/guardian/scribe#architecture

Add your module to build.js and inlcude it as a dependecny in onion-editor.js

## Module overview

We've written a few plugins for our needs:

*betty-cropper*
Integrates OnionEditor with externally defined Betty Cropper tools

*embed*
Enables embedding html snippets, other embed players, etc.

*hr*
Inserts a horizontal rule

*inline-objects*
Manages the needs & desires of all inline elements inserted into the editor. Mabybe a bit overloaded and should be split out into several plugins. 

Consumes a JSON config file See: https://github.com/theonion/editor/blob/master/public/inline-config.json

*link-ui*
Link prompt for creating and editing links.

*onion-video*
Integrates Onion Video tools with the editor

*placeholder*
Shows configurable placeholder text when the editor has no contents.

*youtube*
Embed a youtube video by URL

*sanitizer*
Patched version of Scribe's santize plugin that ignores the contents of DIVs 

*link-formatter*
Makes sure hrefs relative to a configured domain. Formatting happens on paste & when entered via the link ui.