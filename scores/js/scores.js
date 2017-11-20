/* global Vue, $, d3 */

const url = 'http://games.espn.com/ffl/scoreboard?leagueId=24903&seasonId=2017'
const f = d3.format('.1f')

const json = {
  games: []
}

const setProportions = function () {
  const rP = d3.format('.2%')
  json.games.forEach(game => {
    game.homeWidth = rP(+game.homeProj / 160)
    game.awayWidth = rP(+game.awayProj / 160)
    game.homeProp = rP(+game.homeScore / +game.homeProj)
    game.awayProp = rP(+game.awayScore / +game.awayProj)
  })
}

const getData = function () {
  $.get('https://allorigins.us/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function (data) {
    const matchups = $(data).find('.matchup')
    const games = []
    matchups.each(function (i, el) {
      const game = {}
      const names = $(this).find('.name')
      game.homeTeam = names.eq(0).children().first().text()
      game.awayTeam = names.eq(1).children().first().text()
      const nicks = $(this).find('.scoringDetails').find('.abbrev')
      game.homeNick = nicks.eq(0).text().toLowerCase()
      game.awayNick = nicks.eq(1).text().toLowerCase()
      const records = $(this).find('.record')
      game.homeRec = records.eq(0).text()
      game.awayRec = records.eq(1).text()
      const scores = $(this).find('.score')
      game.homeScore = f(scores.eq(0).text())
      game.awayScore = f(scores.eq(1).text())
      const info = $(this).find('.playersPlayed')
      game.homeProj = info.eq(0).children().eq(3).text()
      game.awayProj = info.eq(1).children().eq(3).text()
      games.push(game)
    })
    json.games = games

    setProportions()
  })
}

getData()

// eslint-disable-next-line no-unused-vars
const timer = d3.interval(getData, 120000)

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '.j-vm',
  data: json
})
