const express = require('express');
const apiRouter = require('./api/router');

const app = express();

app.use('/api', apiRouter);

app.listen(3000, () => console.log('Server started'));
