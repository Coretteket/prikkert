import { customAlphabet } from 'nanoid'

/** Generates an alphanumeric NanoID. */
export const generateNanoid = customAlphabet(
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
)

/** Encodes a string for a given encoding algorithm type (like "SHA-1"). */
export async function encode(type: AlgorithmIdentifier, input: string) {
	const encoder = new TextEncoder()
	const data = encoder.encode(input)
	const hash = await crypto.subtle.digest(type, data)
	return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Encodes a string using SHA-256. */
export function encodeSHA256(input: string) {
	return encode('SHA-256', input)
}

/** Checks if a given password has been compromised by querying the "Have I Been Pwned" API. */
export async function checkPasswordPwned(password: string) {
	const hash = await encode('SHA-1', password)
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
