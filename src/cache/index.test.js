// Sshhh
jest.setMock('pino', function() {
    return {
        info() {},
        warn() {},
        error() {},
    };
});
const { MongoClient } = require('mongodb');
const pseries = require('p-series');
const createCache = require('./index.js');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let db;
let cache;
let smallCache;
let shortCache;

const key = 'testkey';
const value = 'testvalue';

describe('Cache', () => {
    beforeAll(async () => {
        db = await MongoClient.connect(
            'mongodb://localhost:27017/cached-mongo-test'
        );

        // Help mongo out by creating the collections ahead of time
        // stop it choking on something in createCache. Maybe the concurrent(ish)
        // getting/creation of collectons.
        // TODO: Fix this ^^
        await Promise.all([
            db.createCollection('cache'),
            db.createCollection('smallCache'),
            db.createCollection('shortCache'),
        ]);

        cache = createCache({ db, collectionName: 'cache' });
        smallCache = createCache({
            db,
            collectionName: 'smallCache',
            maxEntries: 3,
        });
        shortCache = createCache({
            db,
            collectionName: 'shortCache',
            TTL: 10,
        });

        await cache.purgeCache();
        await smallCache.purgeCache();
        await shortCache.purgeCache();
    });

    afterAll(async () => {
        await db.close();
    });

    test('can create a new key', async () => {
        const result = await cache.setKey(key, value);
        expect(result).toMatchObject({
            _id: key,
            value: value,
            updated: expect.anything(),
        });
    });

    test('can get a key', async () => {
        const result = await cache.getKey(key);
        expect(result).toMatchObject({
            _id: key,
            value: value,
            updated: expect.anything(),
        });
    });

    test('can delete a key', async () => {
        const result = await cache.deleteKey(key);
        expect(result).toMatchObject({
            ok: 1,
            value: {
                _id: key,
                value: value,
                updated: expect.anything(),
            },
        });
    });

    test('can list all keys', async () => {
        const keys = ['test1', 'test2', 'test3'];

        await pseries(
            keys.map(key => async () => await cache.setKey(key, 'val'))
        );

        const result = await cache.getKeys();
        expect(result).toEqual(expect.arrayContaining(keys));
    });

    test('can remove all keys from cache', async () => {
        const purgeresult = await cache.purgeCache();
        expect(purgeresult).toMatchObject({ result: { n: 3, ok: 1 } });

        const getresult = await cache.getKeys();
        expect(getresult).toMatchObject([]);
    });

    test('handles a maximum number of entries', async () => {
        const inserted = ['test1', 'test2', 'test3', 'test4'];
        const expected = ['test2', 'test3', 'test4'];

        await pseries(
            inserted.map(key => async () => await smallCache.setKey(key, 'val'))
        );

        const result = await smallCache.getKeys();
        expect(result).toEqual(expect.arrayContaining(expected));
    });

    test('handles short TTLs', async () => {
        const created = await shortCache.setKey(key, value);
        await sleep(20);
        const fetched = await shortCache.getKey(key);

        expect(fetched).not.toMatchObject(created);
    });
});
