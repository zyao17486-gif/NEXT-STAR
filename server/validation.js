export function validateRequiredText(value, maxLength) {
  if (typeof value !== "string" || value.trim().length === 0) return "required";
  if (value.trim().length > maxLength) return "too_long";
  return null;
}

export function validateDnaVector(value, dimensions = 13) {
  return value === undefined || (
    Array.isArray(value) &&
    value.length === dimensions &&
    value.every(item => Number.isFinite(item) && item >= 0 && item <= 100)
  );
}
