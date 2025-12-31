import { argon2id } from "hash-wasm";
import type { SimpleKeyFormat } from "../interface/SimpleKeyFormat";
import { CRYPTO_VALUES } from "@/values/constants";

/**
 * Generates a random salt.
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(CRYPTO_VALUES.SALT_LENGTH));
}

/**
 * Derives a key from a password and salt using Argon2id (WebAssembly).
 * Fallback to PBKDF2 if WASM fails (or for legacy).
 * @param password The user's master password.
 * @param salt The salt.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    try {
        // Argon2id parameters recommended for password hashing
        await argon2id({
            password,
            salt,
            parallelism: Number(process.env.NEXT_PUBLIC_ARGON2_PARALLELISM) || CRYPTO_VALUES.ARGON2.PARALLELISM,
            iterations: Number(process.env.NEXT_PUBLIC_ARGON2_ITERATIONS) || CRYPTO_VALUES.ARGON2.ITERATIONS,
            memorySize: Number(process.env.NEXT_PUBLIC_ARGON2_MEMORY) || CRYPTO_VALUES.ARGON2.MEMORY_KB,
            hashLength: 32, // 256 bits
            outputType: "encoded" // we need raw bytes actually, let's fix
        });

        // hash-wasm returns hex string or encoded string. Let's get raw bytes manually or convert.
        // Actually, let's retry with outputType: "binary" if supported, or just convert hex.

        const keyHex = await argon2id({
            password,
            salt,
            parallelism: Number(process.env.NEXT_PUBLIC_ARGON2_PARALLELISM) || CRYPTO_VALUES.ARGON2.PARALLELISM,
            iterations: Number(process.env.NEXT_PUBLIC_ARGON2_ITERATIONS) || CRYPTO_VALUES.ARGON2.ITERATIONS,
            memorySize: Number(process.env.NEXT_PUBLIC_ARGON2_MEMORY) || CRYPTO_VALUES.ARGON2.MEMORY_KB,
            hashLength: 32,
            outputType: "hex"
        });

        // Import the raw Argon2id output as an AES-GCM key
        const rawKey = hexToBytes(keyHex);

        return crypto.subtle.importKey(
            "raw",
            rawKey as unknown as ArrayBuffer,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
        );

    } catch (e) {
        console.warn("Argon2id failed, falling back to PBKDF2", e);
        return deriveKeyPBKDF2(password, salt);
    }
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}


/**
 * Legacy PBKDF2 implementation
 */
export async function deriveKeyPBKDF2(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password) as unknown as ArrayBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as unknown as ArrayBuffer,
            iterations: Number(process.env.NEXT_PUBLIC_PBKDF2_ITERATIONS) || CRYPTO_VALUES.PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: CRYPTO_VALUES.KEY_SIZE_BITS },
        false, // Extractable? Maybe false for master key in memory? But we might need to verify it.
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
}

/**
 * Encrypts data using AES-GCM.
 */
export async function encryptData(key: CryptoKey, data: string): Promise<{ encrypted: Uint8Array; iv: Uint8Array }> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_VALUES.IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv as unknown as ArrayBuffer,
        },
        key,
        enc.encode(data)
    );
    return { encrypted: new Uint8Array(encrypted), iv };
}

/**
 * Decrypts data using AES-GCM.
 */
export async function decryptData(key: CryptoKey, encrypted: Uint8Array, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv as unknown as ArrayBuffer,
        },
        key,
        encrypted as unknown as ArrayBuffer
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
}

/**
 * Generates an RSA-OAEP key pair for sharing.
 */
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: CRYPTO_VALUES.RSA_MODULUS_BITS,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
}

/**
 * Exports a key to base64 format (for storage).
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    let fmt: SimpleKeyFormat = "spki";
    if (key.type === "private") fmt = "pkcs8";

    const exported = await crypto.subtle.exportKey(fmt, key);
    return arrayBufferToBase64(exported);
}

// Helpers
export function arrayBufferToBase64(buffer: BufferSource): string {
    let binary = '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): Uint8Array {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}


