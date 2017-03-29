d3.csv("data.csv", function(data) {

  data = data.filter(function(d) {
    return d["Team"] == "Colorado Pony Hospital";
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
    "Dropped": [],
  };

  data.forEach(function(d) {
    var entry = {
      "player": d["Player"],
      "position": d["Position"],
      "cost": d["Contract Value"],
      "year": d["Contract Length"]
    };
    if (d["Dropped"]) { team["Dropped"].push(entry); }
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
      "category": "Dropped",
      "cost": Math.ceil(d3.sum(team["Dropped"], function(d) { return d.cost; }) / 2),
      "year": "–"
    }
  ];

  summary.push({
    "category": "Total",
    "cost": d3.sum(summary, function(d) { return d.cost; }),
    "year": d3.sum(summary, function(d) { return d.year; })
  });

  // tabulate(summary, ["category", "cost", "year"], "summary")
  tabulate(team["Quarterbacks"], ["number", "player", "cost", "year"], "quarterbacks");
  // tabulate(team["Running Backs"], ["number", "player", "cost", "year"], "runningbacks");
  // tabulate(team["Wide Receivers"], ["number", "player", "cost", "year"], "widereceivers");
  // tabulate(team["Tight Ends"], ["number", "player", "cost", "year"], "tightends");
  // tabulate(team["Dropped"], ["position", "player", "cost", "year"], "dropped");

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
