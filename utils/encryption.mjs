import crypto from "crypto";

let enc_key;
let enc_iv;

export function initializeEncryptionCipher(key, iv) {
    enc_key = Buffer.from(key, 'hex');
    enc_iv = Buffer.from(iv, 'hex');
}

//Encrypting text
export function encryptText(text, {key = enc_key, iv = enc_iv} = {}) {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

export function encryptObject(obj, enc) {
    return encryptText(JSON.stringify(obj), enc);
}

export function decryptObject(obj, enc) {
    return JSON.parse(decryptText(obj, enc));
}

// Decrypting text
export function decryptText(text, {key = enc_key, iv = enc_iv} = {}) {
    try {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return null;
    }
}