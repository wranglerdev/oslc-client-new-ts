# Namespaces API Reference

RDF namespace definitions for OSLC and Jazz vocabularies.

**Source:** `src/namespaces.ts`

## Overview

Namespaces provide helper functions to create RDF property URIs. Instead of writing full URIs like `http://purl.org/dc/terms/title`, you can use `dcterms('title')`.

All namespaces are created using rdflib's `Namespace()` function, which returns a function that generates `NamedNode` objects.

## Core RDF Namespaces

### `rdf`

RDF syntax namespace.

**Source:** `src/namespaces.ts:21`

**URI:** `http://www.w3.org/1999/02/22-rdf-syntax-ns#`

```typescript
import { rdf } from './oslc/namespaces.js';

// Common properties
rdf('type')        // http://www.w3.org/1999/02/22-rdf-syntax-ns#type
rdf('Property')    // http://www.w3.org/1999/02/22-rdf-syntax-ns#Property
```

### `rdfs`

RDF Schema namespace.

**Source:** `src/namespaces.ts:22`

**URI:** `http://www.w3.org/2000/01/rdf-schema#`

```typescript
import { rdfs } from './oslc/namespaces.js';

rdfs('label')      // http://www.w3.org/2000/01/rdf-schema#label
rdfs('comment')    // http://www.w3.org/2000/01/rdf-schema#comment
rdfs('member')     // http://www.w3.org/2000/01/rdf-schema#member
```

### `owl`

Web Ontology Language namespace.

**Source:** `src/namespaces.ts:25`

**URI:** `http://www.w3.org/2002/07/owl#`

```typescript
import { owl } from './oslc/namespaces.js';

owl('sameAs')      // http://www.w3.org/2002/07/owl#sameAs
```

## Dublin Core Namespace

### `dcterms`

Dublin Core Terms - the most commonly used OSLC properties.

**Source:** `src/namespaces.ts:23`

**URI:** `http://purl.org/dc/terms/`

```typescript
import { dcterms } from './oslc/namespaces.js';

// Core properties used in almost every OSLC resource
dcterms('title')           // Title
dcterms('description')     // Description
dcterms('identifier')      // Identifier (ID)
dcterms('created')         // Creation timestamp
dcterms('modified')        // Last modified timestamp
dcterms('creator')         // Creator (person URI)
dcterms('contributor')     // Contributors
dcterms('type')            // Resource type
dcterms('subject')         // Tags/keywords
```

**Usage Example:**
```typescript
import { dcterms } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

const resource = new OSLCResource();
resource.set(dcterms('title'), $rdf.literal('My Work Item'));
resource.set(dcterms('description'), $rdf.literal('Detailed description here'));
resource.set(dcterms('type'), $rdf.literal('Defect'));

const title = resource.get(dcterms('title'));
```

## FOAF Namespace

### `foaf`

Friend of a Friend - used for people and organizations.

**Source:** `src/namespaces.ts:24`

**URI:** `http://xmlns.com/foaf/0.1/`

```typescript
import { foaf } from './oslc/namespaces.js';

foaf('name')       // Person's name
foaf('Person')     // Person type
foaf('mbox')       // Email address
```

## OSLC Core Namespaces

### `oslc`

OSLC Core 2.0 namespace.

**Source:** `src/namespaces.ts:26`

**URI:** `http://open-services.net/ns/core#`

```typescript
import { oslc } from './oslc/namespaces.js';

// Service discovery
oslc('ServiceProvider')
oslc('ServiceProviderCatalog')
oslc('service')
oslc('queryCapability')
oslc('creationFactory')

// Query properties
oslc('queryBase')
oslc('resourceType')
oslc('nextPage')

// Resource properties
oslc('shortTitle')
oslc('shortId')
oslc('archived')

// Compact/Preview
oslc('Compact')
oslc('smallPreview')
oslc('largePreview')
oslc('icon')
oslc('iconTitle')
```

## OSLC Domain Namespaces

### `oslc_cm`

Change Management (OSLC CM 2.0).

**Source:** `src/namespaces.ts:28`

**URI:** `http://open-services.net/ns/cm#`

```typescript
import { oslc_cm } from './oslc/namespaces.js';

// Resource types
oslc_cm('ChangeRequest')     // Generic change request

// Properties
oslc_cm('status')            // Status (Open, In Progress, Closed, etc.)
oslc_cm('priority')          // Priority (Low, Medium, High, Critical)
oslc_cm('severity')          // Severity
oslc_cm('fixed')             // Fixed in version
oslc_cm('affectedByDefect')  // Related defects

// Links
oslc_cm('tracksRequirement')    // Tracks requirement (link to DOORS)
oslc_cm('implementsRequirement') // Implements requirement
oslc_cm('testedByTestCase')     // Tested by test case (link to ETM)
oslc_cm('relatedChangeRequest') // Related work item
oslc_cm('affectsRequirement')   // Affects requirement
oslc_cm('blockedBy')            // Blocked by work item
oslc_cm('blocks')               // Blocks work item
```

**Usage Example:**
```typescript
import { oslc_cm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

// Query for open change requests
const results = await client.queryResources(
  oslc_cm('ChangeRequest'),
  { where: 'oslc_cm:status="Open"' }
);

// Set status
resource.set(oslc_cm('status'), $rdf.literal('In Progress'));
resource.set(oslc_cm('priority'), $rdf.literal('High'));
```

### `oslc_cm1`

Change Management 1.0 (Jazz-specific).

**Source:** `src/namespaces.ts:29`

**URI:** `http://open-services.net/xmlns/cm/1.0/`

```typescript
import { oslc_cm1 } from './oslc/namespaces.js';

// Used mainly for service discovery in Jazz
oslc_cm1('cmServiceProviders')   // Service provider catalog property
```

### `oslc_rm`

Requirements Management.

**Source:** `src/namespaces.ts:27`

**URI:** `http://open-services.net/ns/rm#`

```typescript
import { oslc_rm } from './oslc/namespaces.js';

// Resource types
oslc_rm('Requirement')           // Requirement
oslc_rm('RequirementCollection') // Folder/Module

// Links
oslc_rm('satisfies')             // Requirement satisfies another
oslc_rm('validatedBy')           // Validated by test case
oslc_rm('implementedBy')         // Implemented by work item
oslc_rm('elaboratedBy')          // Elaborated by another requirement
oslc_rm('specifiedBy')           // Specified by requirement
oslc_rm('affectedBy')            // Affected by change request

// Service discovery
oslc_rm('rmServiceProviders')
```

**Usage Example:**
```typescript
import { oslc_rm } from './oslc/namespaces.js';

// Query requirements
const requirements = await client.queryResources(
  oslc_rm('Requirement'),
  { where: 'dcterms:title contains "authentication"' }
);

// Link work item to requirement
workItem.set(
  oslc_cm('tracksRequirement'),
  $rdf.sym('https://server.com/rm/resources/_abc123')
);
```

### `oslc_qm`

Quality Management (OSLC QM 2.0).

**Source:** `src/namespaces.ts:35`

**URI:** `http://open-services.net/ns/qm#`

```typescript
import { oslc_qm } from './oslc/namespaces.js';

// Resource types
oslc_qm('TestPlan')
oslc_qm('TestCase')
oslc_qm('TestScript')
oslc_qm('TestResult')
oslc_qm('TestExecutionRecord')

// Properties
oslc_qm('status')                // Test status
oslc_qm('executionDate')         // When test was run
oslc_qm('verdict')               // Pass/Fail

// Links
oslc_qm('testsChangeRequest')    // Tests work item
oslc_qm('validatesRequirement')  // Validates requirement
oslc_qm('relatedChangeRequest')
```

### `oslc_qm1`

Quality Management 1.0 (Jazz-specific).

**Source:** `src/namespaces.ts:38`

**URI:** `http://open-services.net/xmlns/qm/1.0/`

```typescript
import { oslc_qm1 } from './oslc/namespaces.js';

// Service discovery
oslc_qm1('qmServiceProviders')
```

## Jazz-Specific Namespaces

### `rtc_cm`

RTC Change Management extensions.

**Source:** `src/namespaces.ts:30`

**URI:** `http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/`

```typescript
import { rtc_cm } from './oslc/namespaces.js';

// Jazz-specific properties
rtc_cm('owner')              // Work item owner
rtc_cm('timeSheet')          // Time tracking
rtc_cm('estimate')           // Estimate
rtc_cm('correctedEstimate')  // Corrected estimate
rtc_cm('timeSpent')          // Time spent
```

### `rtc_cm_resolvedBy`

Specific Jazz link type for resolution relationships.

**Source:** `src/namespaces.ts:33`

**URI:** `http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.workitem.linktype.resolvesworkitem.resolvedBy`

```typescript
import { rtc_cm_resolvedBy } from './oslc/namespaces.js';

// This work item is resolved by another work item
workItem.set(rtc_cm_resolvedBy, $rdf.sym(resolverWorkItemURL));
```

### `rtc_cm_relatedArtifact`

Jazz related artifact link type.

**Source:** `src/namespaces.ts:34`

**URI:** `http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.workitem.linktype.relatedartifact.relatedArtifact`

```typescript
import { rtc_cm_relatedArtifact } from './oslc/namespaces.js';

// Link to related artifacts (builds, source files, etc.)
workItem.set(rtc_cm_relatedArtifact, $rdf.sym(artifactURL));
```

### `rtc_cm_ext`, `rtc_ext`

RTC extensions.

**Source:** `src/namespaces.ts:31-32`

**URI:** `http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/`

```typescript
import { rtc_ext } from './oslc/namespaces.js';

// Extended Jazz properties
```

### `rqm_qm`

RQM Quality Management extensions.

**Source:** `src/namespaces.ts:36`

**URI:** `http://jazz.net/ns/qm/rqm#`

```typescript
import { rqm_qm } from './oslc/namespaces.js';

// RQM-specific test properties
```

### `rqm_process`

RQM Process namespace.

**Source:** `src/namespaces.ts:37`

**URI:** `http://jazz.net/xmlns/prod/jazz/rqm/process/1.0/`

```typescript
import { rqm_process } from './oslc/namespaces.js';

// RQM process-related properties
```

### `jd`

Jazz Discovery namespace.

**Source:** `src/namespaces.ts:44`

**URI:** `http://jazz.net/xmlns/prod/jazz/discovery/1.0/`

```typescript
import { jd } from './oslc/namespaces.js';

// Used in rootservices documents
jd('oslcCatalogs')
```

## Other Namespaces

### `atom`

Atom Syndication Format.

**Source:** `src/namespaces.ts:39`

**URI:** `http://www.w3.org/2005/Atom`

```typescript
import { atom } from './oslc/namespaces.js';

atom('feed')
atom('entry')
```

### `xml`

XML namespace (same as RDF).

**Source:** `src/namespaces.ts:40`

**URI:** `http://www.w3.org/1999/02/22-rdf-syntax-ns#`

### `rss`

RSS namespace.

**Source:** `src/namespaces.ts:41`

**URI:** `http://purl.org/rss/1.0/`

### `xsd`

XML Schema Datatypes.

**Source:** `src/namespaces.ts:42`

**URI:** `http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-`

```typescript
import { xsd } from './oslc/namespaces.js';

xsd('string')
xsd('integer')
xsd('dateTime')
xsd('boolean')
```

### `contact`

Contact information.

**Source:** `src/namespaces.ts:43`

**URI:** `http://www.w3.org/2000/10/swap/pim/contact#`

## Usage Patterns

### Basic Property Access

```typescript
import { dcterms, oslc_cm } from './oslc/namespaces.js';

const title = resource.get(dcterms('title'));
const status = resource.get(oslc_cm('status'));
```

### Creating Properties with Namespaces

```typescript
import { dcterms, oslc_cm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

resource.set(dcterms('title'), $rdf.literal('New Work Item'));
resource.set(dcterms('description'), $rdf.literal('Description here'));
resource.set(oslc_cm('status'), $rdf.literal('Open'));
resource.set(oslc_cm('priority'), $rdf.literal('High'));
```

### Cross-Domain Links

```typescript
import { oslc_cm, oslc_rm, oslc_qm } from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

// Work item tracks requirement
workItem.set(
  oslc_cm('tracksRequirement'),
  $rdf.sym('https://server.com/rm/resources/_abc123')
);

// Work item tested by test case
workItem.set(
  oslc_cm('testedByTestCase'),
  $rdf.sym('https://server.com/qm/resources/testcase/456')
);

// Requirement validated by test case
requirement.set(
  oslc_rm('validatedBy'),
  $rdf.sym('https://server.com/qm/resources/testcase/789')
);
```

### Querying with Namespaces

```typescript
import { oslc_cm } from './oslc/namespaces.js';

const results = await client.queryResources(
  oslc_cm('ChangeRequest'),
  {
    // Use namespace prefixes in where clause
    where: 'dcterms:type="Defect" and oslc_cm:status="Open"',
    select: 'dcterms:title,dcterms:identifier,oslc_cm:priority'
  }
);
```

### Getting Full URI

```typescript
import { dcterms } from './oslc/namespaces.js';

const titleNode = dcterms('title');
console.log(titleNode.value);
// "http://purl.org/dc/terms/title"

// Use .value to get the URI string
const uri = dcterms('title').value;
```

## Complete Example

```typescript
import OSLCClient, { OSLCResource } from './oslc/index.js';
import {
  dcterms,
  oslc_cm,
  oslc_rm,
  oslc_qm,
  rtc_cm,
  foaf
} from './oslc/namespaces.js';
import * as $rdf from 'rdflib';

async function createLinkedResources() {
  const client = new OSLCClient('username', 'password');

  // Create a work item
  await client.use('https://server.com/ccm', 'My Project', 'CM');

  const workItem = new OSLCResource();
  workItem.set(dcterms('title'), $rdf.literal('Implement authentication'));
  workItem.set(dcterms('description'), $rdf.literal('Add login functionality'));
  workItem.set(dcterms('type'), $rdf.literal('Task'));
  workItem.set(oslc_cm('status'), $rdf.literal('New'));
  workItem.set(oslc_cm('priority'), $rdf.literal('High'));

  const created = await client.createResource(oslc_cm('ChangeRequest'), workItem);

  // Link to requirement
  created.set(
    oslc_cm('tracksRequirement'),
    $rdf.sym('https://server.com/rm/resources/_req123')
  );

  // Link to test case
  created.set(
    oslc_cm('testedByTestCase'),
    $rdf.sym('https://server.com/qm/resources/testcase/456')
  );

  // Update
  await client.putResource(created, created.etag);

  console.log('Work item created with links!');
}
```

## Related Documentation

- [OSLCResource](./OSLCResource.md) - Using namespaces with resources
- [OSLCClient](./OSLCClient.md) - Querying with namespaces
- [Types](./types.md) - TypeScript type definitions
- [OSLC Specification](https://open-services.net/specifications/) - Official namespace definitions
