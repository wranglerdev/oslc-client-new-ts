# What is OSLC?

## Overview

**OSLC (Open Services for Lifecycle Collaboration)** is an open community and set of standards for integrating software development lifecycle tools. It enables different tools to work together by providing a common way to create, read, update, and link resources across applications.

## Core Concepts

### 1. Resource-Oriented Architecture

OSLC is built on REST principles where everything is a **resource** identified by a URI:

```
https://server.com/ccm/resource/workitem/12345
```

Each resource can be:
- **Created** - POST to a creation factory
- **Read** - GET the resource URI
- **Updated** - PUT to the resource URI
- **Deleted** - DELETE the resource URI
- **Queried** - GET with query parameters

### 2. RDF Representation

Resources are represented using **RDF (Resource Description Framework)**, typically in RDF/XML format:

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:dcterms="http://purl.org/dc/terms/"
         xmlns:oslc_cm="http://open-services.net/ns/cm#">
  <oslc_cm:ChangeRequest rdf:about="https://server.com/ccm/resource/workitem/12345">
    <dcterms:title>Login page crashes on Safari</dcterms:title>
    <dcterms:identifier>12345</dcterms:identifier>
    <oslc_cm:status>Open</oslc_cm:status>
  </oslc_cm:ChangeRequest>
</rdf:RDF>
```

### 3. Linked Data

OSLC resources can **link to each other across different tools**, enabling traceability:

```xml
<oslc_cm:ChangeRequest>
  <dcterms:title>Fix authentication bug</dcterms:title>
  <oslc_cm:relatedChangeRequest
    rdf:resource="https://other-server.com/ccm/resource/123"/>
  <oslc_rm:trackedBy
    rdf:resource="https://rm-server.com/rm/requirements/456"/>
</oslc_cm:ChangeRequest>
```

## OSLC Domains

OSLC defines specialized vocabularies for different lifecycle domains:

### Change Management (CM)
Work items, defects, tasks, and change requests.

**Common Resource Types:**
- `oslc_cm:ChangeRequest` - Generic change request
- `oslc_cm:Defect` - Bug or defect
- `oslc_cm:Task` - Work task
- `oslc_cm:ChangeSet` - Version control changeset

### Requirements Management (RM)
Requirements, use cases, and specifications.

**Common Resource Types:**
- `oslc_rm:Requirement` - Functional or non-functional requirement
- `oslc_rm:RequirementCollection` - Collection of requirements

### Quality Management (QM)
Test plans, test cases, test results.

**Common Resource Types:**
- `oslc_qm:TestPlan` - Test plan
- `oslc_qm:TestCase` - Test case
- `oslc_qm:TestResult` - Test execution result
- `oslc_qm:TestScript` - Automated test script

## Service Discovery

OSLC uses a **discovery pattern** to find capabilities:

1. **Root Services** - Entry point document listing available services
2. **Service Provider Catalog** - Lists service providers (projects/areas)
3. **Service Provider** - Describes capabilities (query, creation, etc.)
4. **Capabilities** - Specific endpoints for operations

```
Server Root
  └── /rootservices
        └── Service Provider Catalog (for CM/RM/QM)
              └── Service Provider (e.g., "Project Area X")
                    ├── Query Capability
                    ├── Creation Factory
                    └── Selection Dialog
```

## OSLC Query

OSLC defines a powerful query syntax for filtering resources:

```
GET /ccm/oslc/workitems?oslc.where=dcterms:type="Defect" and oslc_cm:status="Open"
                       &oslc.select=dcterms:title,dcterms:identifier,oslc_cm:status
                       &oslc.orderBy=+dcterms:modified
```

**Query Parameters:**
- `oslc.where` - Filter expression (similar to SQL WHERE)
- `oslc.select` - Properties to return (like SQL SELECT)
- `oslc.orderBy` - Sort order (`+` ascending, `-` descending)
- `oslc.prefix` - Namespace prefixes for compact notation

## Resource Preview (Compact)

OSLC Compact provides **lightweight resource previews** for embedding in other tools:

```xml
<oslc:Compact>
  <dcterms:title>Defect #12345: Login crashes</dcterms:title>
  <oslc:shortTitle>12345</oslc:shortTitle>
  <oslc:icon>https://server.com/icons/defect.png</oslc:icon>
  <oslc:smallPreview>
    <oslc:Preview>
      <oslc:document>https://server.com/preview/12345/small</oslc:document>
      <oslc:hintHeight>200px</oslc:hintHeight>
      <oslc:hintWidth>400px</oslc:hintWidth>
    </oslc:Preview>
  </oslc:smallPreview>
</oslc:Compact>
```

This enables **hover previews** in other tools without full page loads.

## Benefits of OSLC

### 1. Tool Integration
Connect different tools (requirements, development, testing) without vendor lock-in.

### 2. Traceability
Track relationships between requirements, code changes, and test results.

### 3. Open Standard
Public specifications, no proprietary APIs or licensing.

### 4. Flexibility
Works with any tool that implements the standard.

### 5. RDF Foundation
Powerful graph-based data model supports complex relationships.

## OSLC Specifications

The OSLC standards are maintained by the OASIS OSLC Open Project:

- **OSLC Core** - Foundation specifications (resources, discovery, query)
- **Domain Specifications** - CM, RM, QM, Architecture Management, etc.
- **Supporting Specifications** - Authentication, configuration management, automation

## Learn More

- [OSLC Official Website](https://open-services.net/)
- [OSLC Core 2.0 Specification](https://open-services.net/specifications/core/)
- [OSLC Primer](https://open-services.net/resources/tutorials/)
- [OSLC Workgroup](https://www.oasis-open.org/committees/oslc-op/)

## Next Steps

- [Learn about IBM Jazz & ELM](./02-ibm-jazz-elm.md) - Understand the primary OSLC implementation
- [Why This Client?](./03-why-this-client.md) - Benefits of this TypeScript client
- [Getting Started](./04-getting-started.md) - Start using the client
