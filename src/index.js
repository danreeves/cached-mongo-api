const express = require('express');
const pino = require('pino');
const serverSink = require('server-sink');
const { MongoClient } = require('mongodb');
const { createRouter } = require('./api/router');
const createCache = require('./cache');

const API_PORT = 3000;
const MONGO_URL = `mongodb://localhost:27017/cache`;

const log = pino();
const app = express();

// Get the DB connection
MongoClient.connect(MONGO_URL, function(err, db) {

    if (err) {
        log.error(err);
        process.exit(1);
    }

    // Setup cache and router
    const cache = createCache({ db });
    const router = createRouter({ cache });

    // HTTP logging
    app.use((req, res, next) => {
        serverSink(req, res, msg => log.info(msg));
        next();
    });

    // Mount the api router
    app.use('/api', router);

    // Start the server
    app.listen(API_PORT, () => {
        log.info(`Listening on port ${API_PORT}`);
    });
});
