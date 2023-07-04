#!/usr/bin/env bash

npm run build
rm bundle.raw.js

rm -rf dist

mkdir -p dist/img/obstacles
mkdir -p dist/audio/obstacles
mkdir dist/css

cp -v img/obstacles/*.jpg dist/img/obstacles
cp -v audio/obstacles/*.mp3 dist/audio/obstacles
mv -v bundle.js dist
cp -v img/hotel.png dist/img
cp -v img/{sight,wheelchair}_{danger,problem}.png dist/img
cp -v img/eazyway.svg dist/img
cp -v img/image_marker.svg dist/img
cp -v index.html dist
cp -v css/eazyway.css dist/css

sed -i 's|src/index.js|bundle.js|' dist/index.html
