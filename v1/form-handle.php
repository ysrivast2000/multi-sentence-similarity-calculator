<?php
// A PHP prgram to assess similartity between two multi-sentences
// and represent data in a grpah using d3.js

require_once('maxBPM.php');
require_once('getMaxIndices.php');

// When recieving the key sentences and target sentences, use regex
// to split the paragraph into individual sentences
$key_sentences = preg_split('/(?<!Mr.|Mrs.|Dr.)(?<=[.?!;:])\s+/', $_POST[key], -1, PREG_SPLIT_NO_EMPTY);
$target_sentences = preg_split('/(?<!Mr.|Mrs.|Dr.)(?<=[.?!;:])\s+/', $_POST[target], -1, PREG_SPLIT_NO_EMPTY);
$value = $_POST[value];

// intiasllize a 2d array called mappings where the [i][j] index
// will map the similarity sof the ith key sentence to the jth
// target sentece
$mappings = array();
for ($i = 0; $i < sizeof($key_sentences); $i++) {
	$inner_mappings = array();

	for ($j = 0; $j < sizeof($target_sentences); $j++) {
        // Prepare POST request with the ith key sentence, jth
        // target sentence, and the value. The JSON object will
        // get sent to a PHP bridge where the similarity between
        // the key sentence and target sentence will be calculated
		$json = array(
		    'key' => $key_sentences[$i],
		    'target' => $target_sentences[$j],
		    'value' => $value
		);

		$json = json_encode($json);

		$context = array('http' =>
		    array(
		        'method'  => 'POST',
		        'header'  => 'Content-Type: application/json',
		        'content' => $json
		    )
		);
		$context  = stream_context_create($context);

        // use file_get_get_contents and json_decode to capture response
		$contents = file_get_contents('https://ws-nlp.vipresearch.ca/bridge/', false, $context);
		$contents = json_decode($contents);

        // Push value to array if valid, if invalid set to zero
        if (is_null($contents->similarity) || $contents->similarity < 0) {
            array_push($inner_mappings, 0);
        } else {
		  array_push($inner_mappings, $contents->similarity);
        }
	}

	array_push($mappings, $inner_mappings);
}

$overallSimilarity = 0;

// Get max number of accurate links using maxBPM algorithim
$max = executeMaxBPM($mappings);

// This function will return the indices of which similarities
// in the mappings array represent a maxBPM link. The
// $overallSimilarity variable will be sent and be pased by
// reference to be updated to the actual overall similarity
$indices = maxIndices($mappings, $max, $overallSimilarity);

// This array will be sent to the JavaScript files
$out = array(
	'mappings' => $mappings,
	'key' => $key_sentences,
	'target' => $target_sentences,
    'indices' => $indices
);
?>

<head>
    <title>Word Semantic Similarity Calculator</title>
    <script src="https://d3js.org/d3.v4.min.js" charset="utf-8"></script>
    <script src="https://d3js.org/d3-selection-multi.v1.js"></script>
    <script src="graphHelperFunctions.js" charset="utf-8"></script>
    <script src="createGraph.js" charset="utf-8"></script>
    <script src="BPMGraph.js" charset="utf-8"></script>
    <script src="displayTable.js" charset="utf-8"></script>
    <script src="thresholdSlider.js" charset="utf-8"></script>
    <link href="styles_graph_page.css" rel="stylesheet">
</head>

<body>
    <h3>Hover over a link to see the similiarity between between the key and target.
        <br> Hover over a node to see it's text value. Click on a table header to
        <br> sort the table by the retrospective  category
    </h3>

    <form>
        <h3> Link threshold 0
            <input type="range" id="thresholdSlider" name="points" value = 0 min="0" max="10" onchange="threshold(this.value)">
             1
        </h3>
    </form>

    <button type="button" value="off" id="BPMButton" onclick="return BPMGraph()">Max BPM Algorithim: Off</button>
    <button onclick="return initialPositions()">Reset</button>
    <a href="/v1">
        <button>Back</button>
    </a>

    <h3>Overall Similiarity: <?php echo $overallSimilarity; ?></h3>
    <h3 id="similarity"></h3>

    <div class='my-legend'>
        <div class='legend-title'>Legend</div>
        <div class='legend-scale'>
            <ul class='legend-labels'>
                <li><span style='background:#66b366;'></span>Max BPM link</li>
                <li><span style='background:#b8b8b8;'></span>Normal Link</li>
                <li><span style='background:#ff0000;'></span>Target Text Group</li>
                <li><span style='background:#0000ff;'></span>Key Text Group</li>
            </ul>
        </div>
    </div>


    <svg width="700" height ="400"></svg>

    <table id="table-of-similarities"><h3>Similarites</h3>
        <tr id="first-row">
            <th>Key Text</th>
            <th>Target Text</th>
            <th>MaxBPM Link?</th>
            <th>Similarity</th>
        </tr>
    </table>

    <script type="text/javascript">
    	var obj = <?php echo json_encode($out);?>;
    	initializeGraph(obj['mappings'], obj['key'], obj['target'], obj['indices']);
    	drawGraph();
        createTable(obj['mappings'], obj['key'], obj['target'], obj['indices']);
    </script>
</body>
