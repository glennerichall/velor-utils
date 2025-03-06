export class NodeLocalStorage {
    #store = new Map();

    getItem(key) {
        return this.#store.get(key) ?? null;
    }

    setItem(key, value) {
        this.#store.set(key, value);
    }

    removeItem(key) {
        this.#store.remove(key);
    }

    clear() {
        this.#store.clear();
    }

}