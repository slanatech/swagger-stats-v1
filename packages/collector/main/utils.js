/**
 * Utilities
 */

const crypto = require('crypto');
const promClient = require('prom-client');

exports.pad = function (n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

exports.getDurationInMs = (startTime) => {
  let diff = process.hrtime(startTime);
  return Math.floor((diff[0] * 1e9 + diff[1]) / 1000000);
};

// Returns prom-client metrics created according to provided specification
/* Specification example:
const SIP_SERVER_METRICS = Object.freeze({
  NCALLS: { name: '{prefix}_calls', help: 'Current number of calls', type: 'gauge', labelNames: ['tenant', 'node', 'host'] },
  . . .
  });
*/
exports.getMetrics = function (prefix, metricsSpecifications) {
  let promClientMetrics = {};
  for (let metricId of Object.keys(metricsSpecifications)) {
    let metricSpec = Object.assign({}, metricsSpecifications[metricId]);
    metricSpec.name = metricSpec.name.replace('{prefix}', prefix);
    switch (metricSpec.type) {
      case 'counter': {
        promClientMetrics[metricId] = new promClient.Counter(metricSpec);
        break;
      }
      case 'gauge': {
        promClientMetrics[metricId] = new promClient.Gauge(metricSpec);
        break;
      }
    }
  }
  return promClientMetrics;
};

exports.pregQuote = function (str, delimiter) {
  // http://kevin.vanzonneveld.net
  // +   original by: booeyOH
  // +   improved by: Ates Goral (http://magnetiq.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: preg_quote("$40");
  // *     returns 1: '\$40'
  // *     example 2: preg_quote("*RRRING* Hello?");
  // *     returns 2: '\*RRRING\* Hello\?'
  // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
  // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
};

const IV_LENGTH = 16; // For AES, this is always 16

// Key must be 32 bytes, if passing guid as a key, strip '-' to make it 32 bytes, i.e.   let keyStr = key.replace(/-/g, '');
exports.encrypt = function (key, text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Key must be 32 bytes, if passing guid as a key, strip '-' to make it 32 bytes, i.e.   let keyStr = key.replace(/-/g, '');
exports.decrypt = function (key, text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

exports.sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
