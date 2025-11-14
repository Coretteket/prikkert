import { customAlphabet } from 'nanoid'

/** Generates an alphanumeric NanoID. */
export const generateNanoID = customAlphabet(
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	16,
)

/** Encodes an input for a given encoding algorithm type (like "SHA-256").
 * Returns using the provided buffer encoding (like "base64" or "hex") */
export async function encode(
	algorithm: AlgorithmIdentifier,
	bufferEncoding: BufferEncoding,
	input?: string | null,
) {
	if (!input) return ''
	const bytes = new TextEncoder().encode(input)
	const hash = await crypto.subtle.digest(algorithm, bytes)
	return Buffer.from(hash).toString(bufferEncoding)
}

/** Encodes a string using SHA-256. */
export function encodeSHA256(input?: string | null) {
	return encode('SHA-256', 'base64', input)
}
