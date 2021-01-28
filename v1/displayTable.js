// Creates table of values summarizing the similarities between the key sentences and
// target sentences
function createTable(mappings, keys, targets, indices) {
    var table = document.getElementById("table-of-similarities");

    for (var i = 0; i < mappings.length; i++) {
        for (var j = 0 ; j < mappings[i]. length; j++) {
            var row = document.createElement('tr');

            var keyCell = document.createElement('td');
            keyCell.innerHTML = keys[i];
            row.appendChild(keyCell);

            var targetCell = document.createElement('td');
            targetCell.innerHTML = targets[j];
            row.appendChild(targetCell);

            var BPMcell = document.createElement('td');

            if (isMaxBPMLink(indices, i ,j)) {
                BPMcell.innerHTML = "True";
            } else {
                BPMcell.innerHTML = "False";
            }
            row.appendChild(BPMcell);

            var similarityCell = document.createElement('td');
            similarityCell.innerHTML = mappings[i][j];
            row.appendChild(similarityCell);

            table.appendChild(row);
        }
    }
}

// Used by createTable Function to determine if a link is maxBPM
function isMaxBPMLink(indices, i ,j) {
    for (var k = 0; k < indices.length; k++) {
        if (indices[k][0] === i && indices[k][1] === j) {
            return true;
        }
    }
    return false;
}


//https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript
const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));


// do the work...
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
        var table = document.getElementById("table-of-similarities");

        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
        .forEach(tr => table.appendChild(tr) );
    }));
});