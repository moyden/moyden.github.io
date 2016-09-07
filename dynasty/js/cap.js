var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25
                  ];

var svg = d3.select("body").select("#chart");

svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", "10")
    .attr("y", "10")
    .attr("width", "20")
    .attr("height", "20")
    .attr("fill", "black");