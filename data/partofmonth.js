'use strict';

/* global d3 */

var parseDate = d3.timeParse('%Y%m%d');

var svg = d3.select('#j-svg');
var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
  return +x;
});
var margins = { top: 50, right: 50, bottom: 50, left: 50 };
var width = viewbox[2] - margins.left - margins.right;
var height = viewbox[3] - margins.top - margins.bottom;

var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

var x = d3.scaleTime().rangeRound([0, width]);

var y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

d3.csv('RecruitmentTask/RenewalCommsData.csv').then(function (raw) {
  var data = raw.map(function (d) {
    return {
      id: d['Member Number'],
      sent: parseDate(d['Date Renewal Comms Sent']),
      open: parseDate(d['Date Renewal Comms Opened'])
    };
  });

  var opened = data.filter(function (d) {
    return d.open !== null;
  });
  var zoom = opened.filter(function (d) {
    return d.open > new Date('2013', '10');
  });

  x.domain(d3.extent(zoom, function (d) {
    return d.open;
  })).nice();

  var histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(d3.timeMonth.every(1)));
  var dates = zoom.map(function (d) {
    return d.open;
  });
  var bins = histogram(dates);

  y.domain([0, d3.max(bins, function (d) {
    return d.length;
  })]);

  var bar = g.append('g').attr('fill', 'steelblue').selectAll('rect').data(bins).enter().append('rect').attr('x', function (d) {
    return x(d.x0) + 1;
  }).attr('width', function (d) {
    return x(d.x1) - x(d.x0) - 1;
  }).attr('y', function (d) {
    return y(d.length);
  }).attr('height', function (d) {
    return y(0) - y(d.length);
  });

  g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

  g.append('g').attr('class', 'y-axis').call(yAxis);
});