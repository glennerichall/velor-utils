export class NotTestedError extends Error {
    constructor() {
        super("Not tested, not ready for production");
    }
}