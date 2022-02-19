/* Generalized REST API Operation
   Extends OpResult, so all OpResult facilities can be used
 */

// TODO To use in frontend - keep require ? change to import ? Remove logging ?
import axios from 'axios';
import { OpResult } from './opresult';
import { pathOr } from 'ramda';

// TODO How to do logging for both backend and frontend ?

export class RestOp extends OpResult {
  public options: any;
  public code: number;
  public complete: boolean;
  public duration: number;

  constructor(options = {}) {
    super(false, '', null);
    this.options = options;
    this.code = 0;
    this.complete = false;
    this.duration = 0;
  }

  execute(): Promise<RestOp> {
    return new Promise((resolve) => {
      const startTs = Date.now();
      axios(this.options)
        .then((response) => {
          this.success = true;
          this.code = pathOr(0, ['status'], response);
          this.data = pathOr(null, ['data'], response);
          this.message = '';
          //logger.debug(`${this.options.method.toUpperCase()} ${this.options.url} ${this.code}`);
        })
        .catch((error) => {
          this.success = false;
          this.code = pathOr(-1, ['response', 'status'], error);
          this.message = pathOr(error.message, ['response', 'statusText'], error);
          this.data = pathOr(null, ['response', 'data'], error);
          //logger.error(`${this.options.method.toUpperCase()} ${this.options.url} ${this.code} "${this.message}"`);
        })
        .finally(() => {
          this.complete = true;
          this.duration = Date.now() - startTs;
          resolve(this);
        });
    });
  }

  isComplete() {
    return this.complete;
  }
}
