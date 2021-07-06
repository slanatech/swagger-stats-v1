/* Storage for all stats retrieved via api */
import { pathOr } from 'ramda';

class StatsContainer {
  constructor() {}

  updateStats(stats) {
    for (let key of Object.keys(stats)) {
      // Store whatever we loaded
      this[key] = stats[key];
    }
  }

  getApiStatsArray() {
    let res = [];
    let apiStats = pathOr(null, ['apistats'], this);
    let apiDefs = pathOr(null, ['apidefs'], this);
    if (!apiStats) {
      return res;
    }
    for (let apiPath of Object.keys(apiStats)) {
      let apiMethods = apiStats[apiPath];
      for (let apiMethod of Object.keys(apiMethods)) {
        res.push(
          Object.assign(
            {
              path: apiPath,
              method: apiMethod
            },
            apiMethods[apiMethod],
            {
              tags: pathOr([], [apiPath, apiMethod, 'tags'], apiDefs).join(',')
            }
          )
        );
      }
    }
    return res;
  }

  getMethodStatsArray() {
    let res = [];
    let allMethodStats = pathOr(null, ['method'], this);
    if (!allMethodStats) {
      return res;
    }
    for (let methodName of Object.keys(allMethodStats)) {
      res.push(
        Object.assign(
          {
            method: methodName
          },
          allMethodStats[methodName]
        )
      );
    }
    return res;
  }

  getCurrentTimelineBucket() {
    let timelineSettings = pathOr(null, ['timeline', 'settings'], this);
    let timelineData = pathOr(null, ['timeline', 'data'], this);
    if (timelineData && timelineSettings) {
      return timelineData[timelineSettings.bucket_current];
    }
    return {};
  }

  // Returns timeline sorted by timestampts asc
  // TODO add API to return timeline in array already sorted
  getSortedTimeline() {
    let timelineSorted = [];
    let timelineSettings = pathOr(null, ['timeline', 'settings'], this);
    let timelineData = pathOr(null, ['timeline', 'data'], this);
    if (timelineData && timelineSettings) {
      for (let key of Object.keys(timelineData)) {
        let entry = timelineData[key];
        entry.tc = parseInt(key);
        entry.ts = entry.tc * (timelineSettings.bucket_duration || 60000);
        timelineSorted.push(entry);
      }
    }
    // Sort it by timecode ascending
    timelineSorted.sort(function(a, b) {
      return a.tc - b.tc;
    });
    return timelineSorted;
  }
}
let statsContainer = new StatsContainer();
export default statsContainer;
