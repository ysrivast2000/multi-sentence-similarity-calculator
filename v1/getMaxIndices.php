<?php
// A PHP prgram to find the indices of the n max similarites
// calculate the overall similarity betweeen the two paragraphs

$max_values; // An array of the n most max values in given array
$indices; // An array of which similarites represenmt maxBPM links
$similarity; // The overall similarity between the two paragraphs

// This finnctuion will update  the mav_calues array
// if the provided value is greater than any value in the
// max_value array
function updateMaxValues($value) {
    global $max_values;

    sort($max_values);
    for ($i = 0; $i < sizeof($max_values); $i++) {
        if ($value > $max_values[$i]) {
            $max_values[$i] = $value;
            return;
        }
    }
}

// This function will get us the indices of the n max
// similarities in the graph array
function getIndices($graph) {
    global $indices, $max_values;

    // create a copy of the graph of mappings/similaritites
    $graphObjects = new ArrayObject($graph);
    $graphCopy = $graphObjects->getArrayCopy();

    for ($i = 0; $i < sizeof($graphCopy); $i++) {
        for ($j = 0; $j < sizeof($graphCopy[$i]); $j++) {
            // Iterate through the max_values array, if a value in the array
            // matches with the current similiarity, add the index of the
            // similarity to the indices array
            for ($k = 0; $k < sizeof($indices); $k++) {
                if (abs($max_values[$k] - $graphCopy[$i][$j]) < 0.00000001) {
                  $indices[$k] = array($i, $j);

                  // Change values so that these two values won't
                  // match anymore
                  $max_values[$k] = 100;
                  $graphCopy[$i][$j] = 50;
                }
            }
        }
    }

}

// Handles main funcitonality and calculates overall similarity score
function maxIndices($graph, $n, &$overallSimilarity) {
    global $max_values, $indices, $similarity;
    $similarity = 0;

    // initialize arrays
    $max_values = array_fill(0, $n, -1);
    $indices = array_fill(0, $n, "null");

    for ($i = 0; $i < sizeof($graph); $i++) {
        for ($j = 0; $j < sizeof($graph[$i]); $j++) {
            updateMaxValues($graph[$i][$j]);
        }
    }

    // calculate average of n max similarities
    // NOTE: This method or calculaatig overall similarity
    //       is subject to change
    for ($i = 0; $i < sizeof($max_values); $i++) {
        $similarity = $similarity + $max_values[$i];
    }
    $overallSimilarity = $similarity / sizeof($max_values);

    getIndices($graph);

    return $indices;
}
?>