import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { sym } from "rdflib";
import * as $rdf from "rdflib";
import type { IndexedFormula } from "rdflib";
import type { NamedNode } from "rdflib/lib/tf-types";
import type { Document } from "@xmldom/xmldom";
import { rdfs, oslc, oslc_cm1, oslc_rm, oslc_qm1 } from "./namespaces.js";
import OSLCResource from "./OSLCResource.js";
import Compact from "./Compact.js";
import RootServices from "./RootServices.js";
import ServiceProviderCatalog from "./ServiceProviderCatalog.js";
import ServiceProvider from "./ServiceProvider.js";
import type { QueryParams } from "./types.js";

// Conditional imports for Node.js only
let wrapper: any;
let CookieJar: any;
let DOMParser: any;
const isNodeEnvironment = typeof (globalThis as any).window === "undefined";

if (isNodeEnvironment) {
  // Node.js imports
  const cookiejarSupport = await import("axios-cookiejar-support");
  wrapper = cookiejarSupport.wrapper;
  const toughCookie = await import("tough-cookie");
  CookieJar = toughCookie.CookieJar;
  const xmldom = await import("@xmldom/xmldom");
  DOMParser = xmldom.DOMParser;
} else {
  // Browser: use native DOMParser
  DOMParser = (globalThis as any).window.DOMParser;
}

// Service providers properties
const serviceProviders: Record<string, NamedNode> = {
  CM: oslc_cm1("cmServiceProviders"),
  RM: oslc_rm("rmServiceProviders"),
  QM: oslc_qm1("qmServiceProviders"),
};

/**
 * An OSLCClient provides a simple interface to access OSLC resources
 * and perform operations like querying, creating, and updating resources.
 * It handles authentication, service provider discovery, and resource management.
 */
export default class OSLCClient {
  private userid: string;
  private password: string;
  private configuration_context: string | null;
  private rootservices: RootServices | null = null;
  private spc: ServiceProviderCatalog | null = null;
  private sp: ServiceProvider | null = null;
  private ownerMap: Map<string, string> = new Map();
  private isNodeEnvironment: boolean;
  private jar?: any;
  private client: AxiosInstance;
  private base_url?: string;

  constructor(
    user: string,
    password: string,
    configuration_context: string | null = null,
  ) {
    this.userid = user;
    this.password = password;
    this.configuration_context = configuration_context;
    this.isNodeEnvironment = isNodeEnvironment;

    if (isNodeEnvironment) {
      this.jar = new CookieJar();
    }

    // Create a base configuration
    const baseConfig: any = {
      timeout: 30000,
      headers: {
        Accept:
          "application/rdf+xml, text/turtle;q=0.9, application/ld+json;q=0.8, application/json;q=0.7, application/xml;q=0.6, text/xml;q=0.5, */*;q=0.1",
        "OSLC-Core-Version": "2.0",
      },
      validateStatus: (status: number) => status === 401 || status < 400, // Accept all 2xx responses
    };

    // Configure for Node.js or Browser
    if (isNodeEnvironment) {
      // Node.js: use a cookie jar and keep-alive
      baseConfig.keepAlive = true;
      baseConfig.jar = this.jar;
      this.client = wrapper(axios.create(baseConfig));
    } else {
      // Browser: use withCredentials for automatic cookie handling
      baseConfig.withCredentials = true;
      this.client = axios.create(baseConfig);
    }

    // Add the Configuration-Context header if one is given
    if (configuration_context) {
      this.client.defaults.headers.common["Configuration-Context"] =
        configuration_context;
    }

    // Response interceptor for handling auth challenges
    this.client.interceptors.response.use(async (response: AxiosResponse) => {
      const originalRequest = response.config as InternalAxiosRequestConfig;
      const wwwAuthenticate = response?.headers?.["www-authenticate"];

      // Check if this is a JEE Forms authentication challenge
      if (
        response?.headers["x-com-ibm-team-repository-web-auth-msg"] ===
        "authrequired"
      ) {
        try {
          // Perform the login (JEE form auth typically uses j_username and j_password)
          const url = new URL(response.config.url!);
          const paths = url.pathname.split("/");
          url.pathname = paths[1]
            ? `/${paths[1]}/j_security_check`
            : "/j_security_check";

          // In browser, form-based auth may require a backend proxy due to CORS
          if (!isNodeEnvironment) {
            console.warn(
              "Form-based authentication in browser requires CORS-enabled backend or proxy",
            );
          }

          response = await this.client.post(
            url.toString(),
            new URLSearchParams({
              j_username: this.userid,
              j_password: this.password,
            }).toString(),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              maxRedirects: 0,
              validateStatus: (status: number) => status === 302, // for successful login
            },
          );
          // After successful login, retry the original request with updated cookies
          response = await this.client.request(originalRequest);
          return response;
        } catch (error: any) {
          console.error("Error during JEE authentication:", error.message);
          return Promise.reject(error);
        }
      } else if (
        response.status === 401 &&
        wwwAuthenticate?.includes("jauth realm")
      ) {
        const token_uri = wwwAuthenticate.match(/token_uri="([^"]+)"/)?.[1];
        if (!token_uri) {
          return Promise.reject(
            new Error("No token_uri found in jauth challenge"),
          );
        }
        try {
          // Refresh the token using the provided token_uri
          const tokenResponse = await this.client.post(
            token_uri,
            new URLSearchParams({
              username: this.userid,
              password: this.password,
            }).toString(),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "text/plain",
              },
            },
          );
          // retry the original request with the new token
          const newToken = tokenResponse.data; // Refresh token
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return await this.client.request(originalRequest); // Retry the request
        } catch (error: any) {
          console.error(
            "Error during jauth realm authentication:",
            error.message,
          );
          return Promise.reject(error);
        }
      } else if (response.status === 401) {
        // Retry with basic authentication for e.g., Jazz Authorization Server
        (originalRequest as any).auth = {
          username: this.userid,
          password: this.password,
        };
        return await this.client.request(originalRequest);
      } else {
        // No authentication challenge, proceed with the response
        return response;
      }
    });
  }

  /**
   * Set the OSLCClient to use a given service provider of the given domain
   *
   * @param {string} server_url - The base server URL
   * @param {string} serviceProviderName - The name of the service provider
   * @param {string} domain - The OSLC domain (CM, RM, or QM)
   */
  async use(
    server_url: string,
    serviceProviderName: string,
    domain: string = "CM",
  ): Promise<void> {
    this.base_url = server_url?.endsWith("/")
      ? server_url.slice(0, -1)
      : server_url;

    // Read the server's rootservices document
    let resource: OSLCResource;
    // Fetch the rootservices document, this is an unprotected resource
    try {
      resource = await this.getResource(`${this.base_url}/rootservices`) as OSLCResource;
      this.rootservices = new RootServices(
        resource.getURI(),
        resource.store,
        resource.etag,
      );
    } catch (error) {
      console.error("Error fetching rootservices:", error);
      throw new Error("Failed to fetch rootservices document");
    }

    // Get ServiceProviderCatalog URL from the rootservices resource
    const spcURL = this.rootservices.serviceProviderCatalog(
      serviceProviders[domain],
    );
    if (!spcURL) {
      throw new Error(`No ServiceProviderCatalog for ${domain} services`);
    }
    try {
      resource = await this.getResource(spcURL) as OSLCResource;
      this.spc = new ServiceProviderCatalog(
        resource.getURI(),
        resource.store,
        resource.etag,
      );
    } catch (error) {
      console.error("Error fetching ServiceProviderCatalog:", error);
      throw error;
    }

    // Lookup the serviceProviderName in the ServiceProviderCatalog
    const spURL = this.spc.serviceProvider(serviceProviderName);
    if (!spURL) {
      throw new Error(`${serviceProviderName} not found in service catalog`);
    }
    resource = await this.getResource(spURL) as OSLCResource;
    this.sp = new ServiceProvider(
      resource.getURI(),
      resource.store,
      resource.etag,
    );
  }

  /**
   * Get an OSLC resource from a URL
   *
   * @param {string} url - The URL of the resource
   * @param {string} oslc_version - OSLC version to use, defaults to 2.0
   * @param {string} accept - The Accept header value, defaults to 'application/rdf+xml'
   * @returns an OSLCResource object containing the resource data or XML/feed
   */
  async getResource(
    url: string,
    oslc_version: string = "2.0",
    accept: string = "application/rdf+xml",
  ): Promise<
    | OSLCResource
    | { etag?: string; xml: Document }
    | { etag?: string; feed: any }
  > {
    const headers = {
      Accept: accept,
      "OSLC-Core-Version": oslc_version,
    };

    let response: AxiosResponse;
    try {
      response = await this.client.get(url, { headers });
    } catch (error) {
      console.error("Error fetching resource:", error);
      throw error;
    }
    const etag = response.headers.etag;
    const contentType = response.headers["content-type"];

    // This only handles the headers that are used in the OSLC spec
    if (
      contentType.includes("text/xml") ||
      contentType.includes("application/xml")
    ) {
      return { etag, xml: new DOMParser().parseFromString(response.data) };
    } else if (contentType.includes("application/atom+xml")) {
      return { etag, feed: response.data };
    } else {
      // assume the content-type is some RDF representation
      // Create a new graph for this resource
      const graph = $rdf.graph();
      try {
        $rdf.parse(response.data, graph, url, contentType);
      } catch (err) {
        console.error(err);
      }
      return new OSLCResource(url, graph, etag);
    }
  }

  /**
   * Get an OSLC Compact resource
   *
   * @param {string} url - The URL of the resource
   * @param {string} oslc_version - OSLC version to use, defaults to 2.0
   * @param {string} accept - The Accept header value, defaults to 'application/x-oslc-compact+xml'
   * @returns a Compact object containing the resource data
   */
  async getCompactResource(
    url: string,
    oslc_version: string = "2.0",
    accept: string = "application/x-oslc-compact+xml",
  ): Promise<Compact> {
    const headers = {
      Accept: accept,
      "OSLC-Core-Version": oslc_version,
    };

    let response: AxiosResponse;
    try {
      response = await this.client.get(url, { headers });
    } catch (error) {
      console.error("Error fetching Compact resource:", error);
      throw error;
    }
    const etag = response.headers.etag;

    // Create a new graph for this resource
    const graph = $rdf.graph();
    // contentType is application/x-oslc-compact+xml, but that is RDF/XML specific to OSLC Compact
    $rdf.parse(response.data, graph, url, "application/rdf+xml");
    return new Compact(url, graph);
  }

  /**
   * Update an existing OSLC resource
   *
   * @param {OSLCResource} resource - The resource to update
   * @param {string} eTag - Optional ETag for optimistic concurrency control
   * @param {string} oslc_version - OSLC version to use, defaults to 2.0
   * @returns the updated resource
   */
  async putResource(
    resource: OSLCResource,
    eTag: string | null = null,
    oslc_version: string = "2.0",
  ): Promise<OSLCResource> {
    const graph = resource.store;
    if (!graph) {
      throw new Error("Resource has no data to update");
    }
    const url = resource.getURI();
    const headers: Record<string, string> = {
      "OSLC-Core-Version": oslc_version,
      "Content-Type": "application/rdf+xml; charset=utf-8",
      Accept: "application/rdf+xml",
    };
    if (eTag) {
      headers["If-Match"] = eTag;
    }
    const body = graph.serialize(null, "application/rdf+xml", undefined);
    const response = await this.client.put(url, body, { headers });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to update resource ${url}. Status: ${response.status}\n${response.data}`,
      );
    }
    return resource;
  }

  /**
   * Create a new OSLC resource
   *
   * @param {string|NamedNode} resourceType - The OSLC resource type
   * @param {OSLCResource} resource - The resource to create
   * @param {string} oslc_version - OSLC version to use, defaults to 2.0
   * @returns the created resource with its new URI
   */
  async createResource(
    resourceType: string | NamedNode,
    resource: OSLCResource,
    oslc_version: string = "2.0",
  ): Promise<OSLCResource> {
    const graph = resource.store;
    if (!graph) {
      throw new Error("Resource has no data to create");
    }
    if (!this.sp) {
      throw new Error("ServiceProvider not initialized. Call use() first.");
    }
    const creationFactory = this.sp.getCreationFactory(resourceType);
    if (!creationFactory) {
      throw new Error(`No creation factory found for ${resourceType}`);
    }
    const headers = {
      "Content-Type": "application/rdf+xml; charset=utf-8",
      Accept: "application/rdf+xml; charset=utf-8",
      "OSLC-Core-Version": oslc_version,
    };

    const body = graph.serialize(null, "application/rdf+xml", undefined);
    let response: AxiosResponse;
    try {
      response = await this.client.post(creationFactory, body, { headers });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          `Failed to create resource. Status: ${response.status}\n${response.data}`,
        );
      }
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
    const location = response.headers.location;
    const createdResource = await this.getResource(location);
    return createdResource as OSLCResource;
  }

  /**
   * Delete an OSLC resource
   *
   * @param {OSLCResource} resource - The resource to delete
   * @param {string} oslc_version - OSLC version to use, defaults to 2.0
   */
  async deleteResource(
    resource: OSLCResource,
    oslc_version: string = "2.0",
  ): Promise<void> {
    const graph = resource.store;
    if (!graph) {
      throw new Error("Resource has no data to delete");
    }
    const url = resource.getURI();
    const headers: Record<string, string> = {
      Accept: "application/rdf+xml; charset=utf-8",
      "OSLC-Core-Version": oslc_version,
      "X-Jazz-CSRF-Prevent": "1",
    };

    // In Node.js, try to get JSESSIONID from cookie jar
    if (isNodeEnvironment && this.jar) {
      try {
        const cookies = this.jar.getCookiesSync(url);
        const sessionCookie = cookies.find(
          (cookie: any) => cookie.key === "JSESSIONID",
        );
        if (sessionCookie) {
          headers["X-Jazz-CSRF-Prevent"] = sessionCookie.value;
        }
      } catch (error: any) {
        // If cookie retrieval fails, continue with default value
        console.debug(
          "Could not retrieve JSESSIONID from cookie jar:",
          error.message,
        );
      }
    }

    try {
      const response = await this.client.delete(url, { headers });
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(
          `Failed to delete resource. Status: ${response.status}\n${response.data}`,
        );
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }

  /**
   * Query for OSLC resources and return them as OSLCResource objects
   *
   * @param {string|NamedNode} resourceType - The OSLC resource type to query
   * @param {QueryParams} query - The OSLC query parameters
   * @returns an array of OSLCResource objects
   */
  async queryResources(
    resourceType: string | NamedNode,
    query: QueryParams,
  ): Promise<OSLCResource[]> {
    const kb = await this.query(resourceType, query);
    // create an OSLCResource for each result member
    // TODO: getting the members must use the discovered member predicate, rdfs:member is the default
    const resources: OSLCResource[] = [];
    const members = kb.statementsMatching(null, rdfs("member"), null);
    for (const member of members) {
      const memberStatements = kb.statementsMatching(
        member.object as any,
        undefined,
        undefined,
      );
      const memberKb = $rdf.graph();
      memberKb.add(memberStatements);
      resources.push(new OSLCResource(member.object.value, memberKb));
    }
    return resources;
  }

  /**
   * Query for OSLC resources and return the RDF graph
   *
   * @param {string|NamedNode} resourceType - The OSLC resource type to query
   * @param {QueryParams} query - The OSLC query parameters
   * @returns an RDF IndexedFormula containing all query results
   */
  async query(
    resourceType: string | NamedNode,
    query: QueryParams,
  ): Promise<IndexedFormula> {
    if (!this.sp) {
      throw new Error("ServiceProvider not initialized. Call use() first.");
    }
    const queryBase = this.sp.getQueryBase(resourceType);
    if (!queryBase) {
      throw new Error(`No query capability found for ${resourceType}`);
    }
    return this.queryWithBase(queryBase, query);
  }

  /**
   * Query using a specific query base URL
   *
   * @param {string} queryBase - The query base URL
   * @param {QueryParams} query - The OSLC query parameters
   * @returns an RDF IndexedFormula containing all query results
   */
  async queryWithBase(
    queryBase: string,
    query: QueryParams,
  ): Promise<IndexedFormula> {
    const headers = {
      "OSLC-Core-Version": "2.0",
      Accept: "application/rdf+xml",
      "X-Jazz-CSRF-Prevent": "1",
    };

    const params = new URLSearchParams();
    if (query?.prefix) params.append("oslc.prefix", query.prefix);
    if (query?.select) params.append("oslc.select", query.select);
    if (query?.where) params.append("oslc.where", query.where);
    if (query?.orderBy) params.append("oslc.orderBy", query.orderBy);
    params.append("oslc.paging", "false");

    let url = `${queryBase}?${params.toString()}`;
    let response = await this.client.get(url, { headers });
    if (response.status !== 200) {
      throw new Error(
        `Failed to query resource. Status: ${response.status}\n${response.data}`,
      );
    }
    const contentType = response.headers["content-type"];
    const store = $rdf.graph();
    try {
      $rdf.parse(response.data, store, url, contentType);
    } catch (err) {
      console.error(err);
    }
    let nextPage = store.any(sym(queryBase), oslc("nextPage"), null)?.value;
    while (nextPage) {
      response = await this.client.get(nextPage, { headers });
      try {
        $rdf.parse(response.data, store, url, contentType);
      } catch (err) {
        console.error(err);
      }
      nextPage = store.any(sym(nextPage), oslc("nextPage"), null)?.value;
    }

    return store;
  }

  /**
   * Get the owner name for a resource URL (with caching)
   *
   * @param {string} url - The URL of the owner resource
   * @returns the owner's name
   */
  async getOwner(url: string): Promise<string> {
    if (this.ownerMap.has(url)) {
      return this.ownerMap.get(url)!;
    }

    const headers = { Accept: "application/rdf+xml" };
    const response = await this.client.get(url, { headers });

    if (response.status !== 200) {
      return "Unknown";
    }
    const contentLocation = response.headers["content-location"] || url;
    const contentType = response.headers["content-type"];
    const store = $rdf.graph();
    try {
      $rdf.parse(response.data, store, url, contentType);
    } catch (err) {
      console.error(err);
    }
    const name = store.any(
      sym(contentLocation),
      sym("http://xmlns.com/foaf/0.1/name"),
      null,
    )?.value;

    if (name) {
      this.ownerMap.set(url, name);
      return name;
    }
    return "Unknown";
  }

  /**
   * Get the query base URL for a resource type
   *
   * @param {string} resourceType - The resource type
   * @returns the query base URL
   */
  async getQueryBase(resourceType: string): Promise<string> {
    if (!this.sp) {
      throw new Error("ServiceProvider not initialized. Call use() first.");
    }
    const query = `
            PREFIX oslc: <${oslc('').value}>
            SELECT ?qb WHERE {
                ?sp oslc:service ?s .
                ?s oslc:queryCapability ?qc .
                ?qc oslc:resourceType <${resourceType}> .
                ?qc oslc:queryBase ?qb .
            }`;

    const results = (this.sp.store as any).querySync(query);
    if (!results?.length) {
      throw new Error(`No query capability found for ${resourceType}`);
    }
    return (results[0] as any).qb.value;
  }

  /**
   * Get the creation factory URL for a resource type
   *
   * @param {string} resourceType - The resource type
   * @returns the creation factory URL
   */
  async getCreationFactory(resourceType: string): Promise<string> {
    if (!this.sp) {
      throw new Error("ServiceProvider not initialized. Call use() first.");
    }
    const query = `
            PREFIX oslc: <${oslc('').value}>
            SELECT ?cfurl WHERE {
                ?sp oslc:service ?s .
                ?s oslc:creationFactory ?cf .
                ?cf oslc:usage <${resourceType}> .
                ?cf oslc:creation ?cfurl .
            }`;

    const results = await (this.sp.store as any).sparqlQuery(query);
    if (!results?.length) {
      throw new Error(`No creation factory found for ${resourceType}`);
    }
    return (results[0] as any).cfurl.value;
  }
}
