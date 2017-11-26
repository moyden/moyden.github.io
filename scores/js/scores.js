'use strict';

/* global Vue, $, d3 */

var url = 'http://games.espn.com/ffl/scoreboard?leagueId=24903&seasonId=2017';
var f = d3.format('.1f');

var json = {
  games: []
};

var setProportions = function setProportions() {
  var rP = d3.format('.2%');
  json.games.forEach(function (game) {
    if (game.homeProj === '') game.homeProj = game.homeScore;
    if (game.awayProj === '') game.awayProj = game.awayScore;
    game.homeWidth = rP(+game.homeProj / 160);
    game.awayWidth = rP(+game.awayProj / 160);
    game.homeProp = rP(+game.homeScore / +game.homeProj);
    game.awayProp = rP(+game.awayScore / +game.awayProj);
  });
};

var getData = function getData() {
  $.get('https://allorigins.us/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function (data) {
    var matchups = $(data).find('.matchup');
    var games = [];
    matchups.each(function (i, el) {
      var game = {};
      var names = $(this).find('.name');
      game.homeTeam = names.eq(0).children().first().text();
      game.awayTeam = names.eq(1).children().first().text();
      var nicks = $(this).find('.scoringDetails').find('.abbrev');
      game.homeNick = nicks.eq(0).text().toLowerCase();
      game.awayNick = nicks.eq(1).text().toLowerCase();
      var records = $(this).find('.record');
      game.homeRec = records.eq(0).text();
      game.awayRec = records.eq(1).text();
      var scores = $(this).find('.score');
      game.homeScore = f(scores.eq(0).text());
      game.awayScore = f(scores.eq(1).text());
      var info = $(this).find('.playersPlayed');
      game.homeProj = info.eq(0).children().eq(3).text();
      game.awayProj = info.eq(1).children().eq(3).text();
      games.push(game);
    });
    json.games = games;

    setProportions();
  });
};

getData();

// eslint-disable-next-line no-unused-vars
var timer = d3.interval(getData, 30000);

// eslint-disable-next-line no-unused-vars
var vm = new Vue({
  el: '.j-vm',
  data: json
});