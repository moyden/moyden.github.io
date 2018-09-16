'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* global d3, Vue */

var urlParams = new URLSearchParams(window.location.search);

var leagueId = urlParams.has('leagueId') ? urlParams.get('leagueId') : 24903;
var baseurl = 'https://games.espn.com/ffl/api/v2/';
var progameStatuses = { '1': 'unplayed', '2': 'inProgress', '3': 'finished' };
var oneDP = d3.format('.1f');
var percent = d3.format('.0%');

var vm = new Vue({
  el: '.j-vm',

  data: {
    matchups: [],
    timer: null
  },

  mounted: function mounted() {
    this.initData();
    this.timer = setInterval(this.fetchData, 30 * 1000);
  },

  methods: {
    initData: function initData() {
      var _this = this;

      var self = this;

      var url = baseurl + 'scoreboard?leagueId=' + leagueId;
      var scoreboard = d3.json(url);

      var homeTeamIds = scoreboard.then(function (data) {
        return data.scoreboard.matchups.map(function (matchup) {
          return {
            homeTeamId: matchup.teams[0].team.teamId,
            expanded: false,
            data: []
          };
        });
      });

      homeTeamIds.then(function (data) {
        self.matchups = data;
        _this.fetchData();
      });
    },

    fetchData: function fetchData() {
      console.log('updated');
      var self = this;

      var matchupPromises = this.matchups.map(function (d) {
        var params = 'boxscore?leagueId=' + leagueId + '&teamId=' + d.homeTeamId;
        return d3.json(baseurl + params);
      });

      var matchupsData = Promise.all([].concat(_toConsumableArray(matchupPromises)));

      matchupsData.then(function (data) {
        data.forEach(function (d) {
          var homeTeamId = d.boxscore.teams[0].teamId;
          self.matchups.forEach(function (matchup) {
            if (matchup.homeTeamId === homeTeamId) {
              var teams = d.boxscore.teams.map(function (team) {
                var progames = d.boxscore.progames;
                var players = team.slots.slice(0, 9).map(function (player) {
                  var progame = progames[player.proGameIds[0]];
                  var progameStatus = progameStatuses[progame.status];
                  var actualPoints = 'appliedStatTotal' in player.currentPeriodRealStats ? player.currentPeriodRealStats.appliedStatTotal : 0;
                  var projPoints = player.currentPeriodProjectedStats.appliedStatTotal;

                  if (progameStatus === 'inProgress') {
                    var periodClock = progame.timeRemainingInPeriod.split(':').map(function (d) {
                      return +d;
                    });
                    var secondsInPeriod = 60 * periodClock[0] + periodClock[1];
                    var periodsToPlay = progame.period > 4 ? 0 : 4 - progame.period;
                    var secondsToPlay = secondsInPeriod + 900 * periodsToPlay;
                    projPoints = actualPoints + secondsToPlay * projPoints / 3600;
                  }

                  if (progameStatus === 'finished') {
                    projPoints = actualPoints;
                  }

                  return {
                    firstName: player.player.firstName,
                    lastName: player.player.lastName,
                    gameStatus: progameStatus,
                    projPoints: projPoints,
                    actualPoints: actualPoints,
                    prettyPoints: oneDP(actualPoints)
                  };
                });

                var projPoints = players.reduce(function (a, c) {
                  return a + c.projPoints;
                }, 0);
                var actualPoints = players.reduce(function (a, c) {
                  return a + c.actualPoints;
                }, 0);
                return {
                  team: team.team.teamLocation + ' ' + team.team.teamNickname,
                  abbrev: team.team.teamAbbrev,
                  players: players,
                  projPoints: oneDP(projPoints),
                  actualPoints: oneDP(actualPoints),
                  projWidth: percent(projPoints / self.maximum),
                  actualWidth: percent(actualPoints / projPoints)
                };
              });
              matchup.data = teams;
            }
          });
        });
      });
    },

    expandMatchup: function expandMatchup(matchup) {
      matchup.expanded = !matchup.expanded;
    }
  },

  computed: {
    maximum: function maximum() {
      var projectedPoints = this.matchups.map(function (matchup) {
        return matchup.data.map(function (team) {
          return +team.projPoints;
        });
      });
      projectedPoints = d3.merge(projectedPoints);
      var maxProj = d3.max(projectedPoints);
      return maxProj > 150 ? maxProj : 150;
    }
  }
});