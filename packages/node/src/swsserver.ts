import { createServer, Server } from 'http';
import { parse } from 'url';
import * as WebSocket from 'ws';
const WebSocketServer = WebSocket.Server;
// @ts-ignore
import * as NodeStatic from 'node-static';
import Debug from 'debug';
const debug = Debug('sws:server');

export class SwsServer {
  protected _stopped = true;
  protected _server: Server | null = null;
  protected _wss: any | null = null;
  protected _staticServer: any | null = null;

  constructor() {
    this._stopped = true;
  }

  start(): void {
    this._server = createServer((req, res) => {
      this.handleReq(req, res);
    });
    this._wss = new WebSocketServer({ noServer: true });
    this._staticServer = new NodeStatic.Server('./public');

    this._wss.on('connection', (ws: any) => {
      debug(`Got wss on connection!`);
    });

    this._server.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url);
      if (pathname === '/sws') {
        this._wss.handleUpgrade(request, socket, head, (ws: any) => {
          this._wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this._server.listen(8086);
  }

  handleReq(req: any, res: any) {
    debug(`Got req`);
    //res.setHeader('Content-Type', 'application/json;charset=utf-8');
    //return res.end(JSON.stringify({ status: 'ok' }));
    // TODO Handle API first, then fallback to serving static files if it's not API request
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
