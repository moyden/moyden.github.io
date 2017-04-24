/* global d3 */

let w = 600
let h = 500

const data = [
  {
    name: 'Luke',
    values: [2.81, 3.31, 2.13, 2.19, 3.44, 4.25, 3.75]
  },
  // {
  //   name: 'Joe',
  //   values: [3.44, 3.06, 2.19, 3.19, 2.94, 4.06, 4.25]
  // },
  {
    name: 'Pete',
    values: [3.75, 3.00, 2.81, 4.00, 3.56, 4.25, 4.50]
  },
  {
    name: 'Richard',
    values: [3.06, 3.00, 2.19, 2.25, 3.50, 3.19, 2.75]
  },
  {
    name: 'Alex',
    values: [3.75, 3.13, 4.00, 2.81, 3.31, 3.75, 3.75]
  },
  // {
  //   name: 'Slackbot',
  //   values: [3.44, 1.00, 3.81, 1.56, 4.19, 1.56, 1.75]
  // },
  {
    name: 'Will',
    values: [2.56, 2.69, 2.88, 2.94, 3.50, 2.75, 3.50]
  },
  {
    name: 'Jeff',
    values: [3.13, 2.50, 2.63, 3.81, 3.56, 3.50, 3.75]
  }
]

const categories = [
  'Honesty',
  'Emotionality',
  'eXtraversion',
  'Agreeableness',
  'Conscientiousness',
  'Openness to Exprience',
  'Altruism'
]

const chart = d3.select('body').select('svg')

const theta = d3.scaleLinear()
  .domain([0, 7])
  .range([0, 2 * Math.PI])

const r = d3.scaleLinear()
  .domain([1, 5])
  .range([0, 200])

const col = d3.scaleOrdinal(d3.schemeCategory10)

const rLine = d3.radialLine()
  .angle((d, i) => theta(i))
  .radius((d) => r(d))
  .curve(d3.curveCardinalClosed)

const g = chart.append('g')
  .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')')

categories.forEach((c, i) => {
  let axis = g.append('g')
    .attr('transform', 'rotate(' + i * 360 / 7 + ')')

  axis.append('line')
    .attr('class', 'ax')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', -200)

  for (let j = 0; j < 4; ++j) {
    axis.append('line')
      .attr('class', 'tick')
      .attr('x1', -3)
      .attr('x2', 3)
      .attr('y1', r(-j))
      .attr('y2', r(-j))
  }
})

const legend = d3.select('body').append('ul')

data.forEach((d, i) => {
  legend.append('li')
    .text(d.name)
    .style('color', col(i))

  g.append('path')
    .data([d.values])
    .attr('d', rLine)
    .attr('class', 'line')
    .attr('stroke', col(i))
    .attr('fill', 'none')
})
