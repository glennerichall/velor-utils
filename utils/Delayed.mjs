export class Delayed {
    #timeout;
    #timeoutId;
    #disabled = false;
    #currentId;

    constructor(timeout = 1200) {
        this.#timeout = timeout;
    }

    get current() {
        return this.#currentId;
    }

    invalidate(id) {
        //stub
    }

    setEnabled(enabled) {
        this.#disabled = !enabled;
    }

    #request(id) {
        clearTimeout(this.#timeoutId);
        this.#timeoutId = setTimeout(
            () => {
                this.#currentId = id;
                this.invalidate(id);
            },
            this.#timeout);
    }

    update(id, immediate = false) {
        if (this.#disabled) return;
        if (immediate) {
            clearTimeout(this.#timeoutId);
            this.#currentId = id;
            this.invalidate(id);
        } else {
            this.#request(id);
        }
    }

    updateNow(id) {
        this.update(id, true);
    }

    clear() {
        this.update(null);
    }

    clearNow() {
        this.updateNow(null);
    }
}