import {setupTestContext} from "../test/setupTestContext.mjs";
import {
    deepMerge,
    excludeKeys,
    isPristine,
    saveInitialState,
    shallowEqual
} from "../utils/objects.mjs";


const {
    expect,
    test,
    describe,
    it,
    beforeEach
} = setupTestContext();


describe('Objects utils', () => {
    describe('excludeKeys', () => {

        it('should exclude keys based on the given predicate', () => {
            const obj = {a: 1, b: 2, c: 3};
            const predicate = (key, value) => value > 1;
            const result = excludeKeys(obj, predicate);
            expect(result).to.deep.equal({b: 2, c: 3});
        });

        it('should return an empty object when all keys are excluded', () => {
            const obj = {a: 1, b: 2, c: 3};
            const predicate = () => false;
            const result = excludeKeys(obj, predicate);
            expect(result).to.be.empty;
        });

        it('should return the original object when no keys are excluded', () => {
            const obj = {a: 1, b: 2, c: 3};
            const predicate = () => true;
            const result = excludeKeys(obj, predicate);
            expect(result).to.deep.equal(obj);
        });

        it('should work with an empty object', () => {
            const obj = {};
            const predicate = () => true;
            const result = excludeKeys(obj, predicate);
            expect(result).to.deep.equal({});
        });

        it('should return an empty object if input is not an object', () => {
            const notObj = null; // Change this as necessary (e.g., undefined, string, number)
            const predicate = () => true;
            const result = excludeKeys(notObj, predicate);
            expect(result).to.deep.equal({});
        });

        it('should handle an object with both own and inherited properties', () => {
            function Parent() {
                this.x = 'foo';
            }

            Parent.prototype.y = 'bar';

            const obj = new Parent();
            const predicate = (key, value) => value === 'foo';
            const result = excludeKeys(obj, predicate);
            expect(result).to.deep.equal({x: 'foo'});
        });
    });

    describe('shallowEqual', () => {
        it('should return true for two empty objects', () => {
            expect(shallowEqual({}, {})).to.be.true;
        });

        it('should return true for two objects with the same keys and values', () => {
            const obj1 = {a: 1, b: 2, c: 3};
            const obj2 = {a: 1, b: 2, c: 3};
            expect(shallowEqual(obj1, obj2)).to.be.true;
        });

        it('should return false for objects with different number of keys', () => {
            expect(shallowEqual({a: 1}, {a: 1, b: 2})).to.be.false;
        });

        it('should return false for objects with same keys but different values', () => {
            const obj1 = {a: 1, b: 2, c: 3};
            const obj2 = {a: 1, b: 2, c: 4};
            expect(shallowEqual(obj1, obj2)).to.be.false;
        });

        it('should return false if one object has a key not present in the other', () => {
            const obj1 = {a: 1, b: 2};
            const obj2 = {a: 1, b: 2, c: 3};
            expect(shallowEqual(obj1, obj2)).to.be.false;
        });

        it('should return true for objects with nested objects having same reference', () => {
            const nested = {nested: true};
            const obj1 = {a: nested};
            const obj2 = {a: nested};
            expect(shallowEqual(obj1, obj2)).to.be.true;
        });

        it('should return false for objects with nested objects having different references', () => {
            const obj1 = {a: {nested: true}};
            const obj2 = {a: {nested: true}};
            expect(shallowEqual(obj1, obj2)).to.be.false;
        });

        it('should return true for objects with same primitive values', () => {
            const obj1 = {a: 1, b: '2', c: true, d: null, e: undefined};
            const obj2 = {a: 1, b: '2', c: true, d: null, e: undefined};
            expect(shallowEqual(obj1, obj2)).to.be.true;
        });

        it('should return false for objects with different primitive values', () => {
            const obj1 = {a: 1, b: '2', c: true, d: null, e: undefined};
            const obj2 = {a: 1, b: '2', c: false, d: null, e: undefined};
            expect(shallowEqual(obj1, obj2)).to.be.false;
        });

        it('should return true for objects with same NaN values', () => {
            const obj1 = {a: NaN};
            const obj2 = {a: NaN};
            expect(shallowEqual(obj1, obj2)).to.be.true;  // NaN !== NaN, but this is a specific behavior of this implementation
        });
    });

    describe('deepMerge', function () {
        it('should merge two flat objects', function () {
            const obj1 = {a: 1, b: 2};
            const obj2 = {b: 3, c: 4};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: 1, b: 3, c: 4});
        });

        it('should merge nested objects', function () {
            const obj1 = {a: {b: 1, c: 2}, d: 4};
            const obj2 = {a: {c: 3, d: 4}, e: 5};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: {b: 1, c: 3, d: 4}, d: 4, e: 5});
        });

        it('should overwrite properties from obj1 with obj2', function () {
            const obj1 = {a: 1, b: {c: 2}};
            const obj2 = {a: 2, b: {c: 3, d: 4}};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: 2, b: {c: 3, d: 4}});
        });

        it('should handle empty objects', function () {
            const obj1 = {};
            const obj2 = {a: 1, b: 2};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: 1, b: 2});
        });

        it('should handle nested empty objects', function () {
            const obj1 = {a: {}};
            const obj2 = {a: {b: 1}};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: {b: 1}});
        });

        it('should handle null and undefined values', function () {
            const obj1 = {a: null, b: 2};
            const obj2 = {a: 1, b: undefined};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: 1, b: undefined});
        });

        it('should merge arrays as values', function () {
            const obj1 = {a: [1, 2], b: 2};
            const obj2 = {a: [3, 4], c: 5};
            const result = deepMerge(obj1, obj2);
            expect(result).to.deep.equal({a: [3, 4], b: 2, c: 5});
        });
    });

    describe('isPristine', () => {

        it('should return true for an object that has not changed', () => {
            let obj = {a: 1, b: 2};
            saveInitialState(obj);
            expect(isPristine(obj)).to.be.true;
        });

        it('should return false for an object that has changed', () => {
            let obj = {a: 1, b: 2};
            saveInitialState(obj);
            obj.b = 3;
            expect(isPristine(obj)).to.be.false;
        });

        it('should return undefined for an object without an initial state', () => {
            let obj = {a: 1, b: 2};
            expect(isPristine(obj)).to.be.undefined;
        });

        it('should return true for an object with an empty initial state if the current state is also empty', () => {
            let obj = {};
            saveInitialState(obj);
            expect(isPristine(obj)).to.be.true;
        });

        it('should correctly handle objects with NaN values', () => {
            let obj = {a: NaN};
            saveInitialState(obj);
            expect(isPristine(obj)).to.be.true;
            obj.a = 10;
            expect(isPristine(obj)).to.be.false;
        });

        it('should return false if the current state has extra properties', () => {
            let obj = {a: 1};
            saveInitialState(obj);
            obj.b = 2;
            expect(isPristine(obj)).to.be.false;
        });

        it('should return false if the initial state had extra properties', () => {
            let obj = {a: 1, b: 2};
            saveInitialState(obj);
            delete obj.b;
            expect(isPristine(obj)).to.be.false;
        });
    });
});