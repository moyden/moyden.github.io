'use strict';

/* global d3 */

(function () {
  var parseDate = d3.timeParse('%Y%m%d');

  var svg = d3.select('#j-cancellation-month');
  var viewbox = svg.attr('viewBox').split(' ').map(function (x) {
    return +x;
  });
  var margins = { top: 10, right: 40, bottom: 40, left: 40 };
  var width = viewbox[2] - margins.left - margins.right;
  var height = viewbox[3] - margins.top - margins.bottom;

  var g = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  var x = d3.scaleTime().rangeRound([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y); // .tickFormat(d3.format('.0%'))

  d3.csv('RecruitmentTask/CancellationData.csv').then(function (raw) {
    var data = raw.map(function (d) {
      return {
        id: d['Member Number'],
        date: parseDate(d['Cancellation Date'])
      };
    });

    x.domain([parseDate('20110801'), parseDate('20151101')]);

    var histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(d3.timeMonth.every(1)));
    var dates = data.map(function (d) {
      return d.date;
    });
    var bins = histogram(dates);

    y.domain([0, d3.max(bins, function (d) {
      return d.length;
    })]);

    // major horizontal gridlines
    g.append('g').attr('opacity', 0.1).selectAll('line').data(y.ticks(8)).enter().append('line').attr('y1', function (d) {
      return y(d) + 0.5;
    }).attr('y2', function (d) {
      return y(d) + 0.5;
    }).attr('x1', 0).attr('x2', width).attr('stroke', 'black');

    g.append('g').attr('fill', 'steelblue').selectAll('rect').data(bins).enter().append('rect').attr('x', function (d) {
      return x(d.x0) + 2;
    }).attr('width', function (d) {
      return x(d.x1) - x(d.x0) - 2;
    }).attr('y', function (d) {
      return y(d.length);
    }).attr('height', function (d) {
      return y(0) - y(d.length);
    });

    g.append('g').attr('class', 'x-axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

    g.append('g').attr('class', 'y-axis').call(yAxis);
  });
})();