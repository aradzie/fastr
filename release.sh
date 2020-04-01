#!/usr/bin/env bash

npx lerna exec -- npm pack

mkdir -p ~/.local/share/npm/

find ./ -name 'webfx*.tgz' -exec mv -f -t ~/.local/share/npm/ {} +
