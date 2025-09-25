import {setupTestContext} from "../test/setupTestContext.mjs";
import {Range} from "../utils/Range.mjs";

const {test, expect} = setupTestContext();

test.describe('Range', () => {

    test('#first', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        expect(new Range(range).first).to.eq(10);
    })

    test('#last', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        expect(new Range(range).last).to.eq(100);
    })

    test('#max', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        expect(new Range(range).max).to.eq(1000);
    })

    test('#count', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        expect(new Range(range).count).to.eq(91);
    })

    test('#moveDown 1', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveDown();
        expect(r.first).to.eq(11);
        expect(r.last).to.eq(101);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#moveDown 2', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveDown(2);
        expect(r.first).to.eq(12);
        expect(r.last).to.eq(102);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#moveDown 1000', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveDown(1000);
        expect(r.first).to.eq(910);
        expect(r.last).to.eq(1000);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#moveUp 1', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveUp();
        expect(r.first).to.eq(9);
        expect(r.last).to.eq(99);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#moveUp 2', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveUp(2);
        expect(r.first).to.eq(8);
        expect(r.last).to.eq(98);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#moveUp 1000', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).moveUp(1000);
        expect(r.first).to.eq(0);
        expect(r.last).to.eq(90);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToFirst', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToFirst();
        expect(r.first).to.eq(0);
        expect(r.last).to.eq(90);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToFirst 77', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToFirst(77);
        expect(r.first).to.eq(77);
        expect(r.last).to.eq(167);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToFirst overflow max', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToFirst(990);
        expect(r.first).to.eq(910);
        expect(r.last).to.eq(1000);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToFirst overflow min', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToFirst(-1);
        expect(r.first).to.eq(0);
        expect(r.last).to.eq(90);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToLast', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToLast();
        expect(r.first).to.eq(910);
        expect(r.last).to.eq(1000);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToLast overflow max', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToLast(1010);
        expect(r.first).to.eq(910);
        expect(r.last).to.eq(1000);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToLast overflow min', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToLast(10);
        expect(r.first).to.eq(0);
        expect(r.last).to.eq(90);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#jumpToLast 110', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).jumpToLast(110);
        expect(r.first).to.eq(20);
        expect(r.last).to.eq(110);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#pageUp', () => {
        const range = {
            first: 110,  // inclusive
            last: 200,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).pageUp();
        expect(r.first).to.eq(110 - 91);
        expect(r.last).to.eq(200 - 91);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#pageUp overflow', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).pageUp().pageUp();
        expect(r.first).to.eq(0);
        expect(r.last).to.eq(90);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#pageDown', () => {
        const range = {
            first: 110,  // inclusive
            last: 200,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).pageDown();
        expect(r.first).to.eq(110 + 91);
        expect(r.last).to.eq(200 + 91);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#pageDown overflow', () => {
        const range = {
            first: 900,  // inclusive
            last: 990,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).pageDown().pageDown();
        expect(r.first).to.eq(910);
        expect(r.last).to.eq(1000);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })

    test('#pageDown.#pageUp', () => {
        const range = {
            first: 10,  // inclusive
            last: 100,  // inclusive
            max: 1000   // inclusive
        };

        const r = new Range(range).pageDown().pageUp();
        expect(r.first).to.eq(10);
        expect(r.last).to.eq(100);
        expect(r.max).to.eq(1000);
        expect(r.count).to.eq(91);
    })


    test("#expand", () => {
        const r = new Range({first: 10, last: 99, max: 1000})
            .expand();

        expect(r).to.be.an('Array');
        expect(r).to.have.lengthOf(90);
        expect(r[0]).to.eq(10);
        expect(r[89]).to.eq(99);
    })

    test("#toArray", () => {
        const r = new Range({first: 10, last: 99, max: 1000})
            .toArray();

        expect(r).to.be.an('Array');
        expect(r).to.have.lengthOf(3);
        expect(r[0]).to.eq(10);
        expect(r[1]).to.eq(99);
        expect(r[2]).to.eq(1000);
    })

    test("iterator", () => {
        let i = 10;
        for (let val of new Range({first: 10, last: 99, max: 1000})) {
            expect(val).to.eq(i++);
        }
    })

    test("#range", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000})

        r.range = [11];

        expect(r.first).to.eq(11);
        expect(r.last).to.eq(99);
        expect(r.max).to.eq(1000);

        r.range = [12, 15];

        expect(r.first).to.eq(12);
        expect(r.last).to.eq(15);
        expect(r.max).to.eq(1000);

        r.range = [13, 66, 67];

        expect(r.first).to.eq(13);
        expect(r.last).to.eq(66);
        expect(r.max).to.eq(67);
    })

    test("set first overflow", ()=> {
        const r = new Range({first: 10, last: 12, max: 1000});
        r.first = 1000;
        expect(r.first).to.eq(1000);
        expect(r.last).to.eq(1000);
        expect(r.count).to.eq(1);
    })

    test("set count", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000})
        r.count = 2;

        expect(r.first).to.eq(10);
        expect(r.last).to.eq(11);
        expect(r.count).to.eq(2);

        r.first = 1000;
        expect(r.first).to.eq(1000);
        expect(r.last).to.eq(1000);
        expect(r.count).to.eq(1);
    })

    test("#growUp", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000})
        r.growUp(2);

        expect(r.first).to.eq(8);
        expect(r.last).to.eq(99);
    })

    test("#shrinkUp", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000})
        r.shrinkUp(2);

        expect(r.first).to.eq(10);
        expect(r.last).to.eq(97);
    })

    test("#grow", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000});
        r.growTo(2);

        expect(r.first).to.eq(2);
        expect(r.last).to.eq(99);

        r.growTo(101);

        expect(r.first).to.eq(2);
        expect(r.last).to.eq(101);

        r.growTo(99);

        expect(r.first).to.eq(2);
        expect(r.last).to.eq(101);
    })

    test("#shrinkTo", ()=> {
        const r = new Range({first: 10, last: 99, max: 1000});
        r.shrinkTo(15);
        expect(r.first).to.eq(15);
        expect(r.last).to.eq(99);

        r.shrinkTo(94);
        expect(r.first).to.eq(15);
        expect(r.last).to.eq(94);
    })

    test("#shrinkTo limit case", ()=> {
        const r = new Range({first: 2, last: 3, max: 1000});
        r.shrinkTo(2);
        expect(r.first).to.eq(2);
        expect(r.last).to.eq(3);
    })
})