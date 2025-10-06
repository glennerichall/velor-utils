export function createProxyReplaceArguments(target, getArguments) {
    return new Proxy(target, {

        get(target, prop, receiver) {
            if (typeof target[prop] === 'function') {
                return function (...args) {
                    return target[prop].apply(target, getArguments(prop, args));
                };
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}

export function createProxyReplaceResult(target, getResult) {
    return new Proxy(target, {

        get(target, prop, receiver) {
            if (typeof target[prop] === 'function') {
                return function (...args) {
                    const result = target[prop].apply(target, args);
                    if (result instanceof Promise) {
                        return result.then(result => getResult(result, target, prop));
                    }
                    return getResult(result, target, prop);
                };
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}

export function createProxyRenameMethods(target, getNewName) {
    return new Proxy(target, {

        get(target, prop, receiver) {
            let newProp = getNewName(prop, target);
            if (typeof proxy[newProp] === 'function') {
                prop = newProp;
            }

            if (typeof target[prop] === 'function') {
                return function (...args) {
                    return target[prop].apply(target, args);
                };
            }

            return Reflect.get(target, prop, receiver);
        }
    });
}

export function createProxyReplaceMethods(target, proxy) {
    return new Proxy(target, {

        get(target, prop, receiver) {
            if (typeof proxy[prop] === 'function') {
                return function (...args) {
                    return proxy[prop].apply(proxy, args);
                };
            } else if (typeof target[prop] === 'function') {
                return function (...args) {
                    return target[prop].apply(target, args);
                };
            }

            return Reflect.get(target, prop, receiver);
        }
    });
}

export function createProxyObserveMethods(target, observer) {
    return new Proxy(target, {

        get(target, prop, receiver) {
            // if the property is a function then call hooks and function
            if (typeof target[prop] === 'function') {
                return function (...args) {
                    // get name of function with capitalized first letter
                    let suffix = prop[0].toUpperCase() + prop.slice(1);

                    // get hook names
                    let before = 'onBefore' + suffix;
                    let after = 'onAfter' + suffix;
                    let error = 'onError' + suffix;

                    let beforeHook = observer[before];
                    let afterHook = observer[after];
                    let errorHook = observer[error];

                    // call before hook if it exists
                    if (typeof beforeHook === 'function') {
                        beforeHook(target, args);
                    }

                    // call method
                    let result;
                    try {
                        result = target[prop].apply(target, args);
                    } catch (error) {
                        if (typeof errorHook === 'function') {
                            errorHook(error, target, args);
                        }
                        throw error;
                    }

                    // if the result is a promise, then wait the result to be resolved
                    if (result instanceof Promise) {
                        result.then(result => {
                            if (typeof afterHook === 'function') {
                                afterHook(result, target, args);
                            }
                        }).catch(error => {
                            if (typeof errorHook === 'function') {
                                errorHook(error, target, args);
                            }
                            throw error;
                        });
                    }

                    // the result is not a future, call hook immediately
                    else {
                        // call after hook if it exists
                        if (typeof afterHook === 'function') {
                            afterHook(result, target, args);
                        }
                    }

                    return result;
                };
            }

            // It may be a property, call it.
            return Reflect.get(target, prop, receiver);
        }
    });
}

export function createProxyClassObserveMethods(Class, observer) {
    return class extends Class {
        constructor(...args) {
            super(...args);
            return new Proxy(this, {
                get(target, prop, receiver) {
                    if (typeof target[prop] === 'function') {
                        return function (...args) {
                            const result = target[prop].apply(target, args);
                            let listener = 'on' + prop[0].toUpperCase() + prop.slice(1);
                            if (typeof observer[listener] === 'function') {
                                observer[listener](result, target, ...args);
                            }
                            return result;
                        };
                    }
                    return Reflect.get(target, prop, receiver);
                }
            });
        }
    };
}

export function createPatchedClassObserveMethods(Class, observer) {
    return class extends Class {
        constructor(...args) {
            super(...args);

            // Define or ensure the observer is available in the scope.
            let currentPrototype = Object.getPrototypeOf(this);

            while (currentPrototype && currentPrototype !== Object.prototype) {
                Object.getOwnPropertyNames(currentPrototype)
                    .filter(prop => typeof this[prop] === 'function' && prop !== 'constructor')
                    .forEach(methodName => {
                        const originalMethod = this[methodName];
                        this[methodName] = (...args) => {
                            const result = originalMethod.apply(this, args);

                            const listener = 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
                            if (typeof observer[listener] === 'function') {
                                observer[listener](result, this, ...args);
                            }

                            return result;
                        };
                    });
                currentPrototype = Object.getPrototypeOf(currentPrototype);
            }
        }
    };
}

export const createProxyPropToMethodCall = provider =>
    new Proxy(provider, {
        get(target, prop, receiver) {
            if (!target[prop]) {
                throw new Error(`Method '${prop}' does not exist in target`);
            }
            return target[prop]();
        }
    });

export function createProxyAroundAnyAsyncMethod(obj, onBefore, onAfter) {
    return new Proxy(obj, {
        get(target, prop, receiver) {
            if (!target[prop]) {
                throw new Error(`Method '${prop}' does not exist in target`);
            }

            return async (...args) => {
                onBefore(target, prop, args);
                let result = await target[prop](...args);
                onAfter(result, target, prop, args);
                return result;
            }
        }
    });
}

export function createProxyInjectArgBefore(getArg, manager) {
    return createProxyReplaceArguments(manager, (prop, args) => {
        const user = getArg();
        return [user, ...args];
    });
}

export function forwardMethods(target, source) {
    let original = Object.getOwnPropertyNames(target)

    let currentObject = source
    while (currentObject !== Object.prototype) {
        Object.getOwnPropertyNames(currentObject)
            .filter(prop => prop !== 'constructor' &&
                typeof currentObject[prop] === 'function' &&
                !original.includes(prop))
            .forEach(method => {
                target[method] = (...args) => source[method].apply(source, args)
            })
        currentObject = Object.getPrototypeOf(currentObject)
    }

    return target
}

function makeAsyncProxy(instance) {
    return new Proxy(instance, {
        get(target, prop) {
            const originalValue = target[prop];

            // Check if the property is a function
            if (typeof originalValue === 'function') {
                return async function (...args) {
                    // Invoke the original method with the passed arguments
                    return await originalValue.apply(target, args);
                };
            }

            // Return the property as is if it's not a function
            return originalValue;
        }
    });
}

export function getAllMethods(obj) {

    if(!obj) return [];

    let props = new Set();
    let currentObj = obj.constructor.prototype;

    while (Object.getPrototypeOf(currentObj)) {
        Object.getOwnPropertyNames(currentObj)
            .filter(prop => typeof currentObj[prop] === 'function' && prop !== 'constructor')
            .forEach(prop => props.add(prop));

        currentObj = Object.getPrototypeOf(currentObj);
    }

    return Array.from(props);
}
