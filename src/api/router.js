const { Router } = require('express');
const pino = require('pino');
const bodyparser = require('body-parser');

function createRouter({ cache } = {}) {
    const router = Router();
    const log = pino();

    router.use(bodyparser.json());

    router.get('/keys/:key', function getKey(req, res) {
        // Get or create data for key
        log.info('GET', req.params.key);

        cache
            .getKey(req.params.key)
            .then(result => {
                log.info('getKey success', result);
                res.send(result);
            })
            .catch(err => {
                log.error('getKey error', err);
                res.send(err);
            });
    });

    router.put('/keys/:key', function updateKey(req, res) {
        // Update the data for key
        log.info('PUT', req.params.key, req.body);

        cache
            .setKey(req.params.key, req.body.value)
            .then(result => {
                log.info('setKey success', result);
                res.send(result);
            })
            .catch(err => {
                log.error('setKey error', err);
                res.send(err);
            });
    });

    router.delete('/keys/:key', function deleteKey(req, res) {
        // Delete the data for key
        log.info('DELETE', req.params.key);

        cache
            .deleteKey(req.params.key)
            .then(result => {
                log.info('deleteKey success', result);
                res.send(result);
            })
            .catch(err => {
                log.error('deleteKey error', err);
                res.send(err);
            });
    });

    router.get('/keys', function getAllKeys(req, res) {
        // Get all the keys currently in the cache
        log.info('GET all keys');

        cache
            .getKeys()
            .then(result => {
                log.info('getKeys success', result);
                res.send(result);
            })
            .catch(err => {
                log.error('getKeys error', err);
                res.send(err);
            });
    });

    router.delete('/keys', function deleteAllKeys(req, res) {
        // Purge all the keys from the cache
        log.info('DELETE all keys');

        cache
            .purgeCache()
            .then(result => {
                log.info('deleteKeys success', result);
                res.send(result);
            })
            .catch(err => {
                log.error('deleteKeys error', err);
                res.send(err);
            });
    });

    return router;
}

module.exports = createRouter;
