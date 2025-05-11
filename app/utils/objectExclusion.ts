
// Exclude keys from objects in a list
// TODO replace with Prisma omit https://github.com/prisma/prisma/issues/5042 when it's implemented
// More info on prisma omit currently in preview: https://www.prisma.io/docs/orm/reference/prisma-client-reference#omit-preview
export function excludeFromList<T, K extends keyof T>(objects: T[], keysToDelete: K[]): Omit<T, K>[] {
	return objects.map((obj) => excludeFromObject(obj, keysToDelete)) as Omit<T, K>[]
}

// Exclude keys from an object
export function excludeFromObject<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>
}
