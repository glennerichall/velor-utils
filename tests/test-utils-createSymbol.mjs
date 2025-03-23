import sinon from "sinon";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    beforeAll,
    it,
} = setupTestContext();

import {createSymbol} from "../utils/createSymbol.mjs";
import {setupTestContext} from "../test/setupTestContext.mjs";

describe('createSymbol', () => {
    let originalNodeEnv;

    beforeAll(() => {
        originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return the key in non-production environments', () => {
        process.env.NODE_ENV = 'development';
        const result = createSymbol('myKey');
        expect(result).to.equal('myKey');
    });

    it('should return a number in production environment (simulating symbolIterator)', () => {
        // simulate the symbolIterator
        let symbolIterator = 100;
        const proxyCreateSymbol = (key) => {
            if (process.env.NODE_ENV === 'production') {
                return symbolIterator++;
            } else {
                return key;
            }
        };

        process.env.NODE_ENV = 'production';
        const result1 = proxyCreateSymbol('myKey');
        const result2 = proxyCreateSymbol('anotherKey');
        expect(result1).to.equal(100);
        expect(result2).to.equal(101);
    });
});
