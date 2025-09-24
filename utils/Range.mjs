export class Range {

    constructor(range) {
        this._range = range;
    }

    get first() {
        return this._range.first;
    }

    set first(value) {
        this.setValue({first: value});
    }

    get last() {
        return this._range.last;
    }

    set last(value) {
        this.setValue({last: value});
    }

    get count() {
        return this.last - this.first + 1;
    }

    get max() {
        return this._range.max;
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

    static fromArray(arr) {
        return new Range({
            first: arr[0],
            last: arr[1],
            max: arr[2],
        });
    }

    setValue(value) {
        const current = this._range;
        const range = {
            ...current,
            ...value,
        };

        if (range.last >= range.max) {
            const dist = range.last - range.first;
            range.last = range.max;
            range.first = range.max - dist;
        }

        if (current.max !== range.max &&
            range.first < 0) {
            const d = -range.first;
            range.first = 0;
            range.last += d;
        }

        if (current.first !== range.first ||
            current.last !== range.last ||
            current.max !== range.max) {
            this._range = {...range};
        }
        return this;
    }

    moveDown(d = 1) {
        const range = this._range;
        let dist = range.last - range.first;
        let first = range.first + d;
        let last = range.last + d;
        let max = range.max;

        if (first < 0) {
            first = 0;
            last = dist;
        } else if (last > max) {
            last = max;
            first = last - dist;
        }

        this._range = {
            first,
            last,
            max
        };

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

    expand() {
        const range = this._range;
        const res = [];
        for (let i = range.first; i <= range.last; i++) {
            res.push(i);
        }
        return res;
    }

    * [Symbol.iterator]() {
        for (let i = this.first; i <= this.last; i++) {
            yield i;
        }
    }
}