// Initially set threshold slider to 0 and call the thresold function
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("thresholdSlider").value = 0;
    threshold(0);
})



// will update links when the threshold is changhed
function threshold(thresh) {
    thresh = Number(thresh);
    thresh = thresh * 0.1;

    link = link.data(graph.links);

    // If  similairty is less than the threshold, set the linkl
    // as "off" by changing width to 0
    link.attr("stroke-width", d => {
        if (d.similarity >= thresh) {
            return d.similarity * 3;
        } else {
            return 0;
        }
    });

    // Update connected nodes arrya
    graph.links.forEach(l => {
        if (l.similarity >= thresh && l.similarity >= 0.005) {
            linkedByIndex[`${l.source.name},${l.target.name}`] = 1;
        } else {
            linkedByIndex[`${l.source.name},${l.target.name}`] = 0;
        }
    });

    BPMset();
    thresholdScore(thresh);
}

// Updates the overall similiarity score for values with in range of threshold
// Caluclation done by averaging similarity of msxBPM links >= threshold
function thresholdScore(thresh) {
    n_links = 0;
    sum = 0;
    graph.links.forEach(l => {
        if (l.maxBPM && l.similarity >= thresh) {
            n_links++;
            sum += l.similarity;
        }
    });
    document.getElementById("similarity").innerHTML = "Overall Similarity of Links in Range of Threshold: " + sum/n_links;
}