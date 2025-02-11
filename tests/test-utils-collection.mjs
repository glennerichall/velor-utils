import sinon from "sinon";
import {setupTestContext} from "../test/setupTestContext.mjs";
import {generateCombinations} from "../utils/collection.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('generateCombinations', function () {
    it('should return all combinations of key-value pairs', function () {
        const input = {
            a: [1, 2],
            b: ['x', 'y']
        };
        const expectedOutput = [
            { a: 1, b: 'x' },
            { a: 1, b: 'y' },
            { a: 2, b: 'x' },
            { a: 2, b: 'y' }
        ];
        expect(generateCombinations(input)).to.have.deep.members(expectedOutput);
    });

    it('should return an empty array if all input arrays are empty', function () {
        const input = { a: [], b: [] };
        expect(generateCombinations(input)).to.deep.equal([]);
    });

    it('should handle an object with only one key correctly', function () {
        const input = { a: [1, 2, 3] };
        const expectedOutput = [
            { a: 1 },
            { a: 2 },
            { a: 3 }
        ];
        expect(generateCombinations(input)).to.have.deep.members(expectedOutput);
    });

    it('should return an empty array for an empty object', function () {
        expect(generateCombinations({})).to.deep.equal([]);
    });

    it('should ignore empty arrays in the input object', function () {
        const input = { a: [1, 2], b: [], c: ['x', 'y'] };
        const expectedOutput = [
            { a: 1, c: 'x' },
            { a: 1, c: 'y' },
            { a: 2, c: 'x' },
            { a: 2, c: 'y' }
        ];
        expect(generateCombinations(input)).to.have.deep.members(expectedOutput);
    });
});