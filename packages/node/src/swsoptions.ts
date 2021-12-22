/* swagger-stats Options */

import * as os from 'os';
//const debug = require('debug')('sws:settings');

/* swagger=stats settings */
export class SwsOptions {
  // Port for embedded swagger-stats server that serves metrics, API and UI.
  // Must be different than the main port[s] of node service where swagger-stats is used.
  // Using separate port is more secure, allowing, for example, not exposing metrics and UI via LB
  public port: number;

  // Hostname. Will attempt to detect if not explicitly provided
  public hostname: string;

  // Name. Defaults to hostname if not specified
  public name: string;

  // Version
  public version: string;

  // IP Address. Will attempt to detect if not provided
  public ip: string;

  // Swagger specification JSON document. Should be pre-validated and with resolved references. Optional.
  public swaggerSpec: any;

  // Base path for API described in swagger spec.
  // Specify this when using openapi: "3.0.0" specifications
  // For example, setting basePath='/api' with petrstore spec would match requests /api/pet/{id}, etc ...
  public basePath: string;

  // Base path for swagger-stats internal APIs.
  // If specified, will be used to serve UI, stats and metrics like this:
  // /<uriPath>/ui, /<uriPath>/stats, /<uriPath>/metrics
  // overriding default /swagger-stats/ui
  public uriPath: string;

  // Duration of timeline bucket in milliseconds, 60000 by default
  public timelineBucketDuration: number;

  // Buckets for duration histogram metrics, in Milliseconds
  // Optional. Default value:
  // [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  // The default buckets are tailored to broadly measure API response time.
  // Most likely needs to be defined per app to account for application specifics.
  public durationBuckets: number[];

  // Buckets for request size histogram metric, in Bytes.
  // Optional. Default value:
  // [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  // The default buckets are tailored to broadly measure API request size.
  // Most likely needs to be defined per app to account for application specifics.
  public requestSizeBuckets: number[];

  // Buckets for response size histogram metric, in Bytes
  // Optional. Default value:
  // [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  // The default buckets are tailored to broadly measure API response size.
  // Most likely needs to be defined per app to account for application specifics.
  public responseSizeBuckets: number[];

  // Apdex threshold, in milliseconds
  // 25 ms by default
  public apdexThreshold: number;

  // Callback to invoke when response is finished - https://github.com/slanatech/swagger-stats/issues/5
  // Application may implement it to trace Request Response Record (RRR), which is passed as parameter
  // the following parameters are passed to this callback:
  // onResponseFinish(req,res,rrr)
  // - req - request
  // - res - response
  // - rrr - Request Response Record (RRR)
  public onResponseFinish: any | null;

  // Enable Basic authentication: true or false. Default false.
  // Basic & custom authentication are supported
  public authentication: boolean;

  // Enable Your own authentication: a function that takes
  // customAuth(req)
  // - req - request
  // must return true if user authenticated, false if not
  // eg: (req) => { if(req.user.isAdmin) {return true;} else {return false }}
  public customAuth: any | null;

  // Callback to invoke to authenticate request to /swagger-stats/stats and /swagger-stats/metrics
  // If authentication is enabled (option authentication=true),
  // Application must implement onAuthenticate to validate user credentials
  // the following parameters are passed to this callback:
  // onAuthenticate(req,username,password)
  // - req - request
  // - username - username
  // - password - password
  // callback must return true if user authenticated, false if not
  public onAuthenticate: any | null;

  // Max Age of the session, if authentication is enabled, in seconds
  // Default is 900 seconds
  public sessionMaxAge: number;

  // ElasticSearch URL. Enables storing of request response records in Elasticsearch.
  // Default is empty (disabled).
  public elasticsearch: string | null;

  // Prefix for Elasticsearch index. Default is "api-"
  public elasticsearchIndexPrefix: string;

  // Username for Elasticsearch, if anonymous user is disabled . Default is empty (disabled)
  public elasticsearchUsername: string | null;

  // Password for Elasticsearch, if anonymous user is disabled . Default is empty (disabled)
  public elasticsearchPassword: string | null;

  // Elasticsearch key for SSL connection
  public elasticsearchKey: string | null;

  // Elasticsearch certificate for SSL connection
  public elasticsearchCert: string | null;

  // Set to true to track only requests defined in swagger spec. Default false.
  public swaggerOnly: boolean;

  // Prometheus metrics prefix. Will be prepended to metric name if specified.
  public metricsPrefix: string;

  constructor(options: any = {}) {
    this.port = 8086;
    this.hostname = os.hostname();
    this.name = this.hostname;
    this.version = '';
    this.ip = '';
    this.swaggerSpec = null;
    this.basePath = '';
    this.uriPath = '/swagger-stats';
    this.timelineBucketDuration = 60000;
    this.durationBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    this.requestSizeBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    this.responseSizeBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    this.apdexThreshold = 25;
    this.onResponseFinish = null;
    this.authentication = false;
    this.customAuth = null;
    this.onAuthenticate = null;
    this.sessionMaxAge = 900;
    this.elasticsearch = null;
    this.elasticsearchIndexPrefix = 'api-';
    this.elasticsearchUsername = null;
    this.elasticsearchPassword = null;
    this.elasticsearchKey = null;
    this.elasticsearchCert = null;
    this.swaggerOnly = false;
    this.metricsPrefix = '';

    // Enables Egress HTTP monitoring, true or false. Disabled by default.
    // TODO remove
    /*
    this.enableEgress = false;
    this.pathUI = '/swagger-stats/ui';
    this.pathDist = '/swagger-stats/dist';
    this.pathUX = '/swagger-stats/ux';
    this.pathStats = '/swagger-stats/stats';
    this.pathMetrics = '/swagger-stats/metrics';
    this.pathLogout = '/swagger-stats/logout';
    */

    this.set(options);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public set(options: any): void {
    if (typeof options === 'undefined' || !options) {
      return;
    }

    for (const op of Object.keys(this)) {
      if (op in options) {
        // @ts-ignore
        this[op] = options[op];
      }
    }

    // Set or detect node address
    if (!('ip' in options)) {
      // Attempt to detect network address
      // Use first found interface name which starts from "e" ( en0, em0 ... )
      let address = null;
      const networkInterfaces = os.networkInterfaces();
      for (const interfaceName in networkInterfaces) {
        const ifc: any = networkInterfaces[interfaceName];
        if (!address && !ifc.internal && interfaceName.charAt(0) == 'e') {
          if (ifc instanceof Array && ifc.length > 0) {
            address = ifc[0].address;
          }
        }
      }
      this.ip = address ? address : '127.0.0.1';
    }

    /*
    this.pathUI = this.uriPath + '/ui';
    this.pathDist = this.uriPath + '/dist';
    this.pathUX = this.uriPath + '/';
    this.pathStats = this.uriPath + '/stats';
    this.pathMetrics = this.uriPath + '/metrics';
    this.pathLogout = this.uriPath + '/logout';
     */
  }
}
