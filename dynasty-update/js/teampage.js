d3.csv("data.csv", function(data) {

  data = data.filter(function(d) {
    return d["Team"] == teamName;
  })

  data.forEach(function(d) {
    d["Contract Value"] = +d["Contract Value"];
    d["Contract Length"] = +d["Contract Length"];
    d["Dropped"] = (d["Dropped"] == "true");
  })

  data.sort(function (a, b) {
    return d3.descending(a["Contract Value"], b["Contract Value"])
      || d3.descending(a["Contract Length"], b["Contract Length"]);
  });

  var team = {
    "Quarterbacks": [],
    "Running Backs": [],
    "Wide Receivers": [],
    "Tight Ends": [],
    "Released": [],
  };

  data.forEach(function(d) {
    var entry = {
      "player": d["Player"],
      "position": d["Position"],
      "cost": d["Contract Value"],
      "year": d["Contract Length"]
    };
    if (d["Dropped"]) { team["Released"].push(entry); }
    else {
      switch (d["Position"]) {
        case "QB": team["Quarterbacks"].push(entry); break;
        case "RB": team["Running Backs"].push(entry); break;
        case "WR": team["Wide Receivers"].push(entry); break;
        case "TE": team["Tight Ends"].push(entry); break;
      }
    }
  });

  var number = 1;
  team["Quarterbacks"].forEach(function(d) {
    d.number = number;
    number += 1;
  });
  team["Running Backs"].forEach(function(d) {
    d.number = number;
    number += 1;
  });
  team["Wide Receivers"].forEach(function(d) {
    d.number = number;
    number += 1;
  });
  team["Tight Ends"].forEach(function(d) {
    d.number = number;
    number += 1;
  });

  var summary = [
    {
      "category": "Quarterbacks",
      "cost": d3.sum(team["Quarterbacks"], function(d) { return d.cost; }),
      "year": d3.sum(team["Quarterbacks"], function(d) { return d.year; })
    },
    {
      "category": "Running Backs",
      "cost": d3.sum(team["Running Backs"], function(d) { return d.cost; }),
      "year": d3.sum(team["Running Backs"], function(d) { return d.year; })
    },
    {
      "category": "Wide Receivers",
      "cost": d3.sum(team["Wide Receivers"], function(d) { return d.cost; }),
      "year": d3.sum(team["Wide Receivers"], function(d) { return d.year; })
    },
    {
      "category": "Tight Ends",
      "cost": d3.sum(team["Tight Ends"], function(d) { return d.cost; }),
      "year": d3.sum(team["Tight Ends"], function(d) { return d.year; })
    },
    {
      "category": "Released",
      "cost": Math.ceil(d3.sum(team["Released"], function(d) { return d.cost; }) / 2),
      "year": "–"
    }
  ];

  summary.push({
    "category": "Total",
    "cost": d3.sum(summary, function(d) { return d.cost; }),
    "year": d3.sum(summary, function(d) { return d.year; })
  });

  tabulate(summary, ["category", "cost", "year"], "summary")
  tabulate(team["Quarterbacks"], ["number", "player", "cost", "year"], "quarterbacks");
  tabulate(team["Running Backs"], ["number", "player", "cost", "year"], "runningbacks");
  tabulate(team["Wide Receivers"], ["number", "player", "cost", "year"], "widereceivers");
  tabulate(team["Tight Ends"], ["number", "player", "cost", "year"], "tightends");
  tabulate(team["Released"], ["position", "player", "cost", "year"], "dropped");

  var chart = d3.select(".projCap");

  var margin = { top: 20, right: 15, bottom: 25, left: 30 },
      width = 300 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;
      g = chart.append("g").attr(
        "transform", "translate(" + margin.left + "," + margin.top + ")"
      );

  function hasContractLength(d) {
    return (d["Contract Length"] >= this);
  }

  function addCapHit(acc, d) {
    if (d["Dropped"]) return acc + (d["Contract Value"] / 2);
    else return acc + d["Contract Value"];
  }

  var projectedCap = []
  var parseYear = d3.timeParse("%Y");
  for (var i = 0; i < 5; i++) {
    projectedCap.push({
      "year": parseYear(2016 + i),
      "hit": data.filter(hasContractLength, i + 1).reduce(addCapHit, 0)
    });
  }

  var x = d3.scaleTime().range([0, width])
    .domain(d3.extent(projectedCap, function(d) { return d.year; }));
  var y = d3.scaleLinear().range([height, 0])
    .domain([0, 200]);

  var capLine = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.hit); })
    .curve(d3.curveMonotoneX);

  g.append("g")
    .attr("class", "gridlines")
    .call(d3.axisLeft(y).ticks(4)
      .tickSizeInner(-width)
      .tickSizeOuter(0));

  g.append("g")
    .attr("class", "gridlines")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5)
      .tickSizeInner(-height));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(2));

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5).tickSize(0));

  g.append("path")
    .data([projectedCap])
    .attr("d", capLine)
    .attr("class", "cap-line " + teamID);

  function tabulate(data, columns, tClass) {
    var table = d3.select("body").select("table." + tClass),
        tbody = table.append("tbody");

    var rows = tbody.selectAll("tr")
        .data(data)
      .enter().append("tr");

    var cells = rows.selectAll("td")
        .data(function(row) {
          return columns.map(function(column) {
            return {
              column: column,
              value:  row[column]
            };
          });
        })
      .enter().append("td")
        .text(function(d) { return d.value; })
        .attr("class", function(d) { return d.column; });
  }
});
