

export class Stats {
    #min;
    #max;
    #avg;
    #last;
    #tic;
    #count;

    constructor() {
        this.reset();
    }

    reset() {
        this.#min = Number.MAX_VALUE;
        this.#max = Number.MIN_VALUE;
        this.#avg = 0;
        this.#last = 0;
        this.#tic = 0;
        this.#count = 0;
    }

    get min() {
        return Math.round(this.#min * 100) / 100;
    }

    get max() {
        return Math.round(this.#max * 100) / 100;
    }

    get avg() {
        return Math.round(this.#avg * 100) / 100;
    }

    get last() {
        return Math.round(this.#last * 100) / 100;
    }

    tic() {
        this.#count++;
        this.#tic = new Date();
        return this;
    }

    toc() {
        const toc = new Date();
        const span = toc.getTime() - this.#tic.getTime();
        this.#last = span;
        if(span !== 0) {
            this.#avg = this.#avg + (span - this.#avg) / this.#count;
            this.#min = Math.min(this.#min, span);
            this.#max = Math.max(this.#max, span);
        }
        return this;
    }


}