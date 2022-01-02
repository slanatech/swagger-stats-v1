import { createServer, Server } from 'http';
import * as path from 'path';
import * as WebSocket from 'ws';
const WebSocketServer = WebSocket.Server;
//import { pathOr } from 'ramda';
// @ts-ignore
import * as NodeStatic from 'node-static';
import { SwsOptions } from './swsoptions';
import { SwsProcessor } from './swsprocessor';
import { SwsSpan } from '@swaggerstats/core';
//import { spanTransforms } from '@swaggerstats/core';

import Debug from 'debug';
const debug = Debug('sws:server');

// TODO how to suppress traces on internal swagger-stats API calls ?

// Swagger-stats server - serves metrics, API and UI on designated port
// Supports web sockets for efficient data push to UI
export class SwsServer {
  protected _options: SwsOptions;
  protected _processor: SwsProcessor;
  protected _port: number;
  protected _stopped = true;
  protected _server: Server | null = null;
  protected _wss: any | null = null;
  protected _staticServer: any | null = null;
  protected ws: any | null = null; // TEMP TODO Support many

  constructor(options: SwsOptions, processor: SwsProcessor) {
    this._stopped = true;
    this._options = options;
    this._processor = processor;
    this._port = this._options.port || 8086;
  }

  start(): void {
    // Subscribe to events from processor
    this._processor.on('span', (span) => {
      this.handleSpan(span);
    });
    this._server = createServer((req, res) => {
      this.handleReq(req, res);
    });
    this._wss = new WebSocketServer({ noServer: true });
    // Expect 'ui' folder to be located under build, i.e. /build/ui
    this._staticServer = new NodeStatic.Server(path.join(__dirname, '..', 'ui'));

    this._wss.on('connection', (ws: any) => {
      debug(`Got wss on connection!`);
      ws.send(JSON.stringify({ type: 'connected' }));
      // TEMP TODO Support many
      ws.on('message', (message: any) => {
        this.handleMessage(message);
      });
      this.ws = ws;
    });

    this._server.on('upgrade', (request, socket, head) => {
      if (request && request.url && request.url.startsWith('/sws')) {
        this._wss.handleUpgrade(request, socket, head, (ws: any) => {
          this._wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this._server.keepAliveTimeout = 61 * 1000;
    this._server.headersTimeout = 65 * 1000;
    // bind to all interfaces
    this._server.listen(this._port, '0.0.0.0', () => {
      debug(`swagger-stats server started on port ${this._port}, URI http://localhost:${this._port}`);
    });
  }

  handleSpan(span: SwsSpan) {
    debug(`WS: Got span: ${JSON.stringify(span)}`);
    // TODO TEMP - Refine - send only to clients who started trace
    if (this.ws) {
      this.ws.send(JSON.stringify({ type: 'span', data: span }));
    }
  }

  handleMessage(message: Buffer) {
    /*const type: string | null = pathOr(null, ['type'], message);
    const data: any | null = pathOr(null, ['data'], message);
    if (type !== 'Buffer' || !data) {
      return;
    }*/
    const payload = message.toString();
    debug(`WS: Got message: ${payload}`);
    // +++
  }

  // TODO Reconsider URLS - /swsux or /ux vs /sws for API/ws
  handleReq(req: any, res: any) {
    debug(`Got req: ${req.url}`);
    // Handle API first, then fallback to serving static files if it's not API request
    if (req.url.startsWith('/test')) {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      return res.end(JSON.stringify({ status: 'ok' }));
    }
    // Support vue router history mode - if req starts with /sws, serve index.html
    if (req.url.startsWith('/ux')) {
      req.url = '/index.html';
    }
    req
      .addListener('end', () => {
        this._staticServer.serve(req, res);
      })
      .resume();
  }

  test(): number {
    debug(`Test called`);
    return 1;
  }
}
