# Getting Started

This guide will help you start using the OSLC TypeScript client in your project.

## Installation

This client is designed to be **copied directly** into your project, not installed via npm.

### Step 1: Copy Source Files

```bash
# From this repository, copy the src directory to your project
cp -r oslc-client-new-ts/src/ your-project/src/oslc/
```

Or see [Manual Installation](./05-manual-installation.md) for the complete file structure and code.

### Step 2: Install Dependencies

```bash
cd your-project
npm install axios axios-cookiejar-support tough-cookie rdflib @xmldom/xmldom
```

### Step 3: TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Your First OSLC Client

### Basic Usage

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm } from './oslc/namespaces.js';

async function main() {
  // Create a client
  const client = new OSLCClient('your-username', 'your-password');

  // Connect to an EWM server and project area
  await client.use(
    'https://your-server.com/ccm',  // Server URL
    'Your Project Area',            // Service Provider name
    'CM'                            // Domain: CM, RM, or QM
  );

  console.log('Connected successfully!');
}

main().catch(console.error);
```

## Common Operations

### Querying Resources

```typescript
import OSLCClient from './oslc/index.js';
import { oslc_cm } from './oslc/namespaces.js';
import type { QueryParams } from './oslc/types.js';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Query for open defects
const queryParams: QueryParams = {
  where: 'dcterms:type="Defect" and oslc_cm:status="Open"',
  select: 'dcterms:title,dcterms:identifier,oslc_cm:priority',
  orderBy: '-dcterms:modified'  // - for descending, + for ascending
};

const defects = await client.queryResources(
  oslc_cm('ChangeRequest'),
  queryParams
);

console.log(`Found ${defects.length} open defects`);

for (const defect of defects) {
  console.log(defect.getTitle());
  console.log(defect.getIdentifier());
}
```

### Creating a Resource

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_cm, dcterms } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Create a new defect
const defect = new OSLCResource();
defect.setTitle('Login page crashes on Safari');
defect.setDescription('When clicking login button, Safari crashes...');

// Set custom properties
defect.set(oslc_cm('status'), $rdf.literal('New'));
defect.set(oslc_cm('priority'), $rdf.literal('High'));

// Create the resource on the server
const created = await client.createResource(
  oslc_cm('ChangeRequest'),
  defect
);

console.log('Created defect:', created.getURI());
console.log('Identifier:', created.getIdentifier());
```

### Reading a Resource

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Get a specific work item by URL
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const workItem = await client.getResource(url) as OSLCResource;

console.log('Title:', workItem.getTitle());
console.log('Description:', workItem.getDescription());
console.log('Identifier:', workItem.getIdentifier());

// Get any property
const status = workItem.get('http://open-services.net/ns/cm#status');
console.log('Status:', status);

// Get all properties as an object
const allProps = workItem.getProperties();
console.log(JSON.stringify(allProps, null, 2));
```

### Updating a Resource

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_cm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Get the resource
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const workItem = await client.getResource(url) as OSLCResource;

// Modify it
workItem.setTitle('UPDATED: Login page crashes on Safari');
workItem.set(oslc_cm('status'), $rdf.literal('In Progress'));

// Update on server (uses ETag for optimistic concurrency)
await client.putResource(workItem, workItem.etag);

console.log('Updated successfully!');
```

### Deleting a Resource

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';

const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project Area', 'CM');

// Get the resource
const url = 'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345';
const workItem = await client.getResource(url) as OSLCResource;

// Delete it (includes CSRF protection automatically)
await client.deleteResource(workItem);

console.log('Deleted successfully!');
```

## Working with Different Domains

### Requirements Management (DOORS Next)

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_rm } from './oslc/namespaces.js';

const client = new OSLCClient('username', 'password');

// Connect to DOORS Next
await client.use(
  'https://server.com/rm',
  'My Requirements Project',
  'RM'  // Requirements Management domain
);

// Query requirements
const requirements = await client.queryResources(
  oslc_rm('Requirement'),
  {
    where: 'dcterms:title contains "security"',
    select: 'dcterms:title,dcterms:identifier'
  }
);

// Create a requirement
const req = new OSLCResource();
req.setTitle('System shall encrypt all passwords');
req.setDescription('Passwords must be encrypted using bcrypt...');

const created = await client.createResource(
  oslc_rm('Requirement'),
  req
);
```

### Quality Management (ETM/RQM)

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_qm } from './oslc/namespaces.js';

const client = new OSLCClient('username', 'password');

// Connect to ETM/RQM
await client.use(
  'https://server.com/qm',
  'My Test Project',
  'QM'  // Quality Management domain
);

// Query test cases
const testCases = await client.queryResources(
  oslc_qm('TestCase'),
  {
    where: 'dcterms:title contains "login"',
    select: 'dcterms:title,dcterms:identifier'
  }
);

// Create a test case
const testCase = new OSLCResource();
testCase.setTitle('Verify login with valid credentials');
testCase.setDescription('Steps: 1. Navigate to login...');

const created = await client.createResource(
  oslc_qm('TestCase'),
  testCase
);
```

## Working with Configurations

When using IBM Global Configuration Management (GCM):

```typescript
import OSLCClient from './oslc/index.js';

// Create client with configuration context
const client = new OSLCClient(
  'username',
  'password',
  'https://server.com/gc/configuration/1234'  // Configuration URI
);

// All requests will include Configuration-Context header
await client.use('https://server.com/rm', 'My Project', 'RM');

const requirements = await client.queryResources(
  oslc_rm('Requirement'),
  { where: 'dcterms:type="Functional"' }
);
// These requirements are from the specific configuration
```

## Complete Example: Linking Resources

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import { oslc_cm, oslc_rm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

async function linkWorkItemToRequirement() {
  // Connect to EWM
  const cmClient = new OSLCClient('username', 'password');
  await cmClient.use('https://server.com/ccm', 'My Project', 'CM');

  // Get a work item
  const workItemURL = 'https://server.com/ccm/resource/.../WorkItem/12345';
  const workItem = await cmClient.getResource(workItemURL) as OSLCResource;

  // Link to a requirement
  const requirementURL = 'https://server.com/rm/resources/_abc123';
  workItem.set(
    oslc_cm('tracksRequirement'),
    $rdf.sym(requirementURL)
  );

  // Update the work item
  await cmClient.putResource(workItem, workItem.etag);

  console.log('Linked work item to requirement!');
}

linkWorkItemToRequirement().catch(console.error);
```

## Advanced Query Examples

### Filtering with Multiple Conditions

```typescript
const query: QueryParams = {
  where: 'dcterms:type="Defect" and oslc_cm:status="Open" and oslc_cm:priority="High"',
  select: 'dcterms:title,dcterms:identifier,dcterms:creator',
  orderBy: '-dcterms:modified'
};

const highPriorityDefects = await client.queryResources(
  oslc_cm('ChangeRequest'),
  query
);
```

### Using Prefixes

```typescript
const query: QueryParams = {
  prefix: 'dcterms=<http://purl.org/dc/terms/>,oslc_cm=<http://open-services.net/ns/cm#>',
  where: 'dcterms:type="Defect"',
  select: 'dcterms:title,dcterms:identifier'
};
```

### Date-Based Queries

```typescript
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const query: QueryParams = {
  where: `dcterms:modified>="${lastWeek}"`,
  select: 'dcterms:title,dcterms:identifier,dcterms:modified',
  orderBy: '-dcterms:modified'
};

const recentChanges = await client.queryResources(
  oslc_cm('ChangeRequest'),
  query
);
```

### Text Search

```typescript
const query: QueryParams = {
  where: 'dcterms:title contains "login"',
  select: 'dcterms:title,dcterms:identifier'
};

const loginRelatedItems = await client.queryResources(
  oslc_cm('ChangeRequest'),
  query
);
```

## Error Handling

```typescript
import OSLCClient from './oslc/index.js';

async function robustQuery() {
  const client = new OSLCClient('username', 'password');

  try {
    await client.use('https://server.com/ccm', 'My Project', 'CM');
  } catch (error) {
    console.error('Failed to connect to service provider:', error);
    return;
  }

  try {
    const resources = await client.queryResources(
      oslc_cm('ChangeRequest'),
      { where: 'oslc_cm:status="Open"' }
    );
    console.log(`Found ${resources.length} resources`);
  } catch (error) {
    console.error('Query failed:', error);
  }
}
```

## Tips and Best Practices

### 1. Reuse Client Instances

```typescript
// Good: Create once, reuse
const client = new OSLCClient('username', 'password');
await client.use('https://server.com/ccm', 'Project', 'CM');

// Use for multiple operations
const defects = await client.queryResources(...);
const created = await client.createResource(...);
```

### 2. Use Selective Properties

```typescript
// Good: Only fetch what you need
const query: QueryParams = {
  select: 'dcterms:title,dcterms:identifier',  // Only these properties
  where: 'oslc_cm:status="Open"'
};

// Bad: Fetching everything (slow)
const query: QueryParams = {
  where: 'oslc_cm:status="Open"'
  // No select = all properties = slower
};
```

### 3. Handle ETags for Updates

```typescript
// Always use the ETag from the GET request
const resource = await client.getResource(url) as OSLCResource;
resource.setTitle('New Title');
await client.putResource(resource, resource.etag);  // Include ETag!
```

### 4. Check for Empty Results

```typescript
const resources = await client.queryResources(oslc_cm('ChangeRequest'), query);

if (resources.length === 0) {
  console.log('No resources found');
} else {
  for (const resource of resources) {
    console.log(resource.getTitle());
  }
}
```

## Next Steps

- **API Reference** - Explore detailed documentation:
  - [OSLCClient](./api/OSLCClient.md)
  - [OSLCResource](./api/OSLCResource.md)
  - [Namespaces](./api/namespaces.md)
- **Manual Installation** - See [complete file structure](./05-manual-installation.md)
- **Examples** - Check out more advanced usage patterns in the API docs

## Need Help?

- Review the [OSLC Introduction](./01-what-is-oslc.md) for background
- Check the [IBM Jazz & ELM guide](./02-ibm-jazz-elm.md) for Jazz-specific details
- Read the [API documentation](./api/OSLCClient.md) for all available methods
