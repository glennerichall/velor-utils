import {setupTestContext} from "../test/setupTestContext.mjs";
import {
    capitalizeToNormalCase,
    generateRandomString,
    globToRegExp,
    removeAnsiColors,
    streamToString,
    toNoCase,
    unCamelize,
    unSeparate
} from "../utils/string.mjs";
import {Readable} from "stream";

const {
    expect,
    test,
    describe,
    it
} = setupTestContext();

test.describe('string utils', () => {
    describe('streamToString', () => {
        test('converts a stream to a string', async () => {
            const data = 'Hello, World!';
            const stream = Readable.from(Buffer.from(data));

            const result = await streamToString(stream);
            expect(result).to.deep.eq(data);
        });

        test('throws an error when the stream errors', async () => {
            const error = new Error('test error');
            const stream = new Readable({
                read() {
                    this.emit('error', error);
                }
            });
            let err = null;
            try {
                await streamToString(stream);
            } catch (e) {
                err = e;
            }
            expect(err).to.be.an('error');
            expect(err.message).to.deep.equal('test error');
        });
    });

    describe('removeAnsiColors', function () {
        it('should remove ansi colors from a string', function () {
            const str = '\x1B[31mhello world\x1B[m';
            const result = removeAnsiColors(str);
            expect(result).to.deep.equal('hello world');
        });

        it('should return the same string if there are no ansi colors', function () {
            const str = 'hello world';
            const result = removeAnsiColors(str);
            expect(result).to.deep.equal('hello world');
        });

        it('should handle empty strings', function () {
            const str = '';
            const result = removeAnsiColors(str);
            expect(result).to.deep.equal('');
        });

        it('should return the original string if called with a string without any ansi sequences', function () {
            const str = 'No ANSI sequence here';
            const result = removeAnsiColors(str);
            expect(result).to.deep.equal(str);
        });

        it('should handle strings with only ansi colors', function () {
            const str = '\x1B[31m\x1B[m';
            const result = removeAnsiColors(str);
            expect(result).to.deep.equal('');
        });
    });

    describe('globToRegExp', () => {

        it('should correctly convert glob to regex', () => {
            const regex = globToRegExp('abc*def?ghi');
            expect(regex).to.be.instanceOf(RegExp);
            expect(regex.source).to.deep.equal('^abc[^\\/]*def[^\\/]ghi$');
        });

        it('should escape special characters correctly', () => {
            const regex = globToRegExp('abc[def]ghi');
            expect(regex).to.be.instanceOf(RegExp);
            expect(regex.source).to.deep.equal('^abc\\[def\\]ghi$');
        });

        it('should handle empty string correctly', () => {
            const regex = globToRegExp('');
            expect(regex).to.be.instanceOf(RegExp);
            expect(regex.source).to.deep.equal('^$');
        });

        it('should handle multiple wildcards correctly', () => {
            const regex = globToRegExp('*?*?*');
            expect(regex).to.be.instanceOf(RegExp);
            expect(regex.source).to.deep.equal('^[^\\/]*[^\\/][^\\/]*[^\\/][^\\/]*$');
        });

        it('should handle single wildcard correctly', () => {
            const regex = globToRegExp('*');
            expect(regex).to.be.instanceOf(RegExp);
            expect(regex.source).to.deep.equal('^[^\\/]*$');
        });

    });

    describe('generateRandomString', () => {
        it('should generate a string of the correct length', () => {
            const length = 10;
            const string = generateRandomString(length);
            expect(string).to.have.length(length);
        });

        it('should generate a different string each time', () => {
            const string1 = generateRandomString(10);
            const string2 = generateRandomString(10);
            expect(string1).to.not.equal(string2);
        });

        it('should only contain valid characters', () => {
            const validCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const string = generateRandomString(50);
            for (let i = 0; i < string.length; i++) {
                expect(validCharacters).to.include(string[i]);
            }
        });

        it('should return an empty string when length is 0', () => {
            const string = generateRandomString(0);
            expect(string).to.deep.equal('');
        });
    });

    describe("capitalizeToNormalCase", () => {
        test('should return an array of words in Normal Case', () => {
            expect(capitalizeToNormalCase('hello world')).to.eq('Hello World');
            expect(capitalizeToNormalCase('HELLO WORLD')).to.eq('Hello World');
            expect(capitalizeToNormalCase('HeLLo WoRLD')).to.eq('Hello World');
        });

        test('should handle string with punctuation and special characters', () => {
            expect(capitalizeToNormalCase('hello-world')).to.eq('Hello World');
            expect(capitalizeToNormalCase('hello_world')).to.eq('Hello World');
            expect(capitalizeToNormalCase('hello.world')).to.eq('Hello World');
        });

        test('should handle camel cased strings', () => {
            expect(capitalizeToNormalCase('helloWorld')).to.eq('Hello World');
        });

        test('should handle digits in the string', () => {
            expect(capitalizeToNormalCase('hello123World456')).to.eq('Hello123 World456');
        });

        test('should handle empty strings', () => {
            expect(capitalizeToNormalCase('')).to.eq('');
        });

        test('should handle strings with space only', () => {
            expect(capitalizeToNormalCase('   ')).to.eq('');
        });

        test('should handle null string', () => {
            expect(capitalizeToNormalCase(null)).to.be.undefined;
        });
    })

    describe('unCamelize function test', () => {

        test('Should convert camelCase to separate words', async () => {
            const result = unCamelize('camelCaseString');
            expect(result).to.be.equal('camel case string');
        });

        test('Should deal with single word', async () => {
            const result = unCamelize('word');
            expect(result).to.be.equal('word');
        });

        test('Should handle empty case', async () => {
            const result = unCamelize('');
            expect(result).to.be.equal('');
        });
    });

    test.describe('toNoCase function test', () => {

        test('Should convert all to lower case if string has space', async () => {
            const result = toNoCase('LOWERCASE');
            expect(result).to.be.equal('lowercase');
        });

    });

    test.describe('unSeparate function test', () => {

        test('Should remove characters that are not letters or numbers', async () => {
            const result = unSeparate('This@is.a$string');
            expect(result).to.be.equal('This is a string');
        });

    });

})

