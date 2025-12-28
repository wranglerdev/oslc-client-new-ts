# RootServices API Reference

`RootServices` represents a Jazz rootservices document, which is the entry point for OSLC service discovery in Jazz/ELM applications.

**Source:** `src/RootServices.ts:29`

**Extends:** `OSLCResource`

## Overview

Every Jazz application exposes a `/rootservices` endpoint that provides:
- Links to Service Provider Catalogs for each domain (CM, RM, QM)
- OAuth endpoints
- Server version information
- Discovery information

## Constructor

### `new RootServices(uri, store, etag?)`

**Source:** `src/RootServices.ts:30`

**Parameters:**
- `uri` (string) - URI of the rootservices document
- `store` (IndexedFormula) - RDF graph containing the rootservices data
- `etag` (string | undefined) - HTTP ETag (optional)

**Note:** Typically you don't create this directly - `OSLCClient.use()` creates it automatically.

## Methods

### `serviceProviderCatalog(serviceProviders)`

Get the ServiceProviderCatalog URL for a specific domain.

**Source:** `src/RootServices.ts:48`

**Parameters:**
- `serviceProviders` (NamedNode) - Domain-specific property (e.g., `oslc_cm1('cmServiceProviders')`)

**Returns:** `string | undefined` - URL of the ServiceProviderCatalog

**Example:**
```typescript
import { oslc_cm1, oslc_rm, oslc_qm1 } from './oslc/namespaces.js';

// Fetch rootservices (usually done automatically by OSLCClient.use())
const rootservices = await client.getResource(
  'https://server.com/ccm/rootservices'
) as RootServices;

// Get CM catalog URL
const cmCatalog = rootservices.serviceProviderCatalog(
  oslc_cm1('cmServiceProviders')
);
console.log('CM Catalog:', cmCatalog);

// Get RM catalog URL
const rmCatalog = rootservices.serviceProviderCatalog(
  oslc_rm('rmServiceProviders')
);

// Get QM catalog URL
const qmCatalog = rootservices.serviceProviderCatalog(
  oslc_qm1('qmServiceProviders')
);
```

## Common Rootservices URLs

### EWM/RTC (Change Management)
```
https://server.com/ccm/rootservices
```

### DOORS Next (Requirements Management)
```
https://server.com/rm/rootservices
```

### ETM/RQM (Quality Management)
```
https://server.com/qm/rootservices
```

### Global Configuration Management
```
https://server.com/gc/rootservices
```

## Rootservices Document Structure

A typical rootservices document contains:

```xml
<rdf:Description rdf:about="https://server.com/ccm/rootservices">
  <!-- CM Service Provider Catalog -->
  <jd:oslcCatalogs>
    <oslc:ServiceProviderCatalog
      rdf:about="https://server.com/ccm/oslc/workitems/catalog">
      <oslc:domain rdf:resource="http://open-services.net/ns/cm#"/>
    </oslc:ServiceProviderCatalog>
  </jd:oslcCatalogs>

  <!-- OAuth endpoints -->
  <jfs:oauthRequestTokenUrl>...</jfs:oauthRequestTokenUrl>
  <jfs:oauthAccessTokenUrl>...</jfs:oauthAccessTokenUrl>

  <!-- Other service information -->
</rdf:Description>
```

## Usage in Service Discovery

The typical OSLC discovery flow using RootServices:

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm1 } from './oslc/namespaces.js';

async function discoverServices() {
  const client = new OSLCClient('username', 'password');

  // Step 1: Fetch rootservices (done automatically by client.use())
  const rootservices = await client.getResource(
    'https://server.com/ccm/rootservices'
  ) as RootServices;

  // Step 2: Get ServiceProviderCatalog URL
  const catalogURL = rootservices.serviceProviderCatalog(
    oslc_cm1('cmServiceProviders')
  );

  if (!catalogURL) {
    throw new Error('CM catalog not found');
  }

  // Step 3: Fetch catalog
  const catalog = await client.getResource(catalogURL) as ServiceProviderCatalog;

  // Continue with service provider lookup...
}
```

## Automatic Handling

**OSLCClient.use() handles this automatically:**

```typescript
const client = new OSLCClient('username', 'password');

// This automatically:
// 1. Fetches /ccm/rootservices
// 2. Extracts CM catalog URL
// 3. Fetches the catalog
// 4. Looks up the service provider
await client.use('https://server.com/ccm', 'My Project', 'CM');
```

## Related Documentation

- [ServiceProviderCatalog](./ServiceProviderCatalog.md) - Next step in discovery
- [OSLCClient](./OSLCClient.md) - Main client (handles discovery automatically)
- [IBM Jazz & ELM](../02-ibm-jazz-elm.md) - Jazz-specific details
