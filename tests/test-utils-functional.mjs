import {
    chain,
    composeRetryUntil,
    debounce,
    disableReentrancy
} from "../utils/functional.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";


const {
    expect,
    test
} = setupTestContext();

test.describe('functional', () => {
    test('should debounce', async () => {

        let result = '';

        const f1 = async (a, b, c) => {
            // append results, this will ensure the functions are called in sequence
            result += a + b + c;
            return new Promise(resolve => {
                setTimeout(() => resolve(a + b + c), 200);
            });
        };

        const f = debounce(f1);

        // do not wait, run next call
        let p1 = f('a', 'b', 'c');

        // do not wait, be check that the function is debounced
        const promise1 = f('d', 'e', 'f')
            .then(() => {
                // test should not hit here since test will be debounced
                throw new Error('nono')
            })
            .catch(m => expect(m.message).to.equal('debounced'))

        // do not wait, be check that the function is debounced
        const promise2 = f('d', 'e', 'f')
            .then(() => {
                // test should not hit here since test will be debounced
                throw new Error('nono')
            })
            .catch(m => expect(m.message).to.equal('debounced'))

        // here wait the results
        const f3 = await f('f', 'g', 'h');
        expect(f3).to.eql('fgh');
        expect(await p1).to.eq('abc');

        // ensure functions are called sequentially
        expect(result).to.eql('abcfgh');

        await promise1;
        await promise2;
    })

    test('should retry', async () => {

        let count = 0;
        const args = await composeRetryUntil(async (...args) => {
            count++;
            if (count !== 3) {
                throw new Error();
            }
            return args;
        })('toto', 'tata');

        expect(args).to.deep.eq(['toto', 'tata']);
        expect(count).to.eq(3);
    })


    test.describe('chain function', () => {
        const mockF1 = (a, b) => a + b;
        const mockF2 = (a) => a * a;
        const mockF3 = (a) => a - 3;

        test('Normal case: Chain of functions return correct output', async () => {
            const chained = chain(mockF1, mockF2, mockF3);
            expect(chained(2, 3)).to.equals(22); // ((2+3)^2 - 3 = 25 - 3 = 22)
        });

        test('Edge case: Chain of function with single function return correct output', async () => {
            const chained = chain(mockF1);
            expect(chained(2, 3)).to.equals(5); // 2+3 = 5
        });

        test('Edge case: Chain of function with single param return correct output', async () => {
            const chained = chain(mockF2, mockF3);
            expect(chained(5)).to.equals(22); // (5^2 - 3 = 25 - 3 = 22)
        });


        test('Edge case: Empty function chain returns undefined', async () => {
            const chained = chain();
            expect(chained(5, 3)).to.equals(undefined);
        });
    });

    test.describe('disableReentrancy', () => {
        test('should call the callback when not reentrant', () => {
            let called = false;
            const fn = disableReentrancy(() => { called = true; });
            fn();
            expect(called).to.be.true;
        });

        test('should prevent reentrant calls', () => {
            let count = 0;
            const fn = disableReentrancy(() => {
                count++;
                fn(); // recursive call
            });
            fn();
            expect(count).to.equal(1);
        });

        test('should allow multiple non-reentrant calls', () => {
            let count = 0;
            const fn = disableReentrancy(() => { count++; });
            fn();
            fn();
            fn();
            expect(count).to.equal(3);
        });

        test('should return the callback’s return value', () => {
            const fn = disableReentrancy(() => 42);
            const result = fn();
            expect(result).to.equal(42);
        });

        test('should ignore reentrant call and return undefined for it', () => {
            const fn = disableReentrancy(() => {
                const innerResult = fn(); // should be undefined
                return innerResult === undefined ? 'ok' : 'fail';
            });
            const result = fn();
            expect(result).to.equal('ok');
        });
    });
})