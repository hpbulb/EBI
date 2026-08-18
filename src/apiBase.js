const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

/** Builds a backend URL while preserving local same-origin development. */
export function apiUrl(path) {
  const normalizedPath = path.replace(/^\//, "");
  return configuredApiBase
    ? `${configuredApiBase}/${normalizedPath}`
    : `${import.meta.env.BASE_URL}${normalizedPath}`;
}
