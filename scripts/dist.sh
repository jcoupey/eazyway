#!/usr/bin/env bash

npm run build
rm bundle.raw.js

rm -rf dist

mkdir -p dist/img
mkdir dist/css

mv -v bundle.js dist
cp -v img/danger.png dist/img
cp -v img/eazyway.svg dist/img
cp -v img/image_marker.svg dist/img
cp -v index.html dist
cp -v css/eazyway.css dist/css

sed -i 's|src/index.js|bundle.js|' dist/index.html
