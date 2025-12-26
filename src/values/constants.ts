export const CRYPTO_VALUES = {
    PBKDF2_ITERATIONS: 310000,
    SALT_LENGTH: 16,
    IV_LENGTH: 12,
    KEY_SIZE_BITS: 256,
    ARGON2: {
        ITERATIONS: 2,
        MEMORY_KB: 19456,
        PARALLELISM: 1,
    },
    RSA_MODULUS_BITS: 2048,
};

export const AUTH_VALUES = {
    MAX_SESSION_AGE_DAYS: 30,
};

export const UI_VALUES = {
    TOAST_DURATION_MS: 3000,
    PASSWORD_STRENGTH_MIN: 4,
    MIN_PASSWORD_LENGTH: 8,
};

export const GENERATOR_VALUES = {
    CHAR_SETS: {
        UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
        NUMBERS: "0123456789",
        SYMBOLS: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    },
    LIMITS: {
        DEFAULT_LENGTH: 16,
        MIN_LENGTH: 8,
        MAX_LENGTH: 64,
    },
    COPIED_TIMEOUT_MS: 2000,
};
