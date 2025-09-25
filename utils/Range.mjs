export class Range {

    #first;
    #last;
    #max;

    constructor(range) {
        this.#first = range.first;
        this.#last = range.last;
        this.#max = range.max;
    }

    get first() {
        return this.#first;
    }

    set first(value) {
        this.#first = value;
        if (this.#last < this.#first) {
            this.#last = this.#first;
        }
        this.#clamp();
    }

    get last() {
        return this.#last;
    }

    set last(value) {
        this.#last = value;
        if (this.#last < this.#first) {
            this.#first = this.#last;
        }
        this.#clamp();
    }

    get count() {
        return this.last - this.first + 1;
    }

    set count(value) {
        this.#last = this.#first + value - 1;
        this.#clamp();
    }

    get max() {
        return this.#max;
    }

    set max(value) {
        this.#max = value;
        this.#clamp();
    }

    set range(array) {
        let range = {};
        if (array.length >= 1) {
            range.first = array[0];
        }

        if (array.length >= 2) {
            range.last = array[1];
        }

        if (array.length >= 3) {
            range.max = array[2];
        }

        this.setValue(range);
    }

    get valid() {
        return this.#first !== null && this.#last !== null;
    }

    static fromArray(arr) {
        return new Range({
            first: arr[0],
            last: arr[1],
            max: arr[2],
        });
    }

    #clamp() {
        let count = this.count;
        if (this.#first < 0) {
            this.#first = 0;
            this.#last = this.#first + Math.min(count, this.#max) - 1;
        } else if (this.#last > this.#max) {
            this.#last = this.#max;
            this.#first = this.#last - Math.min(count, this.#max) + 1;
        }
    }

    setValue(value) {
        const range = {
            first: this.#first,
            last: this.#last,
            max: this.#max,
            ...value,
        };
        this.#first = range.first;
        this.#last = range.last;
        this.#max = range.max;
        this.#clamp();
        return this;
    }

    moveDown(d = 1) {
        this.#first += d;
        this.#last += d;

        this.#clamp();

        return this;
    }

    moveUp(d = 1) {
        this.moveDown(-d);
        return this;
    }

    jumpToFirst(index = 0) {
        const d = index - this.first;
        this.moveDown(d);
        return this;
    }

    jumpToLast(index) {
        if (index === undefined) {
            index = this.max;
        }
        const d = index - this.last;
        this.moveDown(d);
        return this;
    }

    pageDown() {
        const d = this.count;
        this.moveDown(d);
        return this;
    }

    pageUp() {
        const d = this.count;
        this.moveUp(d);
        return this;
    }

    toArray() {
        return [
            this.first,
            this.last,
            this.max
        ];
    }

    growUp(n = 1) {
        this.#first -= n;
        this.#clamp();
        return this;
    }

    growDown(n = 1) {
        this.#last += n;
        this.#clamp();
        return this;
    }

    shrinkDown(n = 1) {
        return this.growUp(-n);
    }

    shrinkUp(n = 1) {
        return this.growDown(-n);
    }

    clear() {
        this.#first = 0;
        this.#last = 0;
        this.#max = 0;
        return this;
    }

    invalidate() {
        this.#first = null;
        this.#last = null;
        return this;
    }

    expand() {
        const res = [];
        for (let i = this.#first; i <= this.#last; i++) {
            res.push(i);
        }
        return res;
    }

    * [Symbol.iterator]() {
        for (let i = this.#first; i <= this.#last; i++) {
            yield i;
        }
    }
}