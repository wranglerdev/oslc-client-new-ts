# ServiceProvider API Reference

`ServiceProvider` represents an OSLC Service Provider, which describes the capabilities available for a project/area (query, creation, selection dialogs, etc.).

**Source:** `src/ServiceProvider.ts:32`

**Extends:** `OSLCResource`

## Overview

A Service Provider (Project Area in Jazz) defines:
- **Query Capabilities** - Endpoints for querying resources
- **Creation Factories** - Endpoints for creating resources
- **Selection Dialogs** - UI dialogs for resource selection
- **Resource Types** - Supported OSLC resource types

## Constructor

### `new ServiceProvider(uri, store, etag?)`

**Source:** `src/ServiceProvider.ts:33`

**Parameters:**
- `uri` (string) - URI of the service provider
- `store` (IndexedFormula) - RDF graph containing the provider data
- `etag` (string | undefined) - HTTP ETag (optional)

**Note:** Typically created automatically by `OSLCClient.use()`.

## Methods

### `getQueryBase(resourceType)`

Get the query base URL for a specific resource type.

**Source:** `src/ServiceProvider.ts:44`

**Parameters:**
- `resourceType` (string | NamedNode) - Resource type to query (e.g., `oslc_cm('ChangeRequest')`)

**Returns:** `string | null` - Query base URL, or `null` if not found

**Example:**
```typescript
import { oslc_cm, oslc_rm, oslc_qm } from './oslc/namespaces.js';

const sp = await client.getResource(spURL) as ServiceProvider;

// Get query base for Change Requests
const queryBase = sp.getQueryBase(oslc_cm('ChangeRequest'));
console.log('Query base:', queryBase);
// "https://server.com/ccm/oslc/workitems/queryBase"

// Get query base for Requirements
const rmQueryBase = sp.getQueryBase(oslc_rm('Requirement'));

// Get query base for Test Cases
const qmQueryBase = sp.getQueryBase(oslc_qm('TestCase'));
```

### `getCreationFactory(resourceType)`

Get the creation factory URL for a specific resource type.

**Source:** `src/ServiceProvider.ts:69`

**Parameters:**
- `resourceType` (string | NamedNode) - Resource type to create
  - Can be a full NamedNode: `oslc_cm('ChangeRequest')`
  - Can be a string suffix: `'ChangeRequest'`

**Returns:** `string | null` - Creation factory URL, or `null` if not found

**Example:**
```typescript
import { oslc_cm } from './oslc/namespaces.js';

const sp = await client.getResource(spURL) as ServiceProvider;

// Using NamedNode
const factory = sp.getCreationFactory(oslc_cm('ChangeRequest'));
console.log('Creation factory:', factory);
// "https://server.com/ccm/oslc/workitems/create"

// Using string suffix (searches for URIs ending with 'Defect')
const defectFactory = sp.getCreationFactory('Defect');
```

## Service Provider Structure

A typical service provider contains multiple services with capabilities:

```xml
<oslc:ServiceProvider rdf:about="https://server.com/ccm/oslc/workitems/projectarea1">
  <dcterms:title>SAFe Agile Project</dcterms:title>

  <oslc:service>
    <oslc:Service>
      <!-- Query Capability for Change Requests -->
      <oslc:queryCapability>
        <oslc:QueryCapability>
          <oslc:resourceType rdf:resource="http://open-services.net/ns/cm#ChangeRequest"/>
          <oslc:queryBase rdf:resource="https://server.com/ccm/oslc/workitems/queryBase"/>
        </oslc:QueryCapability>
      </oslc:queryCapability>

      <!-- Creation Factory for Change Requests -->
      <oslc:creationFactory>
        <oslc:CreationFactory>
          <oslc:resourceType rdf:resource="http://open-services.net/ns/cm#ChangeRequest"/>
          <oslc:creation rdf:resource="https://server.com/ccm/oslc/workitems/create"/>
        </oslc:CreationFactory>
      </oslc:creationFactory>
    </oslc:Service>
  </oslc:service>
</oslc:ServiceProvider>
```

## Usage with OSLCClient

The client uses ServiceProvider capabilities automatically:

```typescript
const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'My Project', 'CM');

// Behind the scenes, when you query:
const resources = await client.queryResources(oslc_cm('ChangeRequest'), {...});
// 1. Gets query base from service provider
// 2. Builds query URL with parameters
// 3. Fetches and parses results

// When you create:
const created = await client.createResource(oslc_cm('ChangeRequest'), resource);
// 1. Gets creation factory from service provider
// 2. POSTs to factory URL
// 3. Returns created resource
```

## Manual Discovery

You can manually discover and use capabilities:

```typescript
import { ServiceProvider } from './oslc/index.js';
import { oslc_cm } from './oslc/namespaces.js';

const sp = await client.getResource(
  'https://server.com/ccm/oslc/workitems/projectarea1'
) as ServiceProvider;

// Find query capability
const queryBase = sp.getQueryBase(oslc_cm('ChangeRequest'));

if (queryBase) {
  // Use queryWithBase instead of queryResources
  const results = await client.queryWithBase(queryBase, {
    where: 'oslc_cm:status="Open"'
  });
}

// Find creation factory
const factory = sp.getCreationFactory(oslc_cm('ChangeRequest'));

if (factory) {
  console.log('POST new resources to:', factory);
}
```

## Discovering All Capabilities

```typescript
import { oslc } from './oslc/namespaces.js';

const sp = await client.getResource(spURL) as ServiceProvider;

// Get all services
const services = sp.store.each(sp.uri, oslc('service'));

for (const service of services) {
  console.log('Service:', service.value);

  // Get query capabilities
  const queryCapabilities = sp.store.each(service, oslc('queryCapability'));
  for (const qc of queryCapabilities) {
    const resourceType = sp.store.the(qc, oslc('resourceType'));
    const queryBase = sp.store.the(qc, oslc('queryBase'));
    console.log('  Query:', resourceType?.value, '->', queryBase?.value);
  }

  // Get creation factories
  const factories = sp.store.each(service, oslc('creationFactory'));
  for (const cf of factories) {
    const resourceType = sp.store.the(cf, oslc('resourceType'));
    const creation = sp.store.the(cf, oslc('creation'));
    console.log('  Create:', resourceType?.value, '->', creation?.value);
  }
}
```

## Common Resource Types

### Change Management (CM)
- `oslc_cm('ChangeRequest')` - Generic change request
- Custom types like `Defect`, `Task`, `Story` (server-specific)

### Requirements Management (RM)
- `oslc_rm('Requirement')` - Requirement
- `oslc_rm('RequirementCollection')` - Collection/folder

### Quality Management (QM)
- `oslc_qm('TestPlan')` - Test plan
- `oslc_qm('TestCase')` - Test case
- `oslc_qm('TestResult')` - Test result
- `oslc_qm('TestScript')` - Test script

## Example: Complete Discovery Flow

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm1, oslc_cm } from './oslc/namespaces.js';
import { RootServices, ServiceProviderCatalog, ServiceProvider } from './oslc/index.js';

async function manualDiscovery() {
  const client = new OSLCClient('username', 'password');

  // 1. Fetch rootservices
  const rootservices = await client.getResource(
    'https://server.com/ccm/rootservices'
  ) as RootServices;

  // 2. Get catalog URL
  const catalogURL = rootservices.serviceProviderCatalog(
    oslc_cm1('cmServiceProviders')
  );

  if (!catalogURL) throw new Error('Catalog not found');

  // 3. Fetch catalog
  const catalog = await client.getResource(catalogURL) as ServiceProviderCatalog;

  // 4. Find service provider
  const spURL = catalog.serviceProvider('My Project');

  if (!spURL) throw new Error('Service provider not found');

  // 5. Fetch service provider
  const sp = await client.getResource(spURL) as ServiceProvider;

  // 6. Get capabilities
  const queryBase = sp.getQueryBase(oslc_cm('ChangeRequest'));
  const factory = sp.getCreationFactory(oslc_cm('ChangeRequest'));

  console.log('Query Base:', queryBase);
  console.log('Creation Factory:', factory);

  // Now use them for operations
  if (queryBase) {
    const results = await client.queryWithBase(queryBase, {
      where: 'oslc_cm:status="Open"'
    });
  }
}
```

## Automatic Handling

**OSLCClient.use() does all of this automatically:**

```typescript
const client = new OSLCClient('username', 'password');

// This one line does the entire discovery flow above!
await client.use('https://server.com/ccm', 'My Project', 'CM');

// Capabilities are cached internally, ready to use
const resources = await client.queryResources(oslc_cm('ChangeRequest'), {...});
const created = await client.createResource(oslc_cm('ChangeRequest'), resource);
```

## Related Documentation

- [ServiceProviderCatalog](./ServiceProviderCatalog.md) - Finding service providers
- [OSLCClient](./OSLCClient.md) - Main client (uses capabilities automatically)
- [OSLC Introduction](../01-what-is-oslc.md) - Understanding service discovery
