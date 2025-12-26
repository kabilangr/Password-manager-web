/**
 * Checks if a password has been exposed in data breaches using Have I Been Pwned API.
 * Uses k-Anonymity model: SHA-1 hash the password, send first 5 chars to API.
 * The full hash is NEVER sent to the server.
 * 
 * @param password The password to check
 * @returns The number of times the password has been seen in breaches (0 if safe)
 */
export async function checkPasswordBreach(password: string): Promise<number> {
    const sha1 = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(sha1));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    try {
        const apiUrl = process.env.NEXT_PUBLIC_HIBP_API_URL || "https://api.pwnedpasswords.com/range/";
        const response = await fetch(`${apiUrl}${prefix}`);
        if (!response.ok) throw new Error("HIBP API Error");

        const text = await response.text();
        const lines = text.split("\n");

        const match = lines.find(line => line.split(":")[0] === suffix);

        if (match) {
            return parseInt(match.split(":")[1], 10);
        }
        return 0;
    } catch (error) {
        console.error("Failed to check breach status", error);
        return 0; // Fail safe (or throw if critical)
    }
}
