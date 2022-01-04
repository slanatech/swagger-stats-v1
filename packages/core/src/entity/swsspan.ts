/*
 * Internal representation of Span
 */

export class SwsSpan {
  public valid: boolean;
  public traceId: string | null;
  public spanId: string | null;
  public parentSpanId: string | null;
  public hasChild: boolean; // will be set to true upon trace completion if this span has child span(s)
  public depth: number | null;
  public name: string | null;
  public kind: string | null;
  public category: string | null;
  public service: string | null;
  public status: any | null;
  public success: boolean;
  public startTime: number | null;
  public endTime: number | null;
  public duration: number | null;
  public attributes: any;
  public resourceAttributes: any;
  public instrumentationLibrary: string | null;

  constructor() {
    this.valid = false;
    this.traceId = null;
    this.spanId = null;
    this.parentSpanId = null;
    this.hasChild = false; // will be set to true upon trace completion if this span has child span(s)
    this.depth = null;
    this.name = null;
    this.kind = 'internal'; // default
    this.category = null;
    this.service = null;
    // status
    this.status = null;
    this.success = false; // true or false
    // timing
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
    // attributes
    this.attributes = {};
    this.resourceAttributes = {};
    this.instrumentationLibrary = null;
  }
}
