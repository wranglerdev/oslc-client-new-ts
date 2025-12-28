# IBM Jazz & Engineering Lifecycle Management (ELM)

## Overview

**IBM Jazz** is a scalable, extensible platform for collaborative software and systems development. **ELM (Engineering Lifecycle Management)** is IBM's suite of integrated tools built on the Jazz platform that implements the OSLC standard.

## Jazz Platform

The Jazz platform provides:

- **Team collaboration** - Shared workspaces, dashboards, and real-time updates
- **Process automation** - Configurable workflows and governance
- **Lifecycle traceability** - Link artifacts across the entire development lifecycle
- **OSLC integration** - Standards-based API for tool integration

### Jazz Foundation Services

The underlying services that all Jazz applications use:

- **Jazz Team Server (JTS)** - Central hub for authentication, projects, and users
- **Jazz Authorization Server (JAS)** - OAuth 2.0 authentication and authorization
- **Link Index Provider (LDX)** - Cross-application link indexing
- **Data Collection Component (DCC)** - Data warehouse for reporting

## ELM Applications

### 1. Engineering Workflow Management (EWM)

**Formerly:** Rational Team Concert (RTC)

**Purpose:** Agile planning, source control, and work item tracking

**OSLC Domain:** Change Management (CM)

**Key Resource Types:**
- Work Items (Stories, Defects, Tasks, Epics)
- Change Sets
- Builds
- Timelines and Iterations

**Typical Use Cases:**
```typescript
// Query open defects
const defects = await client.queryResources(
  oslc_cm('ChangeRequest'),
  {
    where: 'dcterms:type="Defect" and oslc_cm:status="Open"',
    select: 'dcterms:title,dcterms:identifier,oslc_cm:priority'
  }
);

// Create a new story
const story = new OSLCResource();
story.setTitle('Implement user authentication');
story.set(oslc_cm('status'), $rdf.literal('New'));
await client.createResource(oslc_cm('ChangeRequest'), story);
```

### 2. Engineering Requirements Management DOORS Next (DOORS Next)

**Formerly:** Rational DOORS Next Generation (DNG)

**Purpose:** Requirements definition, analysis, and traceability

**OSLC Domain:** Requirements Management (RM)

**Key Resource Types:**
- Requirements
- Collections (Modules, Folders)
- Comments
- Diagrams

**Typical Use Cases:**
```typescript
// Find requirements related to security
const requirements = await client.queryResources(
  oslc_rm('Requirement'),
  {
    where: 'dcterms:title contains "security"',
    select: 'dcterms:title,dcterms:identifier'
  }
);

// Create a functional requirement
const requirement = new OSLCResource();
requirement.setTitle('System shall encrypt passwords');
requirement.setDescription('All user passwords must be encrypted using bcrypt');
await client.createResource(oslc_rm('Requirement'), requirement);
```

### 3. Engineering Test Management (ETM)

**Formerly:** Rational Quality Manager (RQM)

**Purpose:** Test planning, execution, and lab resource management

**OSLC Domain:** Quality Management (QM)

**Key Resource Types:**
- Test Plans
- Test Cases
- Test Scripts
- Test Results
- Execution Records

**Typical Use Cases:**
```typescript
// Query failed test results
const failedTests = await client.queryResources(
  oslc_qm('TestResult'),
  {
    where: 'oslc_qm:status="failed"',
    select: 'dcterms:title,oslc_qm:executionDate'
  }
);

// Create a test case
const testCase = new OSLCResource();
testCase.setTitle('Verify login with valid credentials');
testCase.setDescription('Steps: 1. Navigate to login page...');
await client.createResource(oslc_qm('TestCase'), testCase);
```

### 4. Engineering Systems Design Rhapsody (Rhapsody)

**Purpose:** Model-based systems engineering and software design

**OSLC Domain:** Architecture Management (AM)

**Key Resource Types:**
- Model Elements
- Diagrams
- Requirements (from models)

### 5. Global Configuration Management (GCM)

**Purpose:** Manage configurations across all ELM applications

**Capabilities:**
- Configuration Contexts
- Baselines
- Streams
- Change Sets

**Usage with OSLC Client:**
```typescript
// Connect with a configuration context
const client = new OSLCClient('username', 'password',
  'https://server.com/gc/configuration/1234');
```

## Jazz Rootservices Discovery

All Jazz applications expose a `/rootservices` endpoint for OSLC discovery:

```
https://server.com/ccm/rootservices      (EWM/RTC)
https://server.com/rm/rootservices       (DOORS Next)
https://server.com/qm/rootservices       (ETM/RQM)
https://server.com/gc/rootservices       (GCM)
```

The rootservices document provides:

- Service Provider Catalog URLs for each domain (CM, RM, QM)
- OAuth endpoints
- Version information
- Capability discovery

**Example Flow:**
```typescript
const client = new OSLCClient('username', 'password');

// Automatically discovers rootservices, catalog, and provider
await client.use(
  'https://server.com/ccm',     // EWM server
  'SAFe Project Area',          // Project/Service Provider
  'CM'                          // Domain (CM, RM, or QM)
);
```

## Jazz Authentication

Jazz applications support multiple authentication methods:

### 1. JEE Form-Based Authentication
Standard J2EE container authentication using JSESSIONID cookies.

**Flow:**
1. Client makes request
2. Server responds with `x-com-ibm-team-repository-web-auth-msg: authrequired`
3. Client POSTs credentials to `/j_security_check`
4. Server sets JSESSIONID cookie
5. Client retries original request

### 2. jauth Realm (Bearer Token)
Jazz-specific OAuth-like authentication.

**Flow:**
1. Server responds with 401 and `www-authenticate: jauth realm="..." token_uri="..."`
2. Client POSTs credentials to `token_uri`
3. Server returns bearer token
4. Client uses `Authorization: Bearer <token>` header

### 3. Basic Authentication
Standard HTTP Basic Auth for Jazz Authorization Server.

**This client handles all three automatically!**

## Project Areas vs. Service Providers

In Jazz terminology:

- **Project Area** - A Jazz application's organizational unit (like a project)
- **Service Provider** - OSLC term for the same concept

They are synonymous. When using this client:

```typescript
await client.use(
  'https://server.com/ccm',
  'My Project Area',  // This is the OSLC Service Provider
  'CM'
);
```

## Common Jazz URLs

### EWM/RTC (Change Management)
```
Base URL: https://server.com/ccm
Root Services: /ccm/rootservices
Service Catalog: /ccm/oslc/workitems/catalog
Work Items: /ccm/resource/itemName/com.ibm.team.workitem.WorkItem/<id>
```

### DOORS Next (Requirements Management)
```
Base URL: https://server.com/rm
Root Services: /rm/rootservices
Service Catalog: /rm/oslc_rm/catalog
Requirements: /rm/resources/_<guid>
```

### ETM/RQM (Quality Management)
```
Base URL: https://server.com/qm
Root Services: /qm/rootservices
Service Catalog: /qm/oslc_qm/catalog
Test Cases: /qm/oslc_qm/contexts/_<project>/resources/com.ibm.rqm.planning.VersionedTestCase/_<id>
```

## CSRF Protection

Jazz applications use CSRF tokens for write operations:

**For DELETE requests:** Client must include `X-Jazz-CSRF-Prevent` header with JSESSIONID value.

```typescript
// This client handles CSRF automatically!
await client.deleteResource(resource);
```

## Configuration Management

When working with configurations (GCM):

```typescript
// Specify configuration context at client creation
const client = new OSLCClient(
  'username',
  'password',
  'https://server.com/gc/configuration/1234'  // Configuration context
);

// All requests will include Configuration-Context header
const resources = await client.queryResources(...);
```

## Links and Relationships

Jazz applications extensively use OSLC links:

### Common Link Types

**EWM (Change Management):**
- `rtc_cm:com.ibm.team.workitem.linktype.resolvesworkitem.resolvedBy`
- `rtc_cm:com.ibm.team.workitem.linktype.relatedartifact.relatedArtifact`
- `oslc_cm:tracksRequirement` - Link to DOORS Next requirement
- `oslc_cm:testedByTestCase` - Link to ETM test case

**DOORS Next (Requirements):**
- `oslc_rm:satisfies` - Requirement satisfies another requirement
- `oslc_rm:implementedBy` - Implemented by work item
- `oslc_rm:validatedBy` - Validated by test case

**Example:**
```typescript
// Get work item and its linked requirements
const workItem = await client.getResource(
  'https://server.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/12345'
) as OSLCResource;

const trackedRequirements = workItem.get(oslc_cm('tracksRequirement'));
// Returns: "https://server.com/rm/resources/_abc123def"
```

## Best Practices for Jazz/ELM

### 1. Use Service Discovery
Always use `client.use()` to discover capabilities rather than hardcoding URLs.

### 2. Handle ETags
Jazz supports optimistic concurrency control:
```typescript
const resource = await client.getResource(url) as OSLCResource;
// resource.etag is automatically captured
await client.putResource(resource, resource.etag);
```

### 3. Batch Queries
Use pagination and selective properties:
```typescript
const results = await client.queryResources(resourceType, {
  select: 'dcterms:title,dcterms:identifier', // Only what you need
  where: 'oslc_cm:status="Open"'
});
```

### 4. Configuration Context
For versioned artifacts, always specify configuration:
```typescript
const client = new OSLCClient('user', 'pass', configContextURL);
```

## Resources

- [Jazz.net Community](https://jazz.net/)
- [IBM ELM Documentation](https://www.ibm.com/docs/en/engineering-lifecycle-management-suite)
- [Jazz OSLC Workshop](https://jazz.net/library/article/635)
- [ELM System Requirements](https://www.ibm.com/support/pages/elm-system-requirements)

## Next Steps

- [Why This Client?](./why-this-client) - Learn why you should use this TypeScript client
- [Getting Started](./getting-started) - Start building with the client
- [API Reference](./api/OSLCClient.md) - Detailed API documentation
