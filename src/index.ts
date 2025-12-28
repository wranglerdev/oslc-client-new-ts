/*
 * @oslc-client - TypeScript OSLC Client
 *
 * Entry point for the OSLC Client library
 */

import OSLCClient from './OSLCClient.js';

// Default export for easy import
export default OSLCClient;

// Also export types for convenience
export type * from './types.js';

// Optional: export other classes if needed
export { default as OSLCResource } from './OSLCResource.js';
export { default as RootServices } from './RootServices.js';
export { default as ServiceProviderCatalog } from './ServiceProviderCatalog.js';
export { default as ServiceProvider } from './ServiceProvider.js';
export { default as Compact } from './Compact.js';

// Export namespaces
export * from './namespaces.js';
