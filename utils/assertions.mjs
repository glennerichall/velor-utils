import {
    ENV_DEVELOPMENT,
    ENV_TEST
} from "../env.mjs";

export class AssertionError extends Error {
    constructor(message) {
        super(message);
    }
}

export function assert(cond, message) {
    if (process.env.NODE_ENV === ENV_DEVELOPMENT ||
        process.env.NODE_ENV === ENV_TEST) {
        if (!cond) throw new AssertionError(message);
    }
}