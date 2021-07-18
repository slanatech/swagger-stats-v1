/*
 * Date and time processing utilities
 */

const moment = require('moment');
const { pathOr } = require('ramda');

class DateTimeUtils {
  constructor() {
    // When grouping by datetime interval, minimum and maximum number of entries allowed
    this.minAllowedGroupingEntries = 2;
    this.maxAllowedGroupingEntries = 200;

    // Supported grouping intervals
    this.groupingIntervals = [
      { id: '1s', title: '1s', value: 'second', valueSec: 1, divider: 1000 },
      { id: '30s', title: '30s', value: '30s', valueSec: 30, divider: 30 * 1000 },
      { id: '1m', title: '1m', value: 'minute', valueSec: 60, divider: 60 * 1000 },
      { id: '5m', title: '5m', value: '5m', valueSec: 300, divider: 5 * 60 * 1000 },
      { id: '15m', title: '15m', value: '15m', valueSec: 900, divider: 15 * 60 * 1000 },
      { id: '30m', title: '30m', value: '30m', valueSec: 1800, divider: 30 * 60 * 1000 },
      { id: '1h', title: '1h', value: 'hour', valueSec: 3600, divider: 60 * 60 * 1000 },
      { id: '12h', title: '12h', value: '12h', valueSec: 12 * 3600, divider: 12 * 60 * 60 * 1000 },
      { id: 'day', title: 'Day', value: 'day', valueSec: 24 * 3600, divider: 24 * 60 * 60 * 1000 }
    ];
    // Supported grouping intervals index by Id
    this.groupingIntervalsIds = {};
    this.groupingIntervals.map((x, i) => {
      this.groupingIntervalsIds[x.id] = i;
    });

    // Standard time ranges
    this.timeRanges = [
      { key: '10', title: 'Last 5 min', from: 'PT5M', to: 'now' },
      { key: '11', title: 'Last 10 min', from: 'PT10M', to: 'now' },
      { key: '12', title: 'Last 15 min', from: 'PT15M', to: 'now' },
      { key: '13', title: 'Last 30 min', from: 'PT30M', to: 'now' },
      { key: '14', title: 'Last 1 hour', from: 'PT1H', to: 'now' },
      { key: '15', title: 'Last 2 hours', from: 'PT2H', to: 'now' },
      { key: '16', title: 'Last 4 hours', from: 'PT4H', to: 'now' },
      { key: '17', title: 'Last 6 hours', from: 'PT6H', to: 'now' },
      { key: '18', title: 'Last 12 hours', from: 'PT12H', to: 'now' },
      { key: '19', title: 'Last 24 hours', from: 'PT24H', to: 'now' },
      { key: '20', title: 'Last 2 days', from: 'P2D', to: 'now' },
      { key: '21', title: 'Last 3 days', from: 'P3D', to: 'now' },
      { key: '22', title: 'Last 4 days', from: 'P4D', to: 'now' },
      { key: '23', title: 'Last 5 days', from: 'P5D', to: 'now' },
      { key: '24', title: 'Last 6 days', from: 'P6D', to: 'now' },
      { key: '25', title: 'Last 7 days', from: 'P7D', to: 'now' },
      { key: '26', title: 'Last 10 days', from: 'P10D', to: 'now' },
      { key: '27', title: 'Last 14 days', from: 'P14D', to: 'now' },
      { key: '28', title: 'Last 30 days', from: 'P30D', to: 'now' },
      { key: '31', title: 'This hour', from: 'hour', to: 'now' },
      { key: '32', title: 'Today', from: 'day', to: 'now' },
      { key: '33', title: 'This Week', from: 'week', to: 'now' },
      { key: '34', title: 'This Month', from: 'month', to: 'now' }
    ];
  }

  getTimeRangeTitle({ from, to }) {
    for (let tr of this.timeRanges) {
      if (tr.from === from && tr.to === to) {
        return tr.title;
      }
    }
    // TODO if from starts from P, try to process as interval - ?
    // TODO Otherwise, print from and to as dates
    return 'TODO - Print dates';
  }

  // Get from, to and duration in milliseconds based from and to string values
  // Takes into account ISO_8601 time intervals
  // TODO Option to cast timestamps to the nearest minute, 30 sec, 15 sec, 10 sec
  // So that timestamps / steps will match when merging results
  getTimeIntervalInfo(fromValue, toValue) {
    // Get and parse from and to
    // using ISO_8601 time intervals
    // https://en.wikipedia.org/wiki/ISO_8601#Time_intervals

    let from = null;
    let to = null;

    let currentTimeMs = Date.now();
    to = currentTimeMs; // Current time by default
    let toStr = toValue;

    let tdms = 0;
    if (toStr !== 'now') {
      if (isNaN(toStr)) {
        // Attempt to process as ISO_8601 time interval
        let dt = moment.duration(toStr);
        if (dt.isValid()) {
          tdms = dt.asMilliseconds();
        }
        to = currentTimeMs - tdms;
      } else {
        let parsedTo = parseInt(toStr);
        to = Number.isNaN(parsedTo) ? currentTimeMs : parsedTo;
      }
    }

    let fromStr = fromValue;
    let dms = 5 * 60 * 1000;
    if (isNaN(fromStr)) {
      // Attempt to process as ISO_8601 time interval
      let d = moment.duration(fromStr);
      if (d.isValid()) {
        dms = d.asMilliseconds();
      }
      from = to - dms;
    } else {
      let parsedFrom = parseInt(fromStr);
      from = Number.isNaN(parsedFrom) ? to - dms : parsedFrom;
    }

    let duration = to - from;
    return { tiFrom: from, tiTo: to, tiDuration: duration };
  }

  // Get grouping interval based on time interval duration in miliiseconds
  /*
  getDateTimeGroupingInterval(duration) {
    let dsec = duration / 1000;
    if (dsec <= 15 * 60) {
      return 'second';
    } // Up to 5 min
    if (dsec <= 24 * 60 * 60) {
      return 'minute';
    } // Up to 1 hour
    if (dsec <= 7 * 24 * 60 * 60) {
      return 'hour';
    } // Up to 24 hour
    // TODO more
    return 'day';
  }*/

  // maxEntries (optional) allows to force interval to be of specific resolution
  // I.e. for sparklines, we would want lower resolution vs discover
  getDateTimeGroupingInterval(duration, maxEntries) {
    let max = maxEntries || this.maxAllowedGroupingEntries;
    let lastCandidate = null;
    for (let candidateInterval of this.groupingIntervals) {
      lastCandidate = candidateInterval;
      let numEntries = duration / candidateInterval.divider;
      if (numEntries >= this.minAllowedGroupingEntries && numEntries < max) {
        return candidateInterval;
      }
    }
    return lastCandidate; // The closest one
  }

  // Get grouping interval in seconds, based on time interval duration in miliiseconds
  getDateTimeGroupingIntervalSec(duration, maxEntries) {
    let gi = this.getDateTimeGroupingInterval(duration, maxEntries);
    return gi.valueSec;
  }

  getDateTimeGroupingIntervalById(id) {
    //  3: '5m by' default
    let idx = pathOr(3, [id], this.groupingIntervalsIds);
    return this.groupingIntervals[idx];
  }

  // TODO Consider removing
  validateGroupingInterval(fromValue, toValue, groupingInterval) {
    if (groupingInterval === 'auto') {
      // Auto is always good
      return groupingInterval;
    }
    let { tiDuration } = this.getTimeIntervalInfo(fromValue, toValue);
    // Check suggested interval, and switch to Auto if it's not acceptable
    for (let candidateInterval of this.groupingIntervals) {
      if (candidateInterval.value === groupingInterval) {
        let numEntries = tiDuration / candidateInterval.divider;
        if (numEntries >= this.minAllowedGroupingEntries && numEntries < this.maxAllowedGroupingEntries) {
          return groupingInterval; // OK
        }
      }
    }
    return 'auto'; // default
  }

  filterGroupingIntervals(fromValue, toValue) {
    let { tiDuration } = this.getTimeIntervalInfo(fromValue, toValue);
    // Check all intervals, and return only ones >= min and < max
    let filteredIntervals = [];
    for (let candidateInterval of this.groupingIntervals) {
      if (candidateInterval.value === 'auto') {
        filteredIntervals.push(candidateInterval);
      } else {
        let numEntries = tiDuration / candidateInterval.divider;
        if (numEntries >= this.minAllowedGroupingEntries && numEntries < this.maxAllowedGroupingEntries) {
          filteredIntervals.push(candidateInterval);
        }
      }
    }
    return filteredIntervals;
  }
}

const dateTimeUtils = new DateTimeUtils();
module.exports = dateTimeUtils;
