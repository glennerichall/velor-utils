import {
    MapArray,
    MapMap,
    MapSet
} from "../utils/map.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";


const {
    expect,
    test
} = setupTestContext();

test.describe("Map tests", function () {
    test.describe('MapArrayMixin', () => {
        let mapArray;
        test.beforeEach(() => {
            mapArray = new MapArray();
        });
        test('push - multiple values', () => {
            mapArray.push('key1', 'value1', 'value2');
            expect(mapArray.get('key1')).to.deep.equal(['value1', 'value2']);
        });

        test('find - not found', () => {
            mapArray.push('key1', 'value1');
            const res = mapArray.find('key1', val => val === 'value2');
            expect(res).to.be.undefined;
        });

        test('findIndex - not found', () => {
            mapArray.push('key1', 'value1');
            const index = mapArray.findIndex('key1', val => val === 'value2');
            expect(index).to.equal(-1);
        });

        test('pop - empty', () => {
            const value = mapArray.pop('key1');
            expect(value).to.be.undefined;
        });

        test('push', () => {
            mapArray.push('key1', 'value1');
            expect(mapArray.get('key1')).to.deep.equal(['value1']);
        });

        test('find', () => {
            mapArray.push('key1', 'value1');
            const res = mapArray.find('key1', val => val === 'value1');
            expect(res).to.equal('value1');
        });

        test('findIndex', () => {
            mapArray.push('key1', 'value1');
            const index = mapArray.findIndex('key1', val => val === 'value1');
            expect(index).to.equal(0);
        });

        test('pop', () => {
            mapArray.push('key1', 'value1');
            const value = mapArray.pop('key1');
            expect(value).to.equal('value1');
            expect(mapArray.get('key1')).to.be.undefined;
        });
    });

    test.describe('MapMapMixin', () => {
        let mapMap;
        test.beforeEach(() => {
            mapMap = new MapMap();
        });

        test('hget - key not set', () => {
            const res = mapMap.hget('mapName', 'key1');
            expect(res).to.be.undefined;
        });

        test('hdel - key not set', () => {
            mapMap.hdel('mapName', 'key1');
            const res = mapMap.hget('mapName', 'key1');
            expect(res).to.be.undefined;
        });

        test('hset and hget', () => {
            mapMap.hset('mapName', 'key1', 'value1');
            const res = mapMap.hget('mapName', 'key1');
            expect(res).to.equal('value1');
        });

        test('hdel', () => {
            mapMap.hset('mapName', 'key1', 'value1');
            mapMap.hdel('mapName', 'key1');
            const res = mapMap.hget('mapName', 'key1');
            expect(res).to.be.undefined;
        });
    });

    test.describe('MapSetMixin', () => {
        let mapSet;
        test.beforeEach(() => {
            mapSet = new MapSet();
        });

        test('isMember - value not added', () => {
            const res = mapSet.isMember('key1', 'value1');
            expect(res).to.be.false;
        });

        test('add and isMember', () => {
            mapSet.add('key1', 'value1');
            const res = mapSet.isMember('key1', 'value1');
            expect(res).to.be.true;
        });
    });

    test('should manip arrays', () => {
        let map = new MapArray();
        map.push('toto', 3, 4, 5, 6, 7);
        map.push('tata', 'a', 'b', 'c', 'd');

        expect(map.get('toto')).to.deep.eq([3, 4, 5, 6, 7]);
        expect(map.get('tata')).to.deep.eq(['a', 'b', 'c', 'd']);

        expect(map.pop('bob')).to.be.undefined;

        expect(map.pop('toto')).to.eq(7);
        expect(map.pop('toto')).to.eq(6);
        expect(map.pop('toto', 1)).to.eq(4);
        expect(map.get('toto')).to.deep.eq([3, 5,]);

        expect(map.findIndex('toto', i => i === 5)).to.eq(1);
        expect(map.findIndex('toto', i => i === 55)).to.eq(-1);


        expect(map.pop('toto')).to.eq(5);
        expect(map.pop('toto')).to.eq(3);
        expect(map.pop('toto')).to.eq(undefined);

        expect([...map.keys()]).to.deep.eq(['tata'])
    })

    test('should manip maps', () => {
        let map = new MapMap();

        map.hset('toto', 'titi', 2);
        map.hset('toto', 'tata', 3);

        expect(map.get('toto').get('titi')).to.eq(2);
        expect(map.get('toto').get('tata')).to.eq(3);

        expect(map.hget('toto', 'titi')).to.eq(2);
        expect(map.hget('toto', 'tata')).to.eq(3);
        expect(map.hget('toto', 'tete')).to.be.undefined;

        expect(map.get('bob')).to.be.undefined;
        expect(map.hget('bob', 'titi')).to.be.undefined;

        map.hdel('toto', 'titi');
        expect(map.hget('toto', 'titi')).to.be.undefined;

        map.hdel('toto', 'tata');
        expect(map.hget('toto', 'tata')).to.be.undefined;

        expect(map.get('toto')).to.be.undefined;
    })
})