#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

cp 404.html dist/

echo > .nojekyll

git add -A
git commit -m 'deploy'

git push -f git@github.com:antoinegelloz/antoinegelloz.github.io.git main