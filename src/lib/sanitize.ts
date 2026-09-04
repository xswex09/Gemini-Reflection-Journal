/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Strips any undefined fields or nested undefined values from objects
 * before passing to Cloud Firestore SDK to prevent write crashes.
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = typeof value === 'object' && value !== null ? stripUndefined(value) : value;
      }
    }
    return cleaned as T;
  }

  return obj;
}
