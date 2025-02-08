import { customAlphabet } from 'nanoid'

/** Generates an alphanumeric NanoID. */
export const generateNanoid = customAlphabet(
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
)

/** Encodes an input for a given encoding algorithm type (like "SHA-256").
 * Returns using the provided buffer encoding (like "base64" or "hex") */
export async function encode(
	algorithm: AlgorithmIdentifier,
	bufferEncoding: BufferEncoding,
	input: string,
) {
	const bytes = new TextEncoder().encode(input)
	const hash = await crypto.subtle.digest(algorithm, bytes)
	return Buffer.from(hash).toString(bufferEncoding)
}

/** Encodes a string using SHA-256. */
export function encodeSHA256(input: string) {
	return encode('SHA-256', 'base64', input)
}

/** Checks if a given password has been compromised by querying the "Have I Been Pwned" API. */
export async function checkPasswordPwned(password: string) {
	const hash = await encode('SHA-1', 'hex', password)
	const hashPrefix = hash.slice(0, 5)
	const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`)
	if (!response.ok) return true
	const data = await response.text()
	const items = data.split('\n')
	return items.some((item) => {
		const hashSuffix = item.slice(0, 35).toLowerCase()
		return hash === hashPrefix + hashSuffix
	})
}
