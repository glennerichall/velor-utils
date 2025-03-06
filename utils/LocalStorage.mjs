import {
    isBrowser,
    isJsDom,
    isNode
} from "./platform.mjs";
import {NotImplementedError} from "./errors/NotImplementedError.mjs";
import {NodeLocalStorage} from "./NodeLocalStorage.mjs";

let storage;

if (isBrowser && !isJsDom) {
    storage = localStorage;
} else if (isNode || isJsDom) {
    storage = new NodeLocalStorage();
} else {
    throw new NotImplementedError("Platform is not supported");
}

export class LocalStorage {
    #keyMappings = new Map();

    constructor() {
    }

    getValue(key, defaultValue) {
        let value = storage.getItem(key);
        if (value !== null) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = null;
            }
        } else {
            value = defaultValue;
        }
        return value;
    }

    setValue(key, value) {
        storage.setItem(key, JSON.stringify(value))
    }

    removeValue(key) {
        storage.removeItem(key);
    }

    clear() {
        storage.clear();
    }
}