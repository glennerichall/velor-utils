// export function deepMerge(obj1, obj2) {
//     const recursiveMerge = (a, b) => {
//         for (let key in b) {
//             // If property is an object, and both a and b have this property
//             if (b[key] && typeof b[key] === 'object' && a.hasOwnProperty(key)) {
//                 a[key] = recursiveMerge({...a[key]}, b[key]);
//             } else {
//                 a[key] = b[key];
//             }
//         }
//         return a;
//     };
//     return recursiveMerge({...obj1}, obj2);
// }

export function deepMerge(obj1, obj2) {
    const recursiveMerge = (a, b) => {
        for (let key in b) {
            if (Array.isArray(b[key])) {
                // If property is an array, replace the array
                a[key] = b[key];
            } else if (b[key] && typeof b[key] === 'object' && a.hasOwnProperty(key)) {
                // If property is an object, and both a and b have this property
                a[key] = recursiveMerge({...a[key]}, b[key]);
            } else {
                a[key] = b[key];
            }
        }
        return a;
    };
    return recursiveMerge({...obj1}, obj2);
}

export function defineUnEnumerable(obj, propName, value) {
    Object.defineProperty(obj, propName, {
        value: value,
        enumerable: false,
        writable: true,
        configurable: true
    });
}

export function enumerateGetters(instance) {
    const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance));
    const getters = [];

    for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor.get) {
            getters.push(key);
        }
    }

    return getters;
}

export function shallowEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (Number.isNaN(object1[key]) &&
            Number.isNaN(object2[key])) {
            continue;
        }
        if (object1[key] !== object2[key]) {
            return false;
        }
    }

    return true;
}

const initialStateSym = Symbol('initialState');

export function saveInitialState(object) {
    object[initialStateSym] = {...object};
    return object;
}

export function isPristine(object) {
    let initialState = object[initialStateSym];
    if (initialState === undefined) {
        return undefined;
    }
    return shallowEqual(initialState, object);
}

export function excludeKeys(object, predicate) {
    let res = {};
    for (let key in object) {
        if (predicate(key, object[key])) {
            res[key] = object[key];
        }
    }
    return res;
}
