// http://coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
// https://bl.ocks.org/almsuarez/4333a12d2531d6c1f6f22b74f2c57102

// Constants
var KEY_X = 100;
var TARGET_X = 434;
var NODE_START_Y = 50;
var NODE_PLANE_HEIGHT = 400;
var NODE_RADIUS = 3;

// Object for force directected graph
var graph = {
	"nodes": [],
	"links": []
};

// Global variables, utilized by graphHelperFunction.js
var svg;
var g;
var color;
var BPMcolor;
var simulation;
var link;
var node;
var tooltip;
var zoom_handler;
var BPM = false;
var linkedByIndex = {};

// Initialize and create node and links objects that will be later used by
// d3.js force directed graph
function initializeGraph(mappings, keys, targets, indices) {

	var links = [];
	var nodes = [];

	// Push key sentences into nodes
	for (let i = 0; i < keys.length; i++) {
		nodes.push({
			name: "k" + i,
			text: keys[i],
			id: 0,
			group: "Key"
		});
	}

	// Push target sentences into nodes
	for (let i = 0; i < targets.length; i++) {
		nodes.push({
			name: "t" + i,
			text: targets[i],
			id: 10,
			group: "Target"
		});
	}

	// Push similairties  between keys and targets as links
	for (let i = 0; i < mappings.length; i++) {
		for (let j = 0; j < mappings[i].length; j++) {
			links.push({
				source: "k" + i,
				target: "t" + j,
				similarity: mappings[i][j],
				// i and j key:value pairs are used to help identify
				// which links are maxBPM links
				i: i,
				j: j,
				maxBPM: false
			});
		}
	}

	// Find which links are maxBPM links
	for (let i = 0; i < links.length; i++) {
		for (let j = 0; j < indices.length; j++) {
			if (links[i]["i"] == indices[j][0] && links[i]["j"] == indices[j][1]) {
				links[i]["maxBPM"] = true;
			}
		}
	}

	graph["nodes"] = nodes;
	graph["links"] = links;
}


// This function will create the force directed graph
function drawGraph() {
	svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    // colour scale where a value of 0 equals blue and 10 equals red
    // used by nodes
    color = d3.scaleLinear()
	  	.domain([0, 10])
	  	.range(['blue', 'red']);

	// colour scale where a value of 0 equals grey and 10 equals green
	// used by links
	BPMcolor = d3.scaleLinear()
	  	.domain([0, 10])
	  	.range(['grey', 'green']);

	tooltip = d3.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

   	addArrows();

	simulation = d3
	    .forceSimulation(graph.nodes)
	    .force("link", d3.forceLink(graph.links).id(d => d.name))
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter(width/2.4, height/3));

	// Add encompassing group for the zoom
	g = svg.append("g")
	    .attr("class", "everything");

	// Create an array that tracks which nodes are linked together
	graph.links.forEach(d => {
		if (d.similarity >= 0.05) {
    		linkedByIndex[`${d.source.name},${d.target.name}`] = 1;
    	} else {
    		linkedByIndex[`${d.source.name},${d.target.name}`] = 0;
    	}
 	});

	// Add links to graph
	link = g
	    .append("g")
	  	.attr("class", "links")
	  	.selectAll("line")
	  	.data(graph.links)
	  	.enter().append("line")
	    .attr("stroke-width", d => d.similarity*3)
	    .attr('marker-end', d => 'url(#arrowhead)')
	    .style("stroke", d => {
	    	if (BPM && d.maxBPM) { return BPMcolor(10); }
	    	else { return BPMcolor(0); }
	    })
	    .on("mouseover", d => highlightConnectedNodes(d, true))
	    .on('mouseout', d =>  highlightConnectedNodes(d, false));

	// Add nodes to graph
	node = g
	    .append("g")
	    .attr("class", "nodes")
	    .selectAll("circle")
	    .data(graph.nodes)
	    .enter().append("circle")
	    .attr("r", NODE_RADIUS)
	    .attr("fill", d => {
	    	return color(d.id);
	    })
	    .style("stroke", d => color(d.id))
	    .call(d3.drag()
	    	.on("start", dragstarted)
	    	.on("drag", dragged)
	    	.on("end", dragend));
	   //.on('click',returnNode);  Not working as intended

	initialPositions();

	addTooltips();

    simulation
      	.nodes(graph.nodes)
      	.on("tick", ticked);

  	simulation.force("link")
      	.links(graph.links);

    zoom_handler = d3.zoom()
    	.on("zoom", zoom_actions);

	zoom_handler(svg);
}
