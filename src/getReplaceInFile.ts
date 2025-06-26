/**
 * Dynamically imports and returns the default export from the 'replace-in-file' module.
 *
 * This function uses dynamic import to load the 'replace-in-file' package at runtime,
 * which can help reduce initial load time and dependencies if the functionality is only
 * needed conditionally.
 *
 * @returns A promise that resolves to the default export of the 'replace-in-file' module.
 */
export default async function (): Promise<typeof import('replace-in-file').default> {
  return (await import('replace-in-file')).default
}
