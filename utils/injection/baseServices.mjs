import {getServices} from "./ServicesContext.mjs";


export function getEnvironment(serviceAware) {
    return getServices(serviceAware).env;
}

export function getEnv(serviceAware) {
    return getEnvironment(serviceAware);
}

export function getConstants(serviceAware) {
    return getServices(serviceAware).constants;
}

export function getFactories(serviceAware) {
    let services = getServices(serviceAware);
    let factories = services.factories;
    return Object.keys(factories)
        .reduce((acc, key) => {
            acc[key] = (...args) => factories[key](services, ...args);
            return acc;
        }, {})
}

export function getProvider(serviceAware) {
    return getServices(serviceAware).provider;
}