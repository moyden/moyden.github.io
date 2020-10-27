/* global d3, SunCalc */

// define width and height of svg, and radius of watch face
const w = 320
const h = 320
const r = 150

// define function to get time as decimal from 0.0 to 23.99...
const getDecimalTime = function (curTime = Date.now()) {
  const getHour = d3.timeFormat('%H')
  const getMin = d3.timeFormat('%M')
  const getSec = d3.timeFormat('%S')
  const decimalTime = +getHour(curTime) + (+getMin(curTime) / 60) + (+getSec(curTime) / 3600)
  return decimalTime
}

// select svg element on page and append group element to move
// graphic to center of svg
const svg = d3.select('.watch')
const g = svg.append('g')
    .attr('transform', 'translate(' + w / 2 + ', ' + h / 2 + ') rotate(90)')

// define continuous scale to convert decimal hours to angle in degrees
// could have used d3.scaleTime but seems unnecessary
const t = d3.scaleLinear()
    .domain([0, 24])
    .range([0, 360])

// create intervals array for hour/quarter hour ticks and numerals
// array for hours
let inc = []
for (let i = 0; i < 96; i++) inc.push(i)
const intervals = inc.map(x => x / 4)
const numerals = intervals.filter(x => x % 1 === 0)

// create tick marks
const ticks = g.append('g')
ticks.selectAll('line').data(intervals)
  .enter().append('line')
    .attr('class', 'watch__ticks')
    .attr('x1', 0.77 * r)
    .attr('y1', 0)
    .attr('x2', 0.85 * r)
    .attr('y2', 0)
    .attr('stroke', 'black')
    .attr('stroke-width', d => d % 1 === 0 ? 2 : 0.75)
    .attr('transform', d => 'rotate(' + t(d) + ')')

// create numeral marks
ticks.selectAll('text').data(numerals)
  .enter().append('text')
    .attr('class', 'watch__numerals')
    .text(d => d)
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('transform', d => {
      return 'rotate(' + t(d) + ')' +
             'translate(' + 0.88 * r + ', 0)' +
             'rotate(90)'
    })

// create daylight arc
const arc = d3.arc() // create d3 arc generator

// eslint-disable-next-line no-unused-vars
const daylight = g.append('path')
    .attr('class', 'watch__daylight-arc')
    .attr('transform', 'rotate(90)')

// check for location
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    const sunTimes = SunCalc.getTimes(
      Date.now(),
      position.coords.latitude,
      position.coords.longitude
    )
    const sunrise = getDecimalTime(sunTimes.sunrise)
    const sunset = getDecimalTime(sunTimes.sunset)
    const arcPoints = arc({
      innerRadius: 0.72 * r,
      outerRadius: 0.74 * r,
      startAngle: t(sunrise) * Math.PI / 180,
      endAngle: t(sunset) * Math.PI / 180
    })

    daylight.attr('d', arcPoints)
  })
}

// create watch hand
const handPoints = [
  [-0.16 * r, -0.03 * r],
  [0.85 * r, -0.5],
  [0.85 * r, 0.5],
  [-0.16 * r, 0.03 * r]
]
const hand = g.append('polygon')
    .attr('class', 'watch__hand')
    .attr('points', handPoints.join(' '))
    .attr('transform', 'rotate(' + t(getDecimalTime()) + ')')

// add circle that covers centre of watch face
g.append('circle')
  .attr('class', 'watch__centre')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', 0.07 * r)

// define function to update time
const updateTime = function () {
  hand.transition()
    .duration(1000)
    .attr('transform', 'rotate(' + t(getDecimalTime()) + ')')
}

// create and start timer to update time every 10 seconds
// eslint-disable-next-line no-unused-vars
const timer = d3.interval(updateTime, 10000)
