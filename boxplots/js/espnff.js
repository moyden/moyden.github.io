'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* global $, d3 */

var baseUrl = 'https://games.espn.com/ffl/api/v2/leagueSettings?leagueId=24903&seasonId=';
var f = d3.format('.1f');

var svg = d3.select('svg');
var margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};
var viewbox = svg.attr('viewBox').split(' ');
var width = +viewbox[2] - margin.left - margin.right;
var height = +viewbox[3] - margin.top - margin.bottom;

var g = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.8).paddingOuter(0.25);

var y = d3.scaleLinear().rangeRound([height, 60]);

drawPlots(2017);

$('#j-season').change(function () {
  drawPlots(this.value);
});

function drawPlots(year) {
  var url = baseUrl + year;
  $.getJSON(url, function (data) {
    var teamsObj = data.leaguesettings.teams;
    var teamsArray = Object.keys(teamsObj).map(function (key) {
      return teamsObj[key];
    });
    var teams = teamsArray.map(function (d) {
      var re = /[A-Z]/;
      if (re.exec(d.teamAbbrev) === null) d.teamAbbrev = 'CPH';
      return {
        name: d.teamLocation + ' ' + d.teamNickname,

        abbrev: d.teamAbbrev,

        id: d.teamId,

        wins: d.scheduleItems.reduce(function (sum, m) {
          var homeId = m.matchups[0].homeTeamId;
          var outcome = m.matchups[0].outcome;
          if (homeId === d.teamId && outcome === 1) return sum + 1;else if (homeId !== d.teamId && outcome === 2) return sum + 1;else return sum;
        }, 0),

        losses: d.scheduleItems.reduce(function (sum, m) {
          var homeId = m.matchups[0].homeTeamId;
          var outcome = m.matchups[0].outcome;
          if (homeId === d.teamId && outcome === 2) return sum + 1;else if (homeId !== d.teamId && outcome === 1) return sum + 1;else return sum;
        }, 0),

        pointsFor: d.scheduleItems.reduce(function (sum, m) {
          if (m.matchups[0].homeTeamId === d.teamId) {
            return sum + m.matchups[0].homeTeamScores.reduce(function (s, x) {
              return s + x;
            });
          } else {
            return sum + m.matchups[0].awayTeamScores.reduce(function (s, x) {
              return s + x;
            });
          }
        }, 0),

        pointsAgainst: d.scheduleItems.reduce(function (sum, m) {
          if (m.matchups[0].homeTeamId === d.teamId) {
            return sum + m.matchups[0].awayTeamScores.reduce(function (s, x) {
              return s + x;
            });
          } else {
            return sum + m.matchups[0].homeTeamScores.reduce(function (s, x) {
              return s + x;
            });
          }
        }, 0),

        scores: function () {
          var scores = [];
          d.scheduleItems.forEach(function (m) {
            if (m.matchups[0].outcome !== 0) {
              if (m.matchups[0].homeTeamId === d.teamId) {
                m.matchups[0].homeTeamScores.forEach(function (x) {
                  return scores.push(x);
                });
              } else {
                m.matchups[0].awayTeamScores.forEach(function (x) {
                  return scores.push(x);
                });
              }
            }
          });
          return scores;
        }()
      };
    });

    teams.forEach(function (team) {
      var sortedScores = [].concat(_toConsumableArray(team.scores)).sort(function (a, b) {
        return a - b;
      });

      if (sortedScores.length > 2) {
        var lowQuartile = d3.quantile(sortedScores, 0.25);
        var median = d3.quantile(sortedScores, 0.5);
        var upQuartile = d3.quantile(sortedScores, 0.75);
        var iqr = upQuartile - lowQuartile;
        var outliers = sortedScores.filter(function (x) {
          return x > upQuartile + iqr || x < lowQuartile - iqr;
        });
        var notOutliers = sortedScores.filter(function (x) {
          return x < upQuartile + iqr && x > lowQuartile - iqr;
        });
        var _min = d3.min(notOutliers);
        var _max = d3.max(notOutliers);
        team.boxStats = {
          min: _min,
          lowQuartile: lowQuartile,
          median: median,
          upQuartile: upQuartile,
          max: _max,
          outliers: outliers
        };
      }
    });

    teams.sort(function (a, b) {
      return b.boxStats.median - a.boxStats.median;
    });
    var min = d3.min(teams, function (team) {
      return d3.min(team.scores);
    });
    var max = d3.max(teams, function (team) {
      return d3.max(team.scores);
    });
    x.domain(teams.map(function (team) {
      return team.id;
    }));
    y.domain([min, max]);

    g.selectAll('g').remove();

    var plots = g.selectAll('g').data(teams).enter().append('g').attr('class', 'boxplot').attr('transform', function (d) {
      return 'translate(' + x(d.id) + ', 0)';
    }).attr('stroke', 'black').attr('stroke-width', 2).attr('fill', 'none');

    plots.append('rect').attr('x', 0).attr('y', function (d) {
      return y(d.boxStats.upQuartile);
    }).attr('width', x.bandwidth()).attr('height', function (d) {
      return y(d.boxStats.lowQuartile) - y(d.boxStats.upQuartile);
    });

    plots.append('line').attr('x1', 0).attr('y1', function (d) {
      return y(d.boxStats.max);
    }).attr('x2', x.bandwidth()).attr('y2', function (d) {
      return y(d.boxStats.max);
    });

    plots.append('line').attr('x1', 0).attr('y1', function (d) {
      return y(d.boxStats.median);
    }).attr('x2', x.bandwidth()).attr('y2', function (d) {
      return y(d.boxStats.median);
    });

    plots.append('line').attr('x1', 0).attr('y1', function (d) {
      return y(d.boxStats.min);
    }).attr('x2', x.bandwidth()).attr('y2', function (d) {
      return y(d.boxStats.min);
    });

    plots.append('line').attr('x1', 0.5 * x.bandwidth()).attr('y1', function (d) {
      return y(d.boxStats.max);
    }).attr('x2', 0.5 * x.bandwidth()).attr('y2', function (d) {
      return y(d.boxStats.upQuartile);
    }).attr('stroke-dasharray', '4, 4');

    plots.append('line').attr('x1', 0.5 * x.bandwidth()).attr('y1', function (d) {
      return y(d.boxStats.min);
    }).attr('x2', 0.5 * x.bandwidth()).attr('y2', function (d) {
      return y(d.boxStats.lowQuartile);
    }).attr('stroke-dasharray', '4, 4');

    plots.selectAll('circle').data(function (d) {
      return d.boxStats.outliers;
    }).enter().append('circle').attr('cx', 0.5 * x.bandwidth()).attr('cy', function (d) {
      return y(d);
    }).attr('r', 4).attr('stroke', '#aaa').attr('stroke-width', 1.5);

    var labels = plots.append('g').attr('stroke', 'none').attr('fill', 'black').attr('transform', 'translate(0, ' + 4 + ')');

    labels.append('text').attr('class', function (d) {
      return d.abbrev.toLowerCase();
    }).attr('x', 0.5 * x.bandwidth()).attr('y', 0).text(function (d) {
      return d.abbrev;
    }).attr('text-anchor', 'middle').style('font-size', '1.4em').style('font-weight', 700);

    labels.append('text').attr('x', -5).attr('y', function (d) {
      return y(d.boxStats.max);
    }).text(function (d) {
      return f(d.boxStats.max);
    }).attr('text-anchor', 'end');

    labels.append('text').attr('x', x.bandwidth() + 5).attr('y', function (d) {
      return y(d.boxStats.upQuartile);
    }).text(function (d) {
      return f(d.boxStats.upQuartile);
    }).attr('text-anchor', 'start');

    labels.append('text').attr('x', -5).attr('y', function (d) {
      return y(d.boxStats.median);
    }).text(function (d) {
      return f(d.boxStats.median);
    }).attr('text-anchor', 'end');

    labels.append('text').attr('x', x.bandwidth() + 5).attr('y', function (d) {
      return y(d.boxStats.lowQuartile);
    }).text(function (d) {
      return f(d.boxStats.lowQuartile);
    }).attr('text-anchor', 'start');

    labels.append('text').attr('x', -5).attr('y', function (d) {
      return y(d.boxStats.min);
    }).text(function (d) {
      return f(d.boxStats.min);
    }).attr('text-anchor', 'end');
  });
}