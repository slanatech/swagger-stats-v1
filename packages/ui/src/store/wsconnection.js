/*
 * WebSocket connection to Sws
 **/
import { store } from './store';
import log from './log';
import { pathOr } from 'ramda';
import io from 'socket.io-client';

// WebSocket connection to Sws
class WsConnection {
  constructor() {
    this.socket = null;
  }

  init() {
    log.info('WS: Creating connection ...');
    this.socket = io({
      transportOptions: {
        polling: {
          extraHeaders: {},
        },
      },
      path: '/sws',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      log.info(`WS: connected, socket ${this.socket.id}`);
      setTimeout(
        function (that) {
          that.requestTest();
        },
        500,
        this
      );
    });

    this.socket.on('connect_error', (err) => {
      log.error(`WS: error when trying to connect: ${err.message}`);
    });

    this.socket.on('event', (evt) => {
      this.handleEvent(evt);
    });
  }

  handleEvent(evt) {
    // Save to debug
    let type = pathOr('no-type', ['type'], evt);
    let text = pathOr('', ['message', 'text'], evt.payload);
    log.info(`WS: event ${type} ${text}`);

    switch (pathOr(null, ['type'], evt)) {
      case 'test': {
        store.dispatch('module/onTest', {
          data: pathOr(null, ['payload'], evt),
        });
        break;
      }
      case 'message': {
        this.handleMessageEvent(evt);
        break;
      }
    }
  }

  requestTest() {
    if (!this.socket) return;
    this.socket.emit('request', {
      type: 'testRequest',
    });
  }

  async handleMessageEvent(event) {
    let message = pathOr(null, ['payload', 'message'], event);
    if (!message) {
      return;
    }
    // TODO
  }
}

let wsConnection = new WsConnection();
export default wsConnection;
