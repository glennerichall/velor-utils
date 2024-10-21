// Build the instance provider.
// if no instance is created, create one and keep it in cache.
// Some instances may be forced on initialization

let instanceUuid = 0;

let uuidSymbol = Symbol('uuid');

export function createInstanceProvider(services) {
    const {
        scopes,
        factories
    } = services;

    let providers = {};

    // create provider for all factories
    for (let key in factories) {
        let factory = factories[key];

        let provider = () => {
            // get scope each time
            const {
                scopes,
            } = services;

            // find the instance in scopes.
            for (let scope in scopes) {
                for (let key in scopes[scope]) {
                    let instance = scopes[scope][key];

                    // instance found, no need to create it
                    if (instance !== undefined) {
                        return instance;
                    }
                }
            }

            let ctx = scopes.singleton;

            if (typeof factory === 'object') {
                if (factory.scope) {
                    ctx = scopes[factory.scope];
                }
                factory = factory.factory;
            }

            // create a new instance using the factory and save it into cache
            ctx[key] = factory();
            ctx[key][uuidSymbol] = instanceUuid++;
            return ctx[key];
        }

        providers[key] = provider;
    }

    // create providers for existing instances that have no factories

    for (let scope in scopes) {
        let instances = scopes[scope];
        for (let key in instances) {
            let value = instances[key];
            if (factories[key] !== undefined) continue;
            if (value === undefined) continue;
            providers[key] = () => value;
        }
    }

    return providers;
}

