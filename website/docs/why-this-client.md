# Why This OSLC Client Exists

## The Problem

Working with OSLC and Jazz/ELM servers requires:

1. **Understanding RDF** - Resources are represented in RDF/XML, Turtle, or JSON-LD
2. **Complex Discovery** - Multi-step process to find the right endpoints
3. **Authentication Handling** - Jazz uses multiple auth methods (JEE Form, jauth, Basic)
4. **CSRF Protection** - Special headers required for write operations
5. **ETag Management** - Optimistic concurrency control for updates
6. **Query Syntax** - OSLC query language with prefixes and filters
7. **Pagination** - Following `oslc:nextPage` links for large result sets

**Without a client library, you'd need to:**

```typescript
// Manual OSLC request - painful!
const response1 = await axios.get('https://server.com/ccm/rootservices');
// Parse XML, find CM catalog URL...
const catalogURL = parseXmlAndExtractCatalogURL(response1.data);

const response2 = await axios.get(catalogURL);
// Parse RDF, find service provider...
const spURL = parseRDFAndFindServiceProvider(response2.data, 'My Project');

const response3 = await axios.get(spURL);
// Parse RDF, find query capability...
const queryURL = parseRDFAndFindQueryCapability(response3.data, 'ChangeRequest');

// Build query with all parameters
const queryWithParams = `${queryURL}?oslc.where=...&oslc.select=...&oslc.prefix=...`;

// Handle authentication challenges, CSRF tokens, cookies...
const response4 = await axios.get(queryWithParams, {
  // Complex auth interceptor logic needed here
});

// Parse RDF results, extract resources, handle pagination...
const resources = parseRDFAndExtractResources(response4.data);
```

## The Solution

This client abstracts all that complexity:

```typescript
// With this client - simple and clean!
const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'My Project', 'CM');

const resources = await client.queryResources(
  oslc_cm('ChangeRequest'),
  { where: 'oslc_cm:status="Open"' }
);
```

## Key Benefits

### 1. Direct Integration - No npm Install Required

**Unlike typical npm packages, this client is designed to be copied directly into your project:**

```bash
# Copy the source directly
cp -r oslc-client-new-ts/src/ my-project/src/oslc/
```

**Why?**
- **No version conflicts** - You control the code
- **Easy customization** - Modify for your specific needs
- **No supply chain risk** - No external dependencies to maintain
- **TypeScript native** - No build step, works directly in your TS project

### 2. Full TypeScript Support

Strong typing throughout:

```typescript
import type { OSLCResource, QueryParams } from './oslc/types.js';

// IntelliSense shows all available methods
const resource: OSLCResource = await client.getResource(url);

// Type-safe query parameters
const query: QueryParams = {
  select: 'dcterms:title,dcterms:identifier',
  where: 'oslc_cm:status="Open"',
  orderBy: '+dcterms:modified'
};
```

### 3. RDF Made Simple

Built on **rdflib** - the most robust RDF library for JavaScript:

```typescript
// Work with RDF without understanding all the details
const title = resource.getTitle();
resource.setTitle('New Title');

// Or use the full RDF power when needed
const customProp = resource.get('http://custom.namespace/property');
resource.set(customProperty, $rdf.literal('value'));
```

### 4. Automatic Authentication

Handles all three Jazz auth methods automatically:

```typescript
const client = new OSLCClient('username', 'password');
// That's it! Auth is handled transparently:
// - JEE Form Auth (j_security_check)
// - jauth realm (bearer tokens)
// - Basic Auth
// All with automatic cookie management
```

### 5. OSLC Service Discovery

Automatically discovers capabilities:

```typescript
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Behind the scenes:
// 1. Fetches /rootservices
// 2. Finds ServiceProviderCatalog for CM
// 3. Looks up "Project Area" in catalog
// 4. Loads ServiceProvider capabilities
// Now you can query and create resources!
```

### 6. Smart Query Handling

Automatic pagination and result parsing:

```typescript
// Automatically follows oslc:nextPage links
const resources = await client.queryResources(oslc_cm('ChangeRequest'), {
  where: 'oslc_cm:status="Open"'
});

// Even if there are 1000+ results across multiple pages,
// you get them all in a single array
```

### 7. Works Everywhere

Same code works in **Node.js and browsers**:

```typescript
// Node.js: uses axios with cookie jar
import OSLCClient from './oslc/index.js';

// Browser: uses axios with withCredentials
import OSLCClient from './oslc/index.js'; // Same import!
```

**Environment detection is automatic:**
- Node.js → tough-cookie for cookie management, @xmldom/xmldom for XML parsing
- Browser → Native cookie handling, native DOMParser

### 8. Configuration Context Support

First-class support for IBM GCM (Global Configuration Management):

```typescript
const client = new OSLCClient(
  'username',
  'password',
  'https://server.com/gc/configuration/1234' // Optional config context
);

// All requests automatically include Configuration-Context header
```

### 9. CRUD Operations

Simple, consistent API for all operations:

```typescript
// Create
const newResource = new OSLCResource();
newResource.setTitle('Bug: Login broken');
const created = await client.createResource(oslc_cm('ChangeRequest'), newResource);

// Read
const resource = await client.getResource(url) as OSLCResource;

// Update
resource.setTitle('Bug: Login fixed');
await client.putResource(resource, resource.etag);

// Delete
await client.deleteResource(resource);

// Query
const results = await client.queryResources(oslc_cm('ChangeRequest'), {...});
```

### 10. ETag Handling

Automatic optimistic concurrency control:

```typescript
// ETags are captured automatically
const resource = await client.getResource(url) as OSLCResource;
console.log(resource.etag); // "W/12345"

// Used automatically in updates
await client.putResource(resource, resource.etag);
// Includes If-Match: "W/12345" header
```

### 11. CSRF Protection

Automatic CSRF token management for Jazz:

```typescript
// No manual token handling needed!
await client.deleteResource(resource);
// Automatically includes X-Jazz-CSRF-Prevent header
```

## Comparison: Before vs. After

### Without This Client

```typescript
// 200+ lines of boilerplate code
// - Axios setup with cookie jar
// - Auth interceptors for 3 different methods
// - RDF parsing logic
// - Service discovery implementation
// - Query string building
// - Pagination handling
// - ETag management
// - CSRF token extraction
```

### With This Client

```typescript
// 10 lines of actual business logic
import OSLCClient from './oslc/index.js';
import { oslc_cm } from './oslc/namespaces.js';

const client = new OSLCClient('user', 'pass');
await client.use('https://server.com/ccm', 'My Project', 'CM');

const resources = await client.queryResources(oslc_cm('ChangeRequest'), {
  where: 'oslc_cm:status="Open"'
});
```

## When Should You Use This Client?

### Perfect For:

- **Enterprise integrations** - Connecting to IBM Jazz/ELM servers
- **Automation scripts** - Node.js scripts to automate workflows
- **Custom dashboards** - Web apps displaying OSLC data
- **Migration tools** - Moving data between systems
- **Reporting tools** - Extracting data for analytics
- **CI/CD integrations** - Linking builds to work items

### Use Cases:

#### 1. Automated Work Item Creation
```typescript
// CI/CD pipeline creates work items for failed builds
const defect = new OSLCResource();
defect.setTitle(`Build ${buildNumber} failed`);
defect.setDescription(errorLog);
await client.createResource(oslc_cm('Defect'), defect);
```

#### 2. Cross-Tool Traceability
```typescript
// Link requirements to test cases
const requirement = await client.getResource(reqURL) as OSLCResource;
const testCase = await client.getResource(testURL) as OSLCResource;

requirement.set(oslc_rm('validatedBy'), $rdf.sym(testURL));
await client.putResource(requirement, requirement.etag);
```

#### 3. Bulk Updates
```typescript
// Update all open defects to assign to a team
const defects = await client.queryResources(oslc_cm('Defect'), {
  where: 'oslc_cm:status="Open"'
});

for (const defect of defects) {
  defect.set(rtc_cm('owner'), $rdf.sym(teamOwnerURL));
  await client.putResource(defect, defect.etag);
}
```

#### 4. Custom Reporting
```typescript
// Generate weekly status report
const closedThisWeek = await client.queryResources(oslc_cm('ChangeRequest'), {
  where: `oslc_cm:status="Closed" and dcterms:modified>="${weekStart}"`,
  select: 'dcterms:title,dcterms:identifier,dcterms:creator'
});

generateReport(closedThisWeek);
```

## Proven Technology Stack

This client uses battle-tested dependencies:

- **axios** (^1.13.2) - Industry standard HTTP client
- **rdflib** (2.3.0) - The RDF library for JavaScript
- **tough-cookie** (^6.0.0) - Full cookie jar implementation
- **@xmldom/xmldom** (^0.9.8) - Standards-compliant XML parsing

All dependencies are proven to work with IBM Jazz/ELM servers in production.

## Direct TypeScript Port

This is a **faithful TypeScript conversion** of the proven oslc-client (v3.0.1) JavaScript library:

- **Same architecture** - Identical class structure and behavior
- **Same API** - Method signatures match the original
- **Plus TypeScript** - Type safety and better IDE support
- **Battle-tested** - Logic proven in production JavaScript deployments

## Next Steps

Ready to get started?

- [Getting Started Guide](./getting-started) - Installation and first steps
- [API Reference](./api/OSLCClient.md) - Complete API documentation
- [Manual Installation](./manual-installation) - Copy-paste the source
