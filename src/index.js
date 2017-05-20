const express = require('express');
const pino = require('pino');
const apiRouter = require('./api/router');

const app = express();
const log = pino();

const PORT = 3000;

app.use('/api', apiRouter);

app.listen(PORT, () => {
    log.info(`Listening on port ${PORT}`);
});
