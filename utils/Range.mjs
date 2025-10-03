export class Range {

    #first;
    #last;
    #max;
    #min;

    constructor({
                    first = null,
                    last = null,
                    max,
                    min = 0,
                    count = null
                } = {}) {

        const provided = [
            first !== null,
            last !== null,
            count !== null
        ].filter(Boolean).length;
        if (provided > 2) {
            throw new Error("At most two of 'first', 'last' or 'count' must be provided.");
        } else if (provided === 1) {
            throw new Error("At least two of 'first', 'last' or 'count' must be provided.");
        }

        // Déductions en mode last exclusif
        if (last === null && first !== null && count !== null) {
            last = first + count;
        } else if (first === null && last !== null && count !== null) {
            first = last - count;
        }

        if (first > last) {
            let tmp = first;
            first = last;
            last = tmp;
        }

        this.#first = first;
        this.#last = last;
        this.#max = max;
        this.#min = min;

        this.#clamp();
    }

    get first() {
        return this.#first;
    }

    set first(value) {
        if (value !== this.#first) {
            this.#first = value;
            if (this.#last < this.#first) {
                this.#last = this.#first;        // autorise plage vide
            }
            this.#clamp();
            this.valueChanged();
        }
    }

    get last() {
        return this.#last;
    }

    set last(value) {
        if (value !== this.#last) {
            this.#last = value;
            if (this.#last < this.#first) {
                this.#first = this.#last;        // autorise plage vide
            }
            this.#clamp();
            this.valueChanged();
        }
    }

    get count() {
        return Math.max(0, this.last - this.first);
    }

    set count(value) {
        value = Math.max(0, value);
        if (this.count !== value) {
            this.#last = this.#first + value;
            this.#clamp();
            this.valueChanged();
        }
    }

    get max() {
        return this.#max;
    }

    set max(value) {
        if (this.#max !== value) {
            this.#max = value;
            this.#clamp();
            this.valueChanged();
        }
    }

    get min() {
        return this.#min;
    }

    set min(value) {
        if (value !== this.#min) {
            this.#min = value;
            this.#clamp();
            this.valueChanged();
        }
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
        const count = this.count;
        const cap = (this.#max == null ? null : this.#max); // borne exclusive dérivée

        if (this.#first < this.#min) {
            this.#first = this.#min;
            if (cap !== null) this.#last = Math.min(this.#first + count, cap);
            else this.#last = this.#first + count;
        } else if (cap !== null && this.#last > cap) {
            this.#last = cap;
            this.#first = Math.max(this.#min, this.#last - count);
        }
    }

    setValue(value) {
        const range = {
            first: this.#first,
            last: this.#last,
            max: this.#max,
            min: this.#min,
            ...value,
        };

        if (range.first > range.last) {
            const tmp = range.first;
            range.first = range.last;
            range.last = tmp;
        }

        if (range.first !== this.#first ||
            range.last !== this.#last ||
            range.max !== this.#max ||
            range.min !== this.#min) {

            this.#first = range.first;
            this.#last = range.last;   // exclusif
            this.#max = range.max;
            this.#min = range.min;
            this.#clamp();
            this.valueChanged();
        }
        return this;
    }

    moveDown(d = 1) {
        let {
            first,
            last,
        } = this

        this.#first += d;
        this.#last += d;

        this.#clamp();

        if (first !== this.#first ||
            last !== this.#last) {
            this.valueChanged();
        }

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
            index = (this.max == null ? this.last : this.max);
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
            this.min,
            this.max
        ];
    }

    growTo(index) {
        const d0 = this.first - index;
        const d1 = index - this.last;  // last exclusif

        if (d0 > 0) {
            this.growUp(d0);
        } else if (d1 > 0) {
            this.growDown(d1);
        }
        return this;
    }

    growUp(n = 1) {
        let {
            first,
            last,
        } = this

        this.#first -= n;
        this.#clamp();
        if (first !== this.#first ||
            last !== this.#last) {
            this.valueChanged();
        }
        return this;
    }

    growDown(n = 1) {
        let {
            first,
            last,
        } = this
        this.#last += n;
        this.#clamp();
        this.valueChanged();
        if (first !== this.#first ||
            last !== this.#last) {
            this.valueChanged();
        }
        return this;
    }

    shrinkDown(n = 1) {
        return this.growUp(-n);
    }

    shrinkUp(n = 1) {
        return this.growDown(-n);
    }

    shrinkTo(index) {
        const d0 = index - this.first;
        const d1 = this.last - index;

        if (d0 < d1) {
            this.shrinkDown(d0);
        } else if (d1 > 0) {
            this.shrinkUp(d1);
        }
        return this;
    }

    adjustTo(index, pivot) {
        let {
            first,
            last,
        } = this

        if (index < pivot) {
            this.#first = index;
        } else if (index > pivot) {
            this.#last = index;
        } else {
            this.last =
                this.first = index;
        }

        if (first !== this.#first ||
            last !== this.#last) {
            this.valueChanged();
        }
        return this;
    }

    clear() {
        let {
            first,
            last,
            max,
            min
        } = this
        this.#first = 0;
        this.#last = 0;
        this.#max = 0;
        this.#min = 0;

        if (first !== this.#first ||
            last !== this.#last ||
            max !== this.#max) {
            this.valueChanged();
        }

        return this;
    }

    invalidate() {
        let {
            first,
            last,
            max,
            min
        } = this
        this.#first = null;
        this.#last = null;

        if (first !== this.#first ||
            last !== this.#last ||
            max !== this.#max ||
            min !== this.#min) {
            this.valueChanged();
        }

        return this;
    }

    valueChanged() {
        // stub
    }

    inRange(value) {
        return value >= this.first && value < this.last;
    }

    expand() {
        const res = [];
        for (let i = this.#first; i < this.#last; i++) {
            res.push(i);
        }
        return res;
    }

    * [Symbol.iterator]() {
        for (let i = this.#first; i < this.#last; i++) {
            yield i;
        }
    }
}