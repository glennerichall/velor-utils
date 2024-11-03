export function createInstance(Clazz, ...args) {
    return (services) => {
        return new Clazz(...args);
    }
}