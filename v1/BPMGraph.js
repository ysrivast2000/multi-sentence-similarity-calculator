// Handles functionality of maxBPM
function BPMGraph() {
    var button = document.getElementById("BPMButton");

    if (button.value === "off") {
        button.value = "on";
        button.innerHTML = "Max BPM Algorithim: On";
        BPM = true;
    } else {
        button.value = "off";
        button.innerHTML = "Max BPM Algorithim: Off";
        BPM = false;
    }

    BPMset();
}

// Changes colour of maxBPM links to green
function BPMset() {
    link = link.data(graph.links);
    link.style("stroke", d => {
            if (BPM && d.maxBPM) { return BPMcolor(10); }
            else { return BPMcolor(0); }
        });
}