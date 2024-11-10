import {noOp} from "./functional.mjs";

export const noOpLogger = {
    trace: noOp,
    silly: noOp,
    debug: noOp,
    warn: noOp,
    info: noOp,
    error: noOp,
    fatal: noOp,
    log: noOp,
};