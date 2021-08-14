import { createServer } from 'http';
import { parse } from 'url';
// @ts-ignore
import { WebSocketServer } from 'ws';
import Debug from 'debug';
const debug = Debug('sws:server');

export class SwsServer {
  protected _stopped = true;
  protected _server = createServer();
  protected _wss = new WebSocketServer({ noServer: true });

  constructor() {
    this._stopped = true;
  }

  start(): void {
    this._server = createServer();

    this._wss.on('connection', (ws: any) => {
      debug(`Got wss on connection!`);
    });

    this._server.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url);

      if (pathname === '/foo') {
        this._wss.handleUpgrade(request, socket, head, (ws: any) => {
          this._wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this._server.listen(8086);
  }

  //handleReq(req, res) {}

  test(): number {
    debug(`Test called`);
    return 1;
  }
}
