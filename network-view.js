function networkView() {
  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 960,
      height = 500,
      xaxis_y_offset = height - margin.bottom,
      port_width = function() { return width - margin.left - margin.right; }
      port_height = function() { return height - margin.top - margin.bottom; }
      xValue = function(d) { return d.coords[0]; },
      yValue = function(d) { return d.coords[1]; },
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6).tickSize(6, 0),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(6).tickSize(6, 0),
      network_id = "",
      edge_class = "edge",
      node_class = "node";

  function view(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      nodes = data.nodes;
      edges = data.links;
      xys = nodes.map(function(d, i) {
        return [xValue.call(nodes, d, i), yValue.call(nodes, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(xys, function(d) { return d[0]; }))
          .range([0, port_width()]);

      // Update the y-scale.
      yScale
          .domain(d3.extent(xys, function(d) { return d[1]; }))
          .range([port_height(), 0]);

      var zoom = d3.behavior.zoom()
          .x(xScale)
          .y(yScale)
          .scaleExtent([1, 10])
          .on("zoom", zoomed);

      var g1 = d3.select(this).append("svg")
          .attr({width: width, height: height})
          .append("g")
          .call(zoom);

      var rect = g1.append("rect")
          .attr({
              width: width, 
              height: height, 
              class: "network_outer_rect"})
          .style("pointer-events", "all");
     
      var g_inner = g1.append("svg")
          .attr({width: port_width(), height: port_height()})
          .attr({x:  margin.left, y: margin.top })
          .append("g");

      var rect = g_inner.append("rect")
          .attr({
              width: port_width(), 
              height: port_height(),
              class: "network_inner_rect"})

      var g3 = g_inner.append("g")

      var lines = g3.selectAll("path")
          .data(edges)
          .enter()
          .append("path");

      var line_path = function(d, i) {
          path = "M" + X(nodes[d.source]) + " " + Y(nodes[d.source]) +
                 "L" + X(nodes[d.target]) + " " + Y(nodes[d.target]);
          return path;
      };

      lines.attr({
          d: line_path, 
          class: edge_class, 
          id: function(d, i) { return network_id + "_edge" + i; }});

      var circles = g3.selectAll("circle")
          .data(nodes)
          .enter()
          .append("circle");

      circles.attr({
          cx: function(d, i) { return X(d); }, 
          cy: function(d, i) { return Y(d); },
          class: node_class, 
          r: 2});
      
      // node labels
      var node_label_g = g3.append("g");
      node_labels = node_label_g.selectAll("text")
          .data(nodes)
          .enter()
          .append("text");

      node_labels.attr({
          x: function(d, i) { return X(d); },
          y: function(d, i) { return Y(d); },
          class: "node_label",
          'text-anchor': "middle"})
          .text(function(d, i) { return i; });

      var edge_label_g = g3.append("g");

      // align edgge labels with their edge paths
      var text = edge_label_g.selectAll("text")
            .data(edges)
            .enter()
            .append("text")
            .attr("class", "edge_label")
            .attr("text-anchor","middle") 
            .append("textPath")
            .attr("xlink:href", function(d, i) { return "#" + network_id + "_edge" + i; })
            .attr("startOffset", "50%")
            .text(function(d, i) { return d.weight.toPrecision(4); });


      // on zoom:
      // use translate to transform nodes/edges in g3 group
      // re render axes
      function zoomed() {
          g3.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
          g1.select(".x.axis").call(xAxis);
          g1.select(".y.axis").call(yAxis);
      }

      g1.append("g").attr("class", "y axis");
      g1.append("g").attr("class", "x axis");

      // Update the axes.
      g1.select(".x.axis")
          .attr("transform", "translate(0," + xaxis_y_offset + ")")
          .call(xAxis);

      g1.select(".y.axis")
          .attr("transform", "translate(" + margin.left + ", 0)")
          .call(yAxis);
 
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  view.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return view;
  };

  view.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return view;
  };

  view.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return view;
  };

  view.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return view;
  };

  view.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return view;
  };

  view.edge_class = function(_) {
    if (!arguments.length) return edge_class;
    edge_class = _;
    return view;
  };

  view.node_class = function(_) {
    if (!arguments.length) return node_class;
    node_class = _;
    return view;
  };

  view.network_id = function(_) {
    if (!arguments.length) return network_id;
    network_id = _;
    return view;
  };


  return view;
}
