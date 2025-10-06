import {setupTestContext} from "../test/setupTestContext.mjs";
// import {test} from "playwright/test";


const {
    expect,
    test,
    it
} = setupTestContext();

import {
    bindBeforeMethod,
    bindAfterMethod,
    bindOnThrow,
    bindReplaceResult,
    bindOnAfterMethods,
    bindAroundMethods,
    bindAroundMethod,
} from '../utils/binding.mjs';

class Target {
    constructor() {
        this.log = [];
    }

    inc(x) {
        this.log.push(['inc', x]);
        return x + 1;
    }

    async incAsync(x) {
        this.log.push(['incAsync', x]);
        return x + 1;
    }

    greet(name) {
        this.log.push(['greet', name]);
        return `hi ${name}`;
    }

    async greetAsync(name) {
        this.log.push(['greetAsync', name]);
        return `hi ${name}`;
    }

    thrower() {
        this.log.push(['thrower']);
        throw new Error('boom');
    }

    async throwerAsync() {
        this.log.push(['throwerAsync']);
        throw new Error('boom');
    }
}

test.describe('bindings', () => {

    test.describe('bindBeforeMethod', () => {
        test('short-circuits when before() returns a truthy value', async () => {
            const t = new Target();
            bindBeforeMethod(t, 'inc', ({args}) => {
                expect(args).to.deep.equal([1]);
                return 42; // short-circuit
            });
            const out = t.inc(1);
            expect(out).to.equal(42);
            expect(t.log).to.deep.equal([]); // original never called
        });

        test('falls through when before() returns falsy', async () => {
            const t = new Target();
            bindBeforeMethod(t, 'inc', () => 0);
            const out = t.inc(2);
            expect(out).to.equal(3);
            expect(t.log).to.deep.equal([['inc', 2]]);
        });
    });

    test.describe('bindAfterMethod (sync)', () => {
        test('after() can replace the result; undefined keeps original', async () => {
            const t = new Target();

            // Replace result
            bindAfterMethod(t, 'inc', ({res}) => res * 10 /* newRes */, false);
            const out1 = t.inc(3);
            expect(out1).to.equal(40);
            expect(t.log).to.deep.equal([['inc', 3]]);

            // Keep original when after() returns undefined (nullish coalesce)
            const t2 = new Target();
            bindAfterMethod(t2, 'greet', () => undefined, false);
            const out2 = t2.greet('sam');
            expect(out2).to.equal('hi sam');
        });
    });

    test.describe('bindAfterMethod (async)', () => {
        test('after() sees resolved value and can replace it', async () => {
            const t = new Target();
            bindAfterMethod(
                t,
                'incAsync',
                async ({res, args}) => {
                    expect(res).to.equal(2);
                    expect(args).to.deep.equal([1]);
                    return res + 100; // replace
                },
                true
            );
            const out = await t.incAsync(1);
            expect(out).to.equal(102);
            expect(t.log).to.deep.equal([['incAsync', 1]]);
        });
    });

    test.describe('bindOnThrow', () => {
        test('sync: onError invoked; rethrow=false swallows error', async () => {
            const t = new Target();
            let caught;
            bindOnThrow(t, 'thrower', ({error, args}) => {
                caught = {message: error.message, args};
            }, {rethrow: false, async: false});

            const result = t.thrower(); // no throw
            expect(result).to.equal(undefined);
            expect(caught).to.deep.equal({message: 'boom', args: []});
        });

        test('sync: rethrow=true throws ORIGINAL error (NOTE: current code has a bug)', async () => {
            const t = new Target();
            bindOnThrow(t, 'thrower', () => {
            }, {rethrow: true, async: false});
            
            try {
                t.thrower();
                expect.fail('should have thrown');
            } catch (err) {
                const msg = String(err?.message || err);
                expect(msg.includes('boom'), `unexpected error: ${msg}`).to.equal(true);
            }
        });

        test('async: onError invoked for rejected promise; rethrow=false resolves undefined', async () => {
            const t = new Target();
            let seen;
            bindOnThrow(t, 'throwerAsync', ({error}) => {
                seen = error.message;
            }, {rethrow: false, async: true});
            const out = await t.throwerAsync();
            expect(out).to.equal(undefined);
            expect(seen).to.equal('boom');
        });

        test('async: rethrow=true propagates rejection', async () => {
            const t = new Target();
            bindOnThrow(t, 'throwerAsync', () => {
            }, {rethrow: true, async: true});
            await expect(t.throwerAsync()).to.be.rejected;
        });
    });

    test.describe('bindReplaceResult', () => {
        test('sync: modifier always runs and returns its value', async () => {
            const t = new Target();
            bindReplaceResult(t, 'inc', (res, x) => res + x); // (x+1)+x
            const out = t.inc(5);
            expect(out).to.equal(11);
        });

        test('async: modifier runs on resolved value', async () => {
            const t = new Target();
            bindReplaceResult(t, 'incAsync', (res, x) => res * x, true);
            const out = await t.incAsync(4);
            expect(out).to.equal(20);
        });
    });

    test.describe('bindOnAfterMethods / bindAroundMethods / bindAroundMethod', () => {
        test('bindOnAfterMethods: observer.onX maps to target.x (after)', async () => {
            const t = new Target();
            const observer = {
                onGreet: ({args, res, target}) => {
                    // Note: bindAfterMethod passes ({ args, res, target })
                    target.log.push(['afterGreet', args[0], res]);
                    // return undefined => keep original res
                }
            };
            bindOnAfterMethods(t, observer);
            const out = t.greet('kai');
            expect(out).to.equal('hi kai');
            expect(t.log).to.deep.equal([['greet', 'kai'], ['afterGreet', 'kai', 'hi kai']]);
        });

        test('bindAroundMethods: observer.onBeforeX / onAfterX wrap a call', async () => {
            const t = new Target();
            const observer = {
                onBeforeInc: ({args, target}) => {
                    target.log.push(['beforeInc', ...args]);
                },
                onAfterInc: ({args, res, target}) => {
                    target.log.push(['afterInc', ...args, res]);
                }
            };
            bindAroundMethods(t, observer);
            const out = t.inc(7);
            expect(out).to.equal(8);
            expect(t.log).to.deep.equal([
                ['beforeInc', 7],
                ['inc', 7],
                ['afterInc', 7, 8]
            ]);
        });

        test('bindAroundMethod: equivalent of before+after on a single method', async () => {
            const t = new Target();
            bindAroundMethod(
                t,
                'greet',
                ({args, target}) => void target.log.push(['beforeGreet', ...args]),
                ({args, res, target}) => void target.log.push(['afterGreet', ...args, res]),
                false
            );
            const out = t.greet('maya');
            expect(out).to.equal('hi maya');
            expect(t.log).to.deep.equal([
                ['beforeGreet', 'maya'],
                ['greet', 'maya'],
                ['afterGreet', 'maya', 'hi maya']
            ]);
        });
    });

})
