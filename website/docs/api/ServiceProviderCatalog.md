# ServiceProviderCatalog API Reference

`ServiceProviderCatalog` represents an OSLC Service Provider Catalog, which lists available service providers (projects/areas) for a specific domain.

**Source:** `src/ServiceProviderCatalog.ts:31`

**Extends:** `OSLCResource`

## Overview

A Service Provider Catalog is a collection of Service Providers. In Jazz/ELM:
- **Service Provider** = Project Area (e.g., "SAFe Agile Project", "Requirements Project")
- **Catalog** = List of all project areas for a domain (CM, RM, or QM)

## Constructor

### `new ServiceProviderCatalog(uri, store, etag?)`

**Source:** `src/ServiceProviderCatalog.ts:32`

**Parameters:**
- `uri` (string) - URI of the catalog
- `store` (IndexedFormula) - RDF graph containing the catalog data
- `etag` (string | undefined) - HTTP ETag (optional)

**Note:** Typically created automatically by `OSLCClient.use()`.

## Methods

### `serviceProvider(serviceProviderTitle)`

Find a service provider by its title.

**Source:** `src/ServiceProviderCatalog.ts:44`

**Parameters:**
- `serviceProviderTitle` (string) - `dcterms:title` of the service provider (exact match)

**Returns:** `string | undefined` - URL of the matching ServiceProvider

**Example:**
```typescript
import { ServiceProviderCatalog } from './oslc/index.js';

// Fetch catalog (usually done automatically by OSLCClient.use())
const catalog = await client.getResource(
  'https://server.com/ccm/oslc/workitems/catalog'
) as ServiceProviderCatalog;

// Find a service provider by title
const spURL = catalog.serviceProvider('SAFe Agile Project');

if (spURL) {
  console.log('Service Provider URL:', spURL);
  // Fetch the service provider
  const sp = await client.getResource(spURL) as ServiceProvider;
} else {
  console.log('Service Provider not found');
}
```

## Common Catalog URLs

### EWM/RTC (Change Management)
```
https://server.com/ccm/oslc/workitems/catalog
```

### DOORS Next (Requirements Management)
```
https://server.com/rm/oslc_rm/catalog
```

### ETM/RQM (Quality Management)
```
https://server.com/qm/oslc_qm/catalog
```

## Catalog Structure

A typical catalog contains multiple service providers:

```xml
<oslc:ServiceProviderCatalog
  rdf:about="https://server.com/ccm/oslc/workitems/catalog">
  <dcterms:title>Change Management Service Providers</dcterms:title>

  <oslc:serviceProvider>
    <oslc:ServiceProvider rdf:about="https://server.com/ccm/oslc/workitems/projectarea1">
      <dcterms:title>SAFe Agile Project</dcterms:title>
    </oslc:ServiceProvider>
  </oslc:serviceProvider>

  <oslc:serviceProvider>
    <oslc:ServiceProvider rdf:about="https://server.com/ccm/oslc/workitems/projectarea2">
      <dcterms:title>Legacy Waterfall Project</dcterms:title>
    </oslc:ServiceProvider>
  </oslc:serviceProvider>
</oslc:ServiceProviderCatalog>
```

## Listing All Service Providers

```typescript
import { ServiceProviderCatalog } from './oslc/index.js';
import { oslc, dcterms } from './oslc/namespaces.js';

const catalog = await client.getResource(catalogURL) as ServiceProviderCatalog;

// Get all service provider URIs
const spStatements = catalog.store.statementsMatching(
  null,
  dcterms('title'),
  null
);

console.log('Available Service Providers:');
for (const stmt of spStatements) {
  const title = stmt.object.value;
  const uri = stmt.subject.value;
  console.log(`- ${title} (${uri})`);
}
```

## Usage in Service Discovery

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm1 } from './oslc/namespaces.js';

async function discoverServiceProvider() {
  const client = new OSLCClient('username', 'password');

  // Get rootservices
  const rootservices = await client.getResource(
    'https://server.com/ccm/rootservices'
  );

  // Get catalog URL from rootservices
  const catalogURL = rootservices.serviceProviderCatalog(
    oslc_cm1('cmServiceProviders')
  );

  // Fetch catalog
  const catalog = await client.getResource(catalogURL) as ServiceProviderCatalog;

  // Find service provider
  const spURL = catalog.serviceProvider('My Project Area');

  if (!spURL) {
    throw new Error('Project area not found');
  }

  // Fetch service provider
  const sp = await client.getResource(spURL) as ServiceProvider;

  // Now you can query and create resources
}
```

## Automatic Handling

**OSLCClient.use() handles catalog lookup automatically:**

```typescript
const client = new OSLCClient('username', 'password');

// This automatically:
// 1. Fetches rootservices
// 2. Gets catalog URL
// 3. Fetches catalog
// 4. Finds "SAFe Agile Project" service provider
await client.use('https://server.com/ccm', 'SAFe Agile Project', 'CM');

// Now ready to use!
const resources = await client.queryResources(...);
```

## Error Handling

```typescript
const catalog = await client.getResource(catalogURL) as ServiceProviderCatalog;

const spURL = catalog.serviceProvider('My Project');

if (!spURL) {
  // Service provider not found
  // Possible reasons:
  // - Typo in project name (case-sensitive!)
  // - User doesn't have access
  // - Project archived or deleted
  throw new Error('Service Provider "My Project" not found in catalog');
}
```

## Case Sensitivity

**Important:** Service provider titles are **case-sensitive** and must match exactly:

```typescript
// These are all different!
catalog.serviceProvider('SAFe Agile Project');     // ✓ Found
catalog.serviceProvider('safe agile project');     // ✗ Not found
catalog.serviceProvider('SAFe agile Project');     // ✗ Not found
```

## Related Documentation

- [RootServices](./RootServices.md) - Previous step in discovery
- [ServiceProvider](./ServiceProvider.md) - Next step in discovery
- [OSLCClient](./OSLCClient.md) - Main client (handles discovery automatically)
- [IBM Jazz & ELM](../ibm-jazz-elm) - Jazz project areas
