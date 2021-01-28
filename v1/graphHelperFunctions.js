// Will properly align the nodes
function initialPositions() {
    var n_key = 0;
    var n_target = 0;

    graph.nodes.forEach(d => {
        if (d.name[0] === "k") { n_key++; }
        else if (d.name[0] === "t") { n_target++; }
    });

    var key_spacing = NODE_PLANE_HEIGHT / (n_key + 2);
    var target_spacing = NODE_PLANE_HEIGHT / (n_target + 2);

    var i = 1;
    var j = 1;

    graph.nodes.forEach(d => {
        if (d.name[0] === "k") {
         d.fx = KEY_X;
         d.fy = NODE_START_Y + (i++)*key_spacing;
        }
        else if (d.name[0] === "t") {
         d.fx = TARGET_X;
         d.fy = NODE_START_Y + (j++)*target_spacing;
        }
    });
}


// Determines the posistion of the nodes. This function is run in background
// in parallel of other functions
function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

function dragstarted(d) {
  simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragend(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
}

// when clicked, move node back to inital position
function returnNode(d) {
    d.fx = null;
    d.fy = null;
}


function isConnected(a, b) {
    return linkedByIndex[`${a.name},${b.name}`] || linkedByIndex[`${b.name},${a.name}`] || a.name === b.name;
}

// If a node is not connected to the current node, aoppply opacity to it
function fade(opacity) {
    return d => {
      node.style('stroke-opacity', function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

    };
}

// Applies zooms effect to svg
function zoom_actions() {
    g.attr("transform", d3.event.transform);
}


// When you hover over a node, only display the link itself and the two connected
// nodes
function highlightConnectedNodes(d, mouseOver) {
    node = node.data(graph.nodes);

    // Highlights only connected nodes
    node.style('stroke-opacity', n => {
        if (!mouseOver) {
            return 1;
        } else if (!((n.name === d.source.name || n.name === d.target.name) && mouseOver)) {
            return 0.2;
        }
        return 1;
    })
    .attr('fill-opacity', n => {
        if (!mouseOver) {
            return 1;
        } else if (!((n.name === d.source.name || n.name === d.target.name) && mouseOver)) {
            return 0.2;
        }
        return 1;
    });

    // Fade out other links
    link = link.data(graph.links);
    link.style('stroke-opacity', l => {
        if (!mouseOver) {
            return 1;
        } else if (!(l === d && mouseOver)) {
            return 0.2;
        }
        return 1;
    })
}

function addTooltips() {
    link = link.data(graph.links);
    node = node.data(graph.nodes);

    link
        .attr('class', 'link')
        .on('mouseover.tooltip', function(d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
            tooltip.html("Source: "+ d.source.text +
                         "<p/>Target: " + d.target.text +
                        "<p/>Similarity: "  + d.similarity)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on("mouseout.tooltip", function() {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 10) + "px");
        });

    node
        .on('mouseover.tooltip', function(d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
            tooltip.html("Text: " + d.text + "<p/>Group: " + d.group)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
            })
        .on('mouseover.fade', fade(0.1))
        .on("mouseout.tooltip", function() {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
            })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        });
}

function addArrows() {
    svg.append('defs').append('marker')
        .attrs({'id':'arrowhead',
            'viewBox':'-0 -5 10 10',
            'refX':13,
            'refY':0,
            'orient':'auto',
            'markerWidth':4,
            'markerHeight':10,
            'xoverflow':'visible'})
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', "#000000")
        .style('stroke', BPMcolor(0));
}