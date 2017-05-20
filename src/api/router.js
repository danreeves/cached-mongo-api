const { Router } = require('express');

const router = Router();

router.get('/:key', function getKey(req, res) {
    // Get or create data for key
    console.log('get', req.params.key);
});

router.put('/:key', function updateKey(req, res) {
    // Update the data for key
    console.log('update', req.params.key);
});

router.delete('/:key', function deleteKey(req, res) {
    // Delete the data for key
    console.log('delete', req.params.key);
});

router.get('/allkeys', function getAllKeys(req, res) {
    // Get all the keys currently in the cache
    console.log('get all keys');
});

router.delete('/allkeys', function deleteAllKeys(req, res) {
    // Purge all the keys from the cache
    console.log('delete all keys');
});

module.exports = router;
