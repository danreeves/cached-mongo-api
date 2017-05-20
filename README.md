# cached-mongo-api

[![Build Status](https://travis-ci.org/danreeves/cached-mongo-api.svg?branch=master)](https://travis-ci.org/danreeves/cached-mongo-api)

A dummy api cached in a mongo backend

## Features
 - LRU cache
 - Configurable TTL
 - Configurable cache size (number of entries)

## API

- `GET /api/keys/:key`: Get or update the key+value
- `PUT /api/keys/:key`: Update the key+value
- `DELETE /api/keys/:key`: Delete the key+value
- `GET /api/keys`: List all available keys
- `DELETE /api/keys`: Delete all available keys

## Setup

- Clone the repo
- Install & start mongodb (you can use `npm run start-mongo` to start it pointing at a local directory)
- `npm install`
- `npm start`

**NOTE**

The tests will use a live (local) mongodb, specifically `mongodb://localhost:27017/cached-mongo-test`.

The actual server is configured (in `src/index.js`) to use `mongodb://localhost:27017/cache`.

---

Have a nice day🌤
