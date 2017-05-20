const pino = require('pino');
const log = pino();

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Returns a Cache object
 * @param  {Object}  options.db             A mongodb instance
 * @param  {String}  options.collectionName The name for the collection to use
 * @param  {Integer} options.maxEntries     The maximum number of items in the cache
 * @param  {Integer} options.TTL            The maxiumum length an item can stay in the cache in milliseconds
 * @return {Object}                         The Cache object
 */
function createCache(
    { db, collectionName = 'cache', maxEntries = 100, TTL = ONE_HOUR } = {}
) {
    /**
     * A promise that resolves to a preexisting or
     * a newly created collection
     */
    const collection = new Promise((resolve, reject) => {
        log.info('Getting collection:', collectionName);

        // Try getting the collection
        db.collection(collectionName, { strict: true }, (err, coll1) => {
            if (err != undefined) {
                log.warn('Couldn\'t get collection', err);
                log.info(
                    'Collection doesn\'t exists. Creating collection:',
                    collectionName
                );
                // Create the collection since it doesn't exist
                db.createCollection(collectionName, (err, coll2) => {
                    if (err != undefined) {
                        log.error(
                            'Failed creating collection:',
                            collectionName,
                            err
                        );
                        // Complete failure :(
                        reject(err);
                    }
                    log.info('Created collection:', collectionName);
                    // Return new collection
                    resolve(coll2);
                });
            }
            log.info('Got collection:', collectionName);
            // Return collection
            resolve(coll1);
        });
    });

    /**
     * Creates or updates a key in the cache
     * @param {string} key   The id in the cache
     * @param {string} value The new value
     * @return {Promise<Object>} The resulting document
     */
    async function setKey(key, value) {
        log.info(`Adding { ${key}: ${value} } to the collection`);

        // Await the collection
        const coll = await collection;
        // Update or create (upsert)
        const query = await coll.updateOne(
            {
                _id: key,
            },
            {
                $set: {
                    value: value,
                    updated: new Date(),
                },
            },
            {
                upsert: true,
            }
        );

        // Least Recently Used Cache
        // If the amount of docs in the cache is over the maxEntries limit
        // find the n docs over the limited sorted by age, getting the oldest
        // documents and deleting them.
        const currentKeys = await getKeys();
        const currentNum = currentKeys.length;
        const numOverMax = currentNum - maxEntries;

        try {
            if (currentNum > maxEntries) {
                // Get the oldest entries over the
                // max number allowed
                const oldestOverLimit = await coll
                    .find({})
                    .sort({ updated: 1 })
                    .limit(numOverMax);

                // Delete them all
                oldestOverLimit.forEach(doc => {
                    coll.findOneAndDelete({
                        _id: doc._id,
                    });
                });
            }
        } catch (err) {
            log.error("Couldn't delete old docs", err);
        }

        if (query.result.ok === 1) {
            // Creating the doc was successful
            // so now we need to get it out again.
            // This is probably uneccessary since we
            // have all the data for the doc in this
            // function scope.
            // TODO: Optimisation: remove this extra
            // getKey call.
            return getKey(key);
        } else {
            throw query.result;
        }
    }

    /**
     * Returns the key if it's in the cache,
     * else it creates a new value for the key
     * @param  {string} key The id in the cache
     * @return {Promise<Object>}    The cached value or a newly created one
     */
    async function getKey(key) {
        log.info(`Getting key: ${key}`);

        // Await the collection
        const coll = await collection;
        const result = await coll.findOne(
            { _id: key },
            {
                fields: {
                    name: 1,
                    value: 1,
                    updated: 1,
                },
            }
        );

        // Check if the doc was last updated within the TTL
        const docIsTooOld =
            new Date().getTime() - new Date(result.updated).getTime() > TTL;

        // If we have a result and it's fresh enough
        if (result != undefined && !docIsTooOld) {
            log.info('Cache hit for:', key);
            return result;
        } else {
            log.warn('Cache miss for:', key);
            return setKey(key, Math.random().toString());
        }
    }

    /**
     * Deletes the key from the cache
     * @param  {string} key The id in the cache
     * @return {Promise<Object>} The result object returned from the cache
     */
    async function deleteKey(key) {
        log.info(`Deleting key: ${key}`);

        // Await the collection
        const coll = await collection;
        const result = await coll.findOneAndDelete({
            _id: key,
        });
        return result;
    }

    /**
     * Gets a list of the keys in the cache
     * @return {Promise<Array>} A list of string ids
     */
    async function getKeys() {
        log.info('Getting all keys');

        // Await the collection
        const coll = await collection;
        // Get all documents in the collection
        const results = await coll.find().toArray();
        // Map documents to keys
        const keys = results.map(doc => doc._id);

        return keys;
    }

    /**
     * Deletes everything in the cache
     * @return {Promise<Object>} The result object returned from the cache
     */
    async function purgeCache() {
        log.info('Deleting all keys');

        // Await the collection
        const coll = await collection;
        // Delete everything
        const result = await coll.deleteMany({});

        return result;
    }

    return {
        getKey,
        setKey,
        deleteKey,
        getKeys,
        purgeCache,
    };
}

module.exports = createCache;
