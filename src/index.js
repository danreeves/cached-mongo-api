const express = require('express');
const pino = require('pino');
const { MongoClient } = require('mongodb');
const createRouter = require('./api/router');
const createCache = require('./cache');

const API_PORT = 3000;
const MONGO_URL = `mongodb://localhost:27017/cache`;

const log = pino();
const app = express();

MongoClient.connect(MONGO_URL, function(err, db) {
    if (err) {
        log.error(err);
        process.exit(1);
    }

    // Start the server
    const cache = createCache({ db });
    const router = createRouter({ cache });

    app.use('/api', router);

    app.listen(API_PORT, () => {
        log.info(`Listening on port ${API_PORT}`);
    });
});
