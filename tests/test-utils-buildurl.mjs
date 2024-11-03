import {setupTestContext} from "../test/setupTestContext.mjs";
import {
    areUrlsOnSameSite,
    buildUrl,
    getQueryStringAsObject,
    isValidURL
} from "../utils/urls.mjs";

const {
    expect,
    describe,
    it
} = setupTestContext();


describe("URL Utilities", function() {
    it("http and https URLs should not be on same site", function() {
        const url1 = 'http://same-site.com/';
        const url2 = 'https://same-site.com/';
        expect(areUrlsOnSameSite(url1, url2)).to.be.false;
    });

    it("http and https URLs with same hostname should not be on same site", function() {
        const url1 = 'http://same-site.com:8080';
        const url2 = 'https://same-site.com:8080';
        expect(areUrlsOnSameSite(url1, url2)).to.be.false;
    });

    it("Different hosts should not be on same site", function() {
        const url1 = 'http://site1.com';
        const url2 = 'http://site2.com';
        expect(areUrlsOnSameSite(url1, url2)).to.be.false;
    });

    it("Same URL should be on same site", function() {
        const url1 = 'http://same-site.com/john/doe';
        const url2 = 'http://same-site.com/etc/blah';
        expect(areUrlsOnSameSite(url1, url2)).to.be.true;
    });

    it("Invalid URLs should return false", function() {
        const url1 = 'invalid-url';
        const url2 = 'http://valid-site.com';
        expect(areUrlsOnSameSite(url1, url2)).to.be.false;
    });

    it("Test Query string as object", function() {
        const url = 'http://site.com?param1=value1&param2=value2';
        const queryStringObject = getQueryStringAsObject(url);
        expect(queryStringObject).to.have.property('param1').to.equal('value1');
        expect(queryStringObject).to.have.property('param2').to.equal('value2');
    });

    it("Invalid URLs should return empty query string object", function() {
        const url = 'invalid-url';
        const queryStringObject = getQueryStringAsObject(url);
        expect(queryStringObject).to.be.an('object').that.is.empty;
    });

    it("URL Building", function() {
        const url = 'https://localhost:3000/api/v1/:what/:bucketname';
        const params = {bucketname: '1234', what: 'files'};
        const builtUrl = buildUrl(url, params);
        expect(builtUrl).to.equal('https://localhost:3000/api/v1/files/1234');
    });

    it("URL Building with query parameters", function() {
        const url = 'https://localhost:3000/api/v1/:what/:bucketname';
        const params = {bucketname: '1234', what: 'files'};
        const query = {search: 'jpg'};
        const builtUrl = buildUrl(url, params, query);
        expect(builtUrl).to.equal('https://localhost:3000/api/v1/files/1234?search=jpg');
    });

    it("URL validity", function() {
        const url = 'https://localhost:3000/api/v1/files/1234';
        const isValid = isValidURL(url);
        expect(isValid).to.be.true;
    });

    it("Invalid URL", function() {
        const url = 'invalid-url';
        const isValid = isValidURL(url);
        expect(isValid).to.be.false;
    });
});