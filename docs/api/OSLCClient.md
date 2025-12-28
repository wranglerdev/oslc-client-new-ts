# OSLCClient API Reference

The `OSLCClient` class is the main entry point for interacting with OSLC servers. It handles authentication, service discovery, and all CRUD operations.

**Source:** `src/OSLCClient.ts:64`

## Constructor

### `new OSLCClient(userid, password, configuration_context?)`

Creates a new OSLC client instance.

**Parameters:**
- `userid` (string) - Username for authentication
- `password` (string) - Password for authentication
- `configuration_context` (string | null, optional) - Configuration context URI for GCM

**Returns:** `OSLCClient` instance

**Example:**
```typescript
import OSLCClient from './oslc/index.js';

// Basic client
const client = new OSLCClient('myusername', 'mypassword');

// With configuration context (for GCM)
const configClient = new OSLCClient(
  'myusername',
  'mypassword',
  'https://server.com/gc/configuration/1234'
);
```

## Core Methods

### `use(server_url, serviceProviderName, domain?)`

Connect to a specific service provider. This performs OSLC service discovery.

**Source:** `src/OSLCClient.ts:228`

**Parameters:**
- `server_url` (string) - Base server URL (e.g., `https://server.com/ccm`)
- `serviceProviderName` (string) - Name of the service provider/project area
- `domain` (string, optional) - OSLC domain: `'CM'`, `'RM'`, or `'QM'` (default: `'CM'`)

**Returns:** `Promise<void>`

**Throws:** Error if service provider not found or rootservices fetch fails

**What It Does:**
1. Fetches `/rootservices` document
2. Extracts ServiceProviderCatalog URL for the domain
3. Looks up the service provider by name
4. Loads service provider capabilities (query, creation, etc.)

**Example:**
```typescript
const client = new OSLCClient('username', 'password');

// Connect to EWM Change Management
await client.use(
  'https://server.com/ccm',
  'My Project Area',
  'CM'
);

// Connect to DOORS Next Requirements Management
await client.use(
  'https://server.com/rm',
  'Requirements Project',
  'RM'
);

// Connect to ETM Quality Management
await client.use(
  'https://server.com/qm',
  'Test Project',
  'QM'
);
```

**Error Handling:**
```typescript
try {
  await client.use('https://server.com/ccm', 'My Project', 'CM');
} catch (error) {
  console.error('Failed to connect:', error);
  // Possible errors:
  // - Network errors
  // - Authentication failures
  // - Service provider not found
  // - Domain not available
}
```

## Read Operations

### `getResource(url, oslc_version?, accept?)`

Fetch an OSLC resource by URL.

**Source:** `src/OSLCClient.ts:292`

**Parameters:**
- `url` (string) - Resource URL
- `oslc_version` (string, optional) - OSLC version (default: `'2.0'`)
- `accept` (string, optional) - Accept header (default: `'application/rdf+xml'`)

**Returns:** `Promise<OSLCResource | { etag?: string; xml: Document } | { etag?: string; feed: AtomFeed }>`

**Example:**
```typescript
// Get a work item
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const resource = await client.getResource(url) as OSLCResource;

console.log('Title:', resource.getTitle());
console.log('Description:', resource.getDescription());
console.log('ETag:', resource.etag);

// Get all properties
const props = resource.getProperties();
console.log(JSON.stringify(props, null, 2));
```

### `getCompactResource(url, oslc_version?, accept?)`

Fetch an OSLC Compact resource for UI previews.

**Source:** `src/OSLCClient.ts:345`

**Parameters:**
- `url` (string) - Compact resource URL
- `oslc_version` (string, optional) - OSLC version (default: `'2.0'`)
- `accept` (string, optional) - Accept header (default: `'application/x-oslc-compact+xml'`)

**Returns:** `Promise<Compact>`

**Example:**
```typescript
import type { Compact } from './oslc/index.js';

const compactURL = 'https://server.com/ccm/oslc/workitems/_12345/compact';
const compact = await client.getCompactResource(compactURL);

console.log('Title:', compact.getTitle());
console.log('Short Title:', compact.getShortTitle());
console.log('Icon:', compact.getIcon());

// Get preview information
const smallPreview = compact.getSmallPreview();
if (smallPreview) {
  console.log('Preview URL:', smallPreview.document);
  console.log('Hint Size:', smallPreview.hintWidth, 'x', smallPreview.hintHeight);
}
```

## Query Operations

### `queryResources(resourceType, query)`

Query for OSLC resources and return them as `OSLCResource` objects.

**Source:** `src/OSLCClient.ts:517`

**Parameters:**
- `resourceType` (string | NamedNode) - Resource type to query (e.g., `oslc_cm('ChangeRequest')`)
- `query` (QueryParams) - Query parameters

**Returns:** `Promise<OSLCResource[]>`

**QueryParams Interface:**
```typescript
interface QueryParams {
  prefix?: string;   // Namespace prefixes
  select?: string;   // Properties to return (comma-separated)
  where?: string;    // Filter expression
  orderBy?: string;  // Sort order (+asc, -desc)
}
```

**Example:**
```typescript
import { oslc_cm } from './oslc/namespaces.js';
import type { QueryParams } from './oslc/types.js';

// Query open defects
const query: QueryParams = {
  where: 'dcterms:type="Defect" and oslc_cm:status="Open"',
  select: 'dcterms:title,dcterms:identifier,oslc_cm:priority',
  orderBy: '-dcterms:modified'  // Most recently modified first
};

const defects = await client.queryResources(oslc_cm('ChangeRequest'), query);

console.log(`Found ${defects.length} open defects`);

for (const defect of defects) {
  console.log(`${defect.getIdentifier()}: ${defect.getTitle()}`);
}
```

**Advanced Examples:**

```typescript
// Text search
const searchQuery: QueryParams = {
  where: 'dcterms:title contains "login"',
  select: 'dcterms:title,dcterms:identifier'
};
const results = await client.queryResources(oslc_cm('ChangeRequest'), searchQuery);

// Date-based query
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const recentQuery: QueryParams = {
  where: `dcterms:modified>="${lastWeek}"`,
  orderBy: '-dcterms:modified'
};
const recent = await client.queryResources(oslc_cm('ChangeRequest'), recentQuery);

// Multiple conditions
const complexQuery: QueryParams = {
  where: 'dcterms:type="Defect" and oslc_cm:priority="High" and oslc_cm:status="Open"',
  select: 'dcterms:title,dcterms:identifier,dcterms:creator',
  orderBy: '+dcterms:created'  // Oldest first
};
const highPriority = await client.queryResources(oslc_cm('ChangeRequest'), complexQuery);
```

### `query(resourceType, query)`

Query for OSLC resources and return the raw RDF graph.

**Source:** `src/OSLCClient.ts:546`

**Parameters:**
- `resourceType` (string | NamedNode) - Resource type to query
- `query` (QueryParams) - Query parameters

**Returns:** `Promise<IndexedFormula>` - RDF graph containing all results

**Example:**
```typescript
import * as $rdf from 'rdflib';
import { oslc_cm, dcterms } from './oslc/namespaces.js';

const kb = await client.query(oslc_cm('ChangeRequest'), {
  where: 'oslc_cm:status="Open"'
});

// Work with raw RDF graph
const statements = kb.statementsMatching(null, dcterms('title'), null);
for (const stmt of statements) {
  console.log('Subject:', stmt.subject.value);
  console.log('Title:', stmt.object.value);
}
```

### `queryWithBase(queryBase, query)`

Query using a specific query base URL (bypasses service discovery).

**Source:** `src/OSLCClient.ts:567`

**Parameters:**
- `queryBase` (string) - Direct query capability URL
- `query` (QueryParams) - Query parameters

**Returns:** `Promise<IndexedFormula>` - RDF graph with results

**Example:**
```typescript
// If you already know the query base URL
const queryBase = 'https://server.com/ccm/oslc/workitems/queryBase';
const kb = await client.queryWithBase(queryBase, {
  where: 'oslc_cm:status="Open"'
});
```

## Create Operations

### `createResource(resourceType, resource, oslc_version?)`

Create a new OSLC resource.

**Source:** `src/OSLCClient.ts:416`

**Parameters:**
- `resourceType` (string | NamedNode) - Resource type (e.g., `oslc_cm('ChangeRequest')`)
- `resource` (OSLCResource) - Resource to create
- `oslc_version` (string, optional) - OSLC version (default: `'2.0'`)

**Returns:** `Promise<OSLCResource>` - Created resource with server-assigned URI

**Example:**
```typescript
import { OSLCResource } from './oslc/index.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'My Project', 'CM');

// Create a new defect
const defect = new OSLCResource();
defect.setTitle('Login page crashes on Safari');
defect.setDescription('Steps to reproduce: 1. Open Safari...');

// Set additional properties
defect.set(oslc_cm('status'), $rdf.literal('New'));
defect.set(oslc_cm('priority'), $rdf.literal('High'));
defect.set(dcterms('type'), $rdf.literal('Defect'));

// Create on server
const created = await client.createResource(oslc_cm('ChangeRequest'), defect);

console.log('Created!');
console.log('URI:', created.getURI());
console.log('Identifier:', created.getIdentifier());
console.log('ETag:', created.etag);
```

**Creating Requirements:**
```typescript
import { oslc_rm } from './oslc/namespaces.js';

const rmClient = new OSLCClient('username', 'password');
await rmClient.use('https://server.com/rm', 'My RM Project', 'RM');

const requirement = new OSLCResource();
requirement.setTitle('System shall encrypt passwords');
requirement.setDescription('All user passwords must be encrypted using bcrypt with salt.');

const created = await rmClient.createResource(oslc_rm('Requirement'), requirement);
console.log('Requirement created:', created.getURI());
```

**Creating Test Cases:**
```typescript
import { oslc_qm } from './oslc/namespaces.js';

const qmClient = new OSLCClient('username', 'password');
await qmClient.use('https://server.com/qm', 'My QM Project', 'QM');

const testCase = new OSLCResource();
testCase.setTitle('Verify login with valid credentials');
testCase.setDescription('Steps:\n1. Navigate to login page\n2. Enter valid credentials\n3. Click login\n\nExpected: User is logged in');

const created = await qmClient.createResource(oslc_qm('TestCase'), testCase);
console.log('Test case created:', created.getURI());
```

## Update Operations

### `putResource(resource, eTag?, oslc_version?)`

Update an existing OSLC resource.

**Source:** `src/OSLCClient.ts:379`

**Parameters:**
- `resource` (OSLCResource) - Resource to update
- `eTag` (string | null, optional) - ETag for optimistic concurrency control
- `oslc_version` (string, optional) - OSLC version (default: `'2.0'`)

**Returns:** `Promise<OSLCResource>` - Updated resource

**Example:**
```typescript
// Get the resource
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const workItem = await client.getResource(url) as OSLCResource;

// Modify it
workItem.setTitle('UPDATED: ' + workItem.getTitle());
workItem.set(oslc_cm('status'), $rdf.literal('In Progress'));

// Update on server (with ETag for conflict detection)
await client.putResource(workItem, workItem.etag);

console.log('Updated successfully!');
```

**Without ETag (not recommended):**
```typescript
await client.putResource(workItem);  // No concurrency protection
```

**Handling Update Conflicts:**
```typescript
try {
  await client.putResource(workItem, workItem.etag);
} catch (error) {
  console.error('Update failed - resource may have been modified by another user');
  // Re-fetch and retry
  const fresh = await client.getResource(url) as OSLCResource;
  // Apply changes again and retry
}
```

## Delete Operations

### `deleteResource(resource, oslc_version?)`

Delete an OSLC resource.

**Source:** `src/OSLCClient.ts:462`

**Parameters:**
- `resource` (OSLCResource) - Resource to delete
- `oslc_version` (string, optional) - OSLC version (default: `'2.0'`)

**Returns:** `Promise<void>`

**Example:**
```typescript
// Get the resource
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const workItem = await client.getResource(url) as OSLCResource;

// Delete it (automatically includes CSRF protection)
await client.deleteResource(workItem);

console.log('Deleted successfully!');
```

**Safe Deletion:**
```typescript
try {
  await client.deleteResource(resource);
  console.log('Resource deleted');
} catch (error) {
  console.error('Delete failed:', error);
}
```

## Utility Methods

### `getOwner(url)`

Get the owner name for a resource URL (with caching).

**Source:** `src/OSLCClient.ts:618`

**Parameters:**
- `url` (string) - URL of the owner resource (typically a foaf:Person)

**Returns:** `Promise<string>` - Owner's name, or `"Unknown"` if not found

**Example:**
```typescript
const workItem = await client.getResource(workItemURL) as OSLCResource;
const creatorURL = workItem.get(dcterms('creator'));

if (typeof creatorURL === 'string') {
  const creatorName = await client.getOwner(creatorURL);
  console.log('Created by:', creatorName);
}
```

### `getQueryBase(resourceType)`

Get the query base URL for a resource type.

**Source:** `src/OSLCClient.ts:656`

**Parameters:**
- `resourceType` (string) - Full resource type URI

**Returns:** `Promise<string>` - Query base URL

**Example:**
```typescript
const queryBase = await client.getQueryBase('http://open-services.net/ns/cm#ChangeRequest');
console.log('Query base:', queryBase);
// Use with queryWithBase()
```

### `getCreationFactory(resourceType)`

Get the creation factory URL for a resource type.

**Source:** `src/OSLCClient.ts:682`

**Parameters:**
- `resourceType` (string) - Full resource type URI

**Returns:** `Promise<string>` - Creation factory URL

**Example:**
```typescript
const factory = await client.getCreationFactory('http://open-services.net/ns/cm#ChangeRequest');
console.log('Creation factory:', factory);
```

## Authentication

The client **automatically handles** all three Jazz authentication methods:

### 1. JEE Form-Based Authentication
- Detects `x-com-ibm-team-repository-web-auth-msg: authrequired`
- POSTs to `/j_security_check`
- Manages JSESSIONID cookies

### 2. jauth Realm (Bearer Token)
- Detects `www-authenticate: jauth realm="..."`
- Obtains bearer token from `token_uri`
- Includes `Authorization: Bearer <token>` header

### 3. Basic Authentication
- Falls back to HTTP Basic Auth
- Used for Jazz Authorization Server

**No manual configuration needed!** Just provide username and password:

```typescript
const client = new OSLCClient('username', 'password');
// Auth is handled automatically on first request
```

## Headers and Configuration

The client automatically sets:

- `Accept: application/rdf+xml, text/turtle, ...` (flexible RDF formats)
- `OSLC-Core-Version: 2.0`
- `Configuration-Context: <uri>` (if provided in constructor)
- `X-Jazz-CSRF-Prevent: <token>` (for write operations)
- Cookie management (automatic in Node.js and browser)

## Error Handling

Common errors and how to handle them:

```typescript
import OSLCClient from './oslc/index.js';

const client = new OSLCClient('username', 'password');

try {
  // Service discovery
  await client.use('https://server.com/ccm', 'My Project', 'CM');
} catch (error) {
  // Possible errors:
  // - Network unreachable
  // - Invalid credentials
  // - Server not found
  // - Project area doesn't exist
  // - Domain not supported
  console.error('Connection failed:', error);
}

try {
  // Query operation
  const resources = await client.queryResources(oslc_cm('ChangeRequest'), {...});
} catch (error) {
  // Possible errors:
  // - Invalid query syntax
  // - Resource type not supported
  // - Network timeout
  console.error('Query failed:', error);
}

try {
  // Update operation
  await client.putResource(resource, resource.etag);
} catch (error) {
  // Possible errors:
  // - ETag mismatch (concurrent modification)
  // - Validation errors
  // - Permission denied
  console.error('Update failed:', error);
}
```

## Complete Example

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

async function manageWorkItems() {
  // Create client
  const client = new OSLCClient('username', 'password');

  // Connect to service provider
  await client.use('https://server.com/ccm', 'My Project Area', 'CM');

  // Query for open defects
  const defects = await client.queryResources(
    oslc_cm('ChangeRequest'),
    {
      where: 'dcterms:type="Defect" and oslc_cm:status="Open"',
      select: 'dcterms:title,dcterms:identifier,oslc_cm:priority'
    }
  );

  console.log(`Found ${defects.length} open defects`);

  // Create a new defect
  const newDefect = new OSLCResource();
  newDefect.setTitle('Critical bug in authentication');
  newDefect.setDescription('Users cannot log in with SSO');
  newDefect.set(oslc_cm('priority'), $rdf.literal('High'));
  newDefect.set(dcterms('type'), $rdf.literal('Defect'));

  const created = await client.createResource(oslc_cm('ChangeRequest'), newDefect);
  console.log('Created defect:', created.getIdentifier());

  // Update a defect
  if (defects.length > 0) {
    const firstDefect = defects[0];
    firstDefect.set(oslc_cm('status'), $rdf.literal('In Progress'));
    await client.putResource(firstDefect, firstDefect.etag);
    console.log('Updated defect:', firstDefect.getIdentifier());
  }
}

manageWorkItems().catch(console.error);
```

## Related Documentation

- [OSLCResource](./OSLCResource.md) - Working with resources
- [Namespaces](./namespaces.md) - RDF namespace definitions
- [Types](./types.md) - TypeScript type definitions
- [Getting Started](../04-getting-started.md) - Quick start guide
