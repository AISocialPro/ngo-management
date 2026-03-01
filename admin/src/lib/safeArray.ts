export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  return [];
}
