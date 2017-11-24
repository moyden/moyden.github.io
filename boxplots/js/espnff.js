/* global $, d3 */

const baseUrl = 'https://games.espn.com/ffl/api/v2/leagueSettings?leagueId=24903&seasonId='
const f = d3.format('.1f')

const svg = d3.select('svg')
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
}
const viewbox = svg.attr('viewBox').split(' ')
const width = +viewbox[2] - margin.left - margin.right
const height = +viewbox[3] - margin.top - margin.bottom

const g = svg.append('g')
  .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

const x = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.8)
  .paddingOuter(0.25)

const y = d3.scaleLinear()
  .rangeRound([height, 60])

drawPlots(2017)

$('#j-season').change(function () {
  drawPlots(this.value)
})

function drawPlots (year) {
  const url = baseUrl + year
  $.getJSON(url, function (data) {
    const teamsObj = data.leaguesettings.teams
    const teamsArray = Object.keys(teamsObj).map(key => teamsObj[key])
    const teams = teamsArray.map(function (d) {
      let re = /[A-Z]/
      if (re.exec(d.teamAbbrev) === null) d.teamAbbrev = 'CPH'
      return {
        name: d.teamLocation + ' ' + d.teamNickname,

        abbrev: d.teamAbbrev,

        id: d.teamId,

        wins: d.scheduleItems.reduce(function (sum, m) {
          let homeId = m.matchups[0].homeTeamId
          let outcome = m.matchups[0].outcome
          if (homeId === d.teamId && outcome === 1) return sum + 1
          else if (homeId !== d.teamId && outcome === 2) return sum + 1
          else return sum
        }, 0),

        losses: d.scheduleItems.reduce(function (sum, m) {
          let homeId = m.matchups[0].homeTeamId
          let outcome = m.matchups[0].outcome
          if (homeId === d.teamId && outcome === 2) return sum + 1
          else if (homeId !== d.teamId && outcome === 1) return sum + 1
          else return sum
        }, 0),

        pointsFor: d.scheduleItems.reduce(function (sum, m) {
          if (m.matchups[0].homeTeamId === d.teamId) {
            return sum + m.matchups[0].homeTeamScores.reduce((s, x) => s + x)
          } else {
            return sum + m.matchups[0].awayTeamScores.reduce((s, x) => s + x)
          }
        }, 0),

        pointsAgainst: d.scheduleItems.reduce(function (sum, m) {
          if (m.matchups[0].homeTeamId === d.teamId) {
            return sum + m.matchups[0].awayTeamScores.reduce((s, x) => s + x)
          } else {
            return sum + m.matchups[0].homeTeamScores.reduce((s, x) => s + x)
          }
        }, 0),

        scores: (function () {
          let scores = []
          d.scheduleItems.forEach(function (m) {
            if (m.matchups[0].outcome !== 0) {
              if (m.matchups[0].homeTeamId === d.teamId) {
                m.matchups[0].homeTeamScores.forEach(x => scores.push(x))
              } else {
                m.matchups[0].awayTeamScores.forEach(x => scores.push(x))
              }
            }
          })
          return scores
        })()
      }
    })

    teams.forEach(team => {
      const sortedScores = [...team.scores].sort((a, b) => a - b)

      if (sortedScores.length > 2) {
        const lowQuartile = d3.quantile(sortedScores, 0.25)
        const median = d3.quantile(sortedScores, 0.5)
        const upQuartile = d3.quantile(sortedScores, 0.75)
        const iqr = upQuartile - lowQuartile
        const outliers = sortedScores.filter(x => {
          return x > upQuartile + iqr || x < lowQuartile - iqr
        })
        const notOutliers = sortedScores.filter(x => {
          return x < upQuartile + iqr && x > lowQuartile - iqr
        })
        const min = d3.min(notOutliers)
        const max = d3.max(notOutliers)
        team.boxStats = {
          min: min,
          lowQuartile: lowQuartile,
          median: median,
          upQuartile: upQuartile,
          max: max,
          outliers: outliers
        }
      }
    })

    teams.sort((a, b) => b.boxStats.median - a.boxStats.median)
    let min = d3.min(teams, team => d3.min(team.scores))
    let max = d3.max(teams, team => d3.max(team.scores))
    x.domain(teams.map(team => team.id))
    y.domain([min, max])

    g.selectAll('g').remove()

    let plots = g.selectAll('g')
      .data(teams)
      .enter()
      .append('g').attr('class', 'boxplot')
      .attr('transform', d => {
        return 'translate(' + x(d.id) + ', 0)'
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    plots.append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.boxStats.upQuartile))
      .attr('width', x.bandwidth())
      .attr('height', d => y(d.boxStats.lowQuartile) - y(d.boxStats.upQuartile))

    plots.append('line')
      .attr('x1', 0)
      .attr('y1', d => y(d.boxStats.max))
      .attr('x2', x.bandwidth())
      .attr('y2', d => y(d.boxStats.max))

    plots.append('line')
      .attr('x1', 0)
      .attr('y1', d => y(d.boxStats.median))
      .attr('x2', x.bandwidth())
      .attr('y2', d => y(d.boxStats.median))

    plots.append('line')
      .attr('x1', 0)
      .attr('y1', d => y(d.boxStats.min))
      .attr('x2', x.bandwidth())
      .attr('y2', d => y(d.boxStats.min))

    plots.append('line')
      .attr('x1', 0.5 * x.bandwidth())
      .attr('y1', d => y(d.boxStats.max))
      .attr('x2', 0.5 * x.bandwidth())
      .attr('y2', d => y(d.boxStats.upQuartile))
      .attr('stroke-dasharray', '4, 4')

    plots.append('line')
      .attr('x1', 0.5 * x.bandwidth())
      .attr('y1', d => y(d.boxStats.min))
      .attr('x2', 0.5 * x.bandwidth())
      .attr('y2', d => y(d.boxStats.lowQuartile))
      .attr('stroke-dasharray', '4, 4')

    plots.selectAll('circle')
      .data(d => d.boxStats.outliers)
      .enter().append('circle')
      .attr('cx', 0.5 * x.bandwidth())
      .attr('cy', d => y(d))
      .attr('r', 4)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1.5)

    let labels = plots.append('g')
      .attr('stroke', 'none')
      .attr('fill', 'black')
      .attr('transform', 'translate(0, ' + 4 + ')')

    labels.append('text')
      .attr('class', d => d.abbrev.toLowerCase())
      .attr('x', 0.5 * x.bandwidth())
      .attr('y', 0)
      .text(d => d.abbrev)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.4em')
      .style('font-weight', 700)

    labels.append('text')
      .attr('x', -5)
      .attr('y', d => y(d.boxStats.max))
      .text(d => f(d.boxStats.max))
      .attr('text-anchor', 'end')

    labels.append('text')
      .attr('x', x.bandwidth() + 5)
      .attr('y', d => y(d.boxStats.upQuartile))
      .text(d => f(d.boxStats.upQuartile))
      .attr('text-anchor', 'start')

    labels.append('text')
      .attr('x', -5)
      .attr('y', d => y(d.boxStats.median))
      .text(d => f(d.boxStats.median))
      .attr('text-anchor', 'end')

    labels.append('text')
      .attr('x', x.bandwidth() + 5)
      .attr('y', d => y(d.boxStats.lowQuartile))
      .text(d => f(d.boxStats.lowQuartile))
      .attr('text-anchor', 'start')

    labels.append('text')
      .attr('x', -5)
      .attr('y', d => y(d.boxStats.min))
      .text(d => f(d.boxStats.min))
      .attr('text-anchor', 'end')
  })
}
