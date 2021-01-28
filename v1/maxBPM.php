<?php
// A PHP program to find maximal
// Bipartite matching.
// https://www.geeksforgeeks.org/maximum-bipartite-matching/

// M is number of applicants
// and N is number of jobs
$M;
$N;

// A DFS based recursive function
// that returns true if a matching
// for vertex u is possible
function bpm($bpGraph, $u, &$seen, &$matchR)
{
    global $N;

    // Try every job one by one
    for ($v = 0; $v < $N; $v++)
    {
        // If applicant u is interested in
        // job v and v is not visited
        if ($bpGraph[$u][$v] && !$seen[$v])
        {
            // Mark v as visited
            $seen[$v] = true;

            // If job 'v' is not assigned to an
            // applicant OR previously assigned
            // applicant for job v (which is matchR[v])
            // has an alternate job available.
            // Since v is marked as visited in
            // the above line, matchR[v] in the following
            // recursive call will not get job 'v' again
            if ($matchR[$v] < 0 || bpm($bpGraph, $matchR[$v],
                                    $seen, $matchR))
            {
                $matchR[$v] = $u;
                return true;
            }
        }
    }
    return false;
}

// Returns maximum number
// of matching from M to N
function maxBPM($bpGraph)
{
    global $N,$M;

    // An array to keep track of the
    // applicants assigned to jobs.
    // The value of matchR[i] is the
    // applicant number assigned to job i,
    // the value -1 indicates nobody is
    // assigned.
    $matchR = array_fill(0, $N, -1);

    // Initially all jobs are available

    // Count of jobs assigned to applicants
    $result = 0;
    for ($u = 0; $u < $M; $u++)
    {
        // Mark all jobs as not seen
        // for next applicant.
        $seen=array_fill(0, $N, false);

        // Find if the applicant 'u' can get a job
        if (bpm($bpGraph, $u, $seen, $matchR))
            $result++;
    }
    return $result;
}

// Driver Code

// Let us create a bpGraph
// shown in the above example
function executeMaxBPM($graph)
{
    global $N, $M;

    // create a copy of the graph of mappings/similaritites
    $graphObjects = new ArrayObject($graph);
    $bpGraph = $graphObjects->getArrayCopy();

    // Assign a similarity as a worker (set to 1) if the
    // similarity between the ith key sentence to the
    // jth target sentence is greater than or equal to 0.2,
    // otherwise set to 0
    // NOTE: This value of 0.2 could be subject tp change
    $N = sizeof($graph);
    for ($i = 0; $i < sizeof($graph); $i++) {
        $M = sizeof($graph[$i]);
        for ($j = 0; $j < sizeof($graph[$i]); $j++) {
            if ($graph[$i][$j] >= 0.2) {
                $bpGraph[$i][$j] = 1;
            } else {
                $bpGraph[$i][$j] = 0;
            }
        }
    }

    return maxBPM($bpGraph);
}

// This code is contributed by chadan_jnu
?>
