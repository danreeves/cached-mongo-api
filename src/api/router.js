const { Router } = require('express');
const pino = require('pino');

const router = Router();
const log = pino();

router.get('/:key', function getKey(req, res) {
    // Get or create data for key
    log.info('get', req.params.key);
});

router.put('/:key', function updateKey(req, res) {
    // Update the data for key
    log.info('update', req.params.key);
});

router.delete('/:key', function deleteKey(req, res) {
    // Delete the data for key
    log.info('delete', req.params.key);
});

router.get('/allkeys', function getAllKeys(req, res) {
    // Get all the keys currently in the cache
    log.info('get all keys');
});

router.delete('/allkeys', function deleteAllKeys(req, res) {
    // Purge all the keys from the cache
    log.info('delete all keys');
});

module.exports = router;
