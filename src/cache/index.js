const pino = require('pino');
const log = pino();

function createCache({ db, collectionName = 'cache' } = {}) {
    // Get or create the mongo collection
    const collection = new Promise((resolve, reject) => {
        log.info('Getting collection:', collectionName);
        db.collection(collectionName, { strict: true }, (err, coll1) => {
            if (err != undefined) {
                log.warn("Couldn't get collection", err);
                log.info(
                    "Collection doesn't exists. Creating collection:",
                    collectionName
                );
                db.createCollection(collectionName, (err, coll2) => {
                    if (err != undefined) {
                        log.error(
                            'Failed creating collection:',
                            collectionName,
                            err
                        );
                        reject(err);
                    }
                    log.info('Created collection:', collectionName);
                    resolve(coll2);
                });
            }
            log.info('Got collection:', collectionName);
            resolve(coll1);
        });
    });

    async function setKey(key, value) {
        log.info(`Adding ${key}: ${value} to the collection`);

        // Await the collection
        const coll = await collection;
        const query = await coll.updateOne(
            {
                _id: key,
            },
            {
                $set: {
                    value: value,
                },
            },
            {
                upsert: true,
            }
        );

        if (query.result.ok === 1) {
            return getKey(key);
        } else {
            throw query.result;
        }
    }

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
                },
            }
        );

        if (result != undefined) {
            log.info('Cache hit for:', key);
            return result;
        } else {
            log.warn('Cache miss for:', key);
            return setKey(key, (Math.random()).toString());
        }
    }

    async function deleteKey(key) {
        log.info(`Deleting key: ${key}`);

        // Await the collection
        const coll = await collection;
        const result = await coll.findOneAndDelete({
            _id: key,
        });
        return result;
    }

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

    async function purgeCache() {
        log.info('Deleting all keys');

        // Await the collection
        const coll = await collection;
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
