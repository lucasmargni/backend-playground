#!/bin/sh
node_modules/.bin/tsx node_modules/.bin/prisma migrate deploy
node dist/src/index.js