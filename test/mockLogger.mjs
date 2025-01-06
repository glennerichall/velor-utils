import sinon from "sinon";

export const mockLogger = {
    error: sinon.stub(),
    trace: sinon.stub(),
    silly: sinon.stub(),
    debug: sinon.stub(),
    warn: sinon.stub(),
    info: sinon.stub(),
    fatal: sinon.stub(),
    log: sinon.stub(),
};