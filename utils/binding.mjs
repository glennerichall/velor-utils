// Replace the method "funName" with function "before"
// "before" method will be called then original method will be called
export function bindBeforeMethod(target, funName, before) {
    let targetMethod = target[funName].bind(target);
    target[funName] = (...args) => {
        let result = before({args, target});
        if (!result) {
            return targetMethod(...args);
        }
        return result;
    }
    return target;
}

// Replace the method "funName" with function "after"
// original method will be called "after" method will be called then
export function bindAfterMethod(target, funName, after, async = false) {
    let targetMethod = target[funName].bind(target);
    target[funName] = (...args) => {
        let res = targetMethod(...args);
        if (async) {
            return res.then(async res => {
                let newRes = await after({args, res, target});
                return newRes ?? res;
            });
        } else {
            let newRes = after({args, res, target});
            return newRes ?? res;
        }

    }
    return target;
}

export function bindOnThrow(target, funName, onError, {rethrow = true, async = false} = {}) {
    let targetMethod = target[funName].bind(target);
    target[funName] = (...args) => {
        if (async) {
            return targetMethod(...args)
                .catch(error => {
                    onError({error, args, target});
                    if (rethrow) {
                        throw error;
                    }
                });
        }
        try {
            return targetMethod(...args);
        } catch (error) {
            onError({error, args, target});
            if (rethrow) {
                throw error;
            }
        }
    }
    return target;
}


// Replace the method "funName" with function "modifier"
// Calls the original method and sends the result to "modifier"
// returns "modifier" result to caller.
export function bindReplaceResult(target, funName, modifier, async = false) {
    let targetMethod = target[funName].bind(target);
    target[funName] = (...args) => {
        let res = targetMethod(...args);
        if (async) {
            return res.then(res => {
                return modifier(res, ...args);
            });
        }
        return modifier(res, ...args);
    }
    return target;
}

// Replace all the methods in "observer" beginning with "on" that
// exists in "target" without "on". Ex. target.run() and observer.onRun().
export function bindOnAfterMethods(target, observer, async) {
    return __bindOnAfter(target, observer, async);
}

function __bindOnMethods({
                             target,
                             observer,
                             prefix = 'on',
                             binding,
                             async = false
                         }) {
    const prefixLen = prefix.length;
    for (let key in observer) {
        let name;
        if (key.startsWith(prefix) && typeof observer[key] === 'function') {
            name = key[prefixLen].toLowerCase() + key.substring(prefixLen + 1);
            let targetMethod = target[name];
            if (typeof targetMethod === 'function') {
                binding(target, name, (...args) => observer[key](...args), async)
            } else {
                throw new Error(`Execution capture ${key} does not refer to a function in target#${name} (${typeof targetMethod})`);
            }
        }
    }
    return target;
}

function __bindOnAfter(target, observer, prefix, async) {
    return __bindOnMethods({
        target,
        observer,
        prefix,
        binding: bindAfterMethod,
        async
    });
}

function __bindOnBefore(target, observer, prefix, async) {
    return __bindOnMethods({
        target,
        observer,
        prefix,
        binding: bindBeforeMethod,
        async
    });
}

export function bindAroundMethods(obj, observer, async) {
    return __bindOnBefore(
        __bindOnAfter(obj, observer, 'onAfter', async),
        observer, 'onBefore', async);
}

// Same as bindBeforeMethod combined with bindAfterMethod
export function bindAroundMethod(target, funName, before, after, async) {
    return bindAfterMethod(
        bindBeforeMethod(target, funName, before),
        funName, after, async);
}