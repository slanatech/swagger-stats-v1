/*
 * WebSocket connection to Sws
 **/
import { store } from './store';
import log from './log';
import { pathOr } from 'ramda';

// WebSocket connection to Sws
class WsConnection {
  constructor() {
    this.socket = null;
  }

  init() {
    log.info('WS: Creating connection ...');

    let loc = window.location;
    let wsUri = loc.protocol === 'https:' ? 'wss://' : 'ws://';
    wsUri += loc.host;
    wsUri += '/sws';
    this.socket = new WebSocket(wsUri);

    this.socket.onopen = () => {
      log.info(`WS: connected`);
      /*
      setTimeout(
        function (that) {
          that.requestTest();
        },
        500,
        this
      );*/
    };

    this.socket.onerror = (err) => {
      log.error(`WS: error ${err.message}`);
    };

    this.socket.onmessage = (msg) => {
      log.info(`WS: got message: ${msg.data}`);
      //this.handleEvent(evt);
    };
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
