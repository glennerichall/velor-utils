import sinon from "sinon";
import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

import {Stats} from "../utils/Stats.mjs";
import {timeoutAsync} from "../utils/sync.mjs";

test.describe('Stats Class', () => {
    let stats;

    test.beforeEach(() => {
        stats = new Stats();
    });

    test('should initialize with correct default values', () => {
        expect(stats.min).to.equal(Number.POSITIVE_INFINITY);
        expect(stats.max).to.equal(0);
        expect(stats.avg).to.equal(0);
        expect(stats.last).to.equal(0);
    });

    test('should update min, max, avg, and last after tic/toc', async () => {
        stats.tic();
        await timeoutAsync(50); // Simulate delay
        stats.toc();

        expect(stats.last).to.be.greaterThan(0);
        expect(stats.min).to.equal(stats.last);
        expect(stats.max).to.equal(stats.last);
        expect(stats.avg).to.equal(stats.last);
    });

    test('should correctly update min and max over multiple tic/toc calls', async () => {
        stats.tic();
        await timeoutAsync(30); // Simulate delay
        stats.toc();

        stats.tic();
        await timeoutAsync(70); // Simulate delay
        stats.toc();

        expect(stats.min).to.be.greaterThan(0);
        expect(stats.max).to.be.greaterThan(stats.min);
        expect(stats.avg).to.be.within(stats.min, stats.max);
    });

    test('should correctly update avg over multiple tic/toc calls', async () => {
        stats.tic();
        await timeoutAsync(40); // Simulate delay
        stats.toc();

        stats.tic();
        await timeoutAsync(60); // Simulate delay
        stats.toc();

        expect(stats.avg).to.be.within(40, 60);
    });

    test('should handle rapid successive tic/toc calls', async () => {
        for (let i = 0; i < 5; i++) {
            stats.tic();
            await new Promise(resolve => setTimeout(resolve, 10 + i * 5)); // Increasing delay
            stats.toc();
        }

        expect(stats.min).to.be.lessThan(stats.max);
        expect(stats.avg).to.be.within(stats.min, stats.max);
    });

});
