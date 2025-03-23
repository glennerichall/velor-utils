let symbolIterator = 1;

export function createSymbol(key) {
    if (process.env.NODE_ENV === 'production') {
        return symbolIterator++;
    } else {
        return key;
    }
}