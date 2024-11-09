let JsDateClass = Date;

export function mockDate(fakeDate) {

    global.Date = class extends JsDateClass {
        constructor(...args) {
            super();
            if (args.length === 0) {
                return new JsDateClass(fakeDate);
            }
            return new JsDateClass(...args);
        }

        static now() {
            return new JsDateClass(fakeDate).getTime();
        }
    };
}

export function resetDate() {
    global.Date = JsDateClass;
}