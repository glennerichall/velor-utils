import {setupTestContext} from "../test/setupTestContext.mjs";
import {
    createProxyReplaceArguments,
    createProxyReplaceResult,
    forwardMethods
} from "../utils/proxy.mjs";


const {
    expect,
    test,
    it
} = setupTestContext();

test.describe('proxy utils', () => {

    test.describe('Test ducktyping of methods', () => {
        test('should apply source methods to target', () => {
            const source = {
                greet() { return "Hello, Source!"; },
                bye() { return "Source is leaving."; }
            };

            const target = {};

            forwardMethods(target, source);

            expect(target).to.have.property('greet');
            expect(target).to.have.property('bye');
            expect(target.greet()).to.eql("Hello, Source!");
            expect(target.bye()).to.eql("Source is leaving.");
        })

        it('should apply source methods to target 2', () => {
            const source = {
                greet(name) { return `Hello, ${name}!`; },
            };

            const target = {};

            forwardMethods(target, source);

            expect(target).to.have.property('greet');
            expect(target.greet('John')).to.eql("Hello, John!");
        });

        it('should not modify existing methods in target', () => {
            const source = {
                greet(name) { return `Hello, ${name}!`; },
            };

            const target = {
                greet(name) { return `Goodbye, ${name}!`; },
            };

            forwardMethods(target, source);

            expect(target.greet('John')).to.eql("Goodbye, John!");
        });

        it('should not affect source object', () => {
            const source = {
                greet(name) { return `Hello, ${name}!`; },
            };

            const sourceCopy = { ...source };
            const target = {};

            forwardMethods(target, source);

            expect(source).to.eql(sourceCopy); // source object should not be changed
        });
    });

    test.describe('createProxyReplaceArguments', () => {
        test('should call the replaced function with replaced arguments', async () => {
            const target = {
                foo: (...args) => args.join()
            };
            const getArguments = (prop, args) => ['baz'];
            const proxy = createProxyReplaceArguments(target, getArguments);

            const result = proxy.foo('x');
            expect(result).to.equal('baz');
        });

        test('should work with multiple arguments', async () => {
            const target = {
                foo: (...args) => args.join()
            };
            const getArguments = (prop, args) => ['baz', 'qux'];
            const proxy = createProxyReplaceArguments(target, getArguments);

            const result = proxy.foo('x', 'y');
            expect(result).to.equal('baz,qux');
        });

        test('should not affect non-function properties', async () => {
            const target = {foo: 'bar'};
            const getArguments = () => ['baz'];
            const proxy = createProxyReplaceArguments(target, getArguments);

            expect(proxy.foo).to.equal('bar');
        });


        test('should replace methods added to built-in prototypes', async () => {
            const target = [1, 2, 3];
            target.foo = (...args) => args.join();
            const getArguments = () => ['baz'];
            const proxy = createProxyReplaceArguments(target, getArguments);

            const result = proxy.foo('x');
            expect(result).to.equal('baz');
        });

    });

    test.describe('createProxyReplaceResult', () => {
        test('should replace the result of a function return', async () => {
            const target = {
                foo: (...args) => args.join()
            };
            const getResult = () => 'baz';
            const proxy = createProxyReplaceResult(target, getResult);

            const result = proxy.foo('x');
            expect(result).to.equal('baz');
        });

        test('should replace the result of async function return without altering the initial target[prop]', async () => {
            const target = {
                foo: async (...args) => args.join()
            };
            const getResult = (result, target, prop) => 'baz';
            const proxy = createProxyReplaceResult(target, getResult);

            const result = await proxy.foo('x');
            expect(result).to.equal('baz');
            expect(target.foo('x')).to.eventually.equal('x');
        });

        test('should not affect non-function properties', async () => {
            const target = { foo: 'bar' };
            const getResult = () => 'baz';
            const proxy = createProxyReplaceResult(target, getResult);

            expect(proxy.foo).to.equal('bar');
        });

        test('should replace methods added to built-in prototypes', async () => {
            const target = [1, 2, 3];
            target.foo = (...args) => args.join();
            const getResult = () => 'baz';
            const proxy = createProxyReplaceResult(target, getResult);

            const result = proxy.foo('x');
            expect(result).to.equal('baz');
        });

    });



})