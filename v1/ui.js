function buildUI(value, responseData){
	if(responseData == null){
		msg = document.createElement('div');
		msg.insertAdjacentText('beforeend', 'Error during transmission');
		document.body.appendChild(msg);
		return;
	}

	console.log(responseData);
	//Consider using sys.excepthook() to exit with a different exit code
	//when an exception occurs before the json information is complete
	if(responseData.b_exitcode == 0 && responseData.combination != undefined){
		//create a mapping for filtered position -> original position
		responseData.mappings = {'forward':responseData.mappings,
			'inverse':{'key':{},'target':{}}};
		for(let map of ['key', 'target']){
			for(let [orig,filt] of Object.entries(responseData.mappings.forward[map])){
				if(filt != -1){
					responseData.mappings.inverse[map][filt] = orig;
				}
			}
		}

		const assignments = {'key':{}, 'target':{}};
		console.log(responseData.combination);
		console.log(responseData.mappings);
		console.log(responseData.info);
		for(let el of responseData.combination){
			//coordinates are (column, row)
			assignments['key'][el[0]] = el[1];
			assignments['target'][el[1]] = el[0];
		}
		console.log(assignments);

		const score = document.createElement('div');
		score.insertAdjacentText('beforeend','Similarity: ' + responseData.score +
			' / ' + value);
		document.body.appendChild(score);
		document.body.appendChild(document.createElement('br'));

		buildSentenceUI(responseData.tokens.key, 'k_',
			responseData.mappings, assignments, responseData.matrix, responseData.info);
		buildSentenceUI(responseData.tokens.target, 't_',
			responseData.mappings, assignments, responseData.matrix, responseData.info);
		buildLegend();
	}
	else{
		const errMsg = document.createElement('div');
		errMsg.insertAdjacentText('beforeend', 'Encountered error during calculation');
		document.body.appendChild(errMsg);
	}

	document.body.appendChild(document.createElement('br'));

	debugUI(responseData);
}

function buildSentenceUI(sentence, prefix, mappings, assignments, resultsMatrix, allSynsetInfo){
	const printJson = document.createElement('div');

	const longToShort = {'key': 'k_', 'target': 't_'};
	const inverter = {'key':'target', 'target':'key'};
	const wdMap = {'k_':'key', 't_':'target'}[prefix];

	for(let idx = 0; idx < sentence.length; idx++){
		const wordDiv = document.createElement('span');
		wordDiv.insertAdjacentText('beforeend',sentence[idx][1]);
		if((wdIdx = sentence[idx][0]) != -1){
			wordDiv.id = prefix+wdIdx;
			wordDiv.classList.add('resultWord');
			wordDiv.addEventListener('mouseover', toggleHighlight());
			wordDiv.addEventListener('mouseout', toggleHighlight());

			const mapped = mappings.forward[wdMap][wdIdx];
			if(mapped != -1 && assignments[wdMap].hasOwnProperty(mapped)){
				wordDiv.classList.add('optimal'); //Participated in optimal assignment
				wordDiv.pairing = longToShort[inverter[wdMap]] +
					mappings.inverse[inverter[wdMap]][assignments[wdMap][mapped]];
			}
			else if(mapped != -1){
				wordDiv.classList.add('notOptimal');//Did not appear in optimal assignment
			}
			else{
				wordDiv.classList.add('notFound'); //Did not appear in WordNet
			}

			wordDiv.addEventListener('click', showRelation(mappings.forward,
				resultsMatrix, allSynsetInfo));
		}
		printJson.appendChild(wordDiv);
		//printJson.insertAdjacentText('beforeend', ' ');
	}
	document.body.appendChild(printJson);
}

function buildLegend(){
	document.body.appendChild(document.createElement('br'));

	let legend = document.createElement('table');
	for(let [style,desc] of Object.entries({'optimal':'Included in optimal assignment',
		'notOptimal':'Not included in optimal assignment',
		'notFound':'Not found in WordNet'})){
		const row = document.createElement('tr');
		var entry = document.createElement('td');
		const colourpatch = document.createElement('span');
		colourpatch.classList.add('legendEntry');
		colourpatch.classList.add(style);
		entry.appendChild(colourpatch);
		row.appendChild(entry);

		entry = document.createElement('td');
		entry.insertAdjacentText('beforeend', desc);
		row.appendChild(entry);
		legend.appendChild(row);
	}
	document.body.appendChild(legend);
}

function debugUI(responseData){
	const buttonStrip = document.createElement('div');
	const buttonInfos = ['Time', responseData.time + ' seconds',
		'Debug Info', responseData.debug,
		'Errors', responseData.b_errors+'\nExit Code: '+responseData.b_exitcode,
		'Raw Response', JSON.stringify(responseData)];
	let info = document.createElement('pre');

	for(let i = 0; i < buttonInfos.length; i+=2){
		const infoToggle = document.createElement('input');
		infoToggle.type = 'button';
		infoToggle.value = 'Toggle ' + buttonInfos[i];
		infoToggle.onclick = function(){
			if(info.parentNode){
				info.parentNode.removeChild(info);
			}
			if(info.getAttribute('data-last') != buttonInfos[i]){
				info = document.createElement('pre');
				info.insertAdjacentText('beforeend', buttonInfos[i+1]);
				buttonStrip.insertAdjacentElement('afterend', info);
				info.setAttribute('data-last', buttonInfos[i]);
			}
			else{
				info.setAttribute('data-last', null);
			}
		}
		buttonStrip.appendChild(infoToggle);
	}
	document.body.appendChild(buttonStrip);
}

function toggleHighlight(){
	const actions = {'mouseover': 'add', 'mouseout': 'remove'};
	function doHighlighting(event){
		if(event.target.pairing != null){
			document.getElementById(event.target.pairing)
				.classList[actions[event.type]]('highlightedWord');
		}
		document.getElementById(event.target.id)
			.classList[actions[event.type]]('highlightedWord');
	}
	return doHighlighting;
}

function showRelation(mappings, resultsMatrix, allSynsetInfo){
	let selectedKW = null;
	let selectedTW = null;
	showRelation = function (mappings, resultsMatrix, allSynsetInfo){
		if(allSynsetInfo == null){
			if(selectedKW != null){
				document.getElementById(selectedKW).classList
					.remove('selectedWord');
				selectedKW = null;
			}
			if(selectedTW != null){
				document.getElementById(selectedTW).classList
					.remove('selectedWord');
				selectedTW = null;
			}
			return;
		}

		function doRelating(event){
			if(event.target.id.substring(0,2) == 'k_'){
				if(selectedKW != null){
					document.getElementById(selectedKW).classList
						.remove('selectedWord');
				}
				selectedKW = event.target.id;
			}
			else if (event.target.id.substring(0,2) == 't_'){
				if(selectedTW != null){
					document.getElementById(selectedTW).classList
						.remove('selectedWord');
				}
				selectedTW = event.target.id;
			}
			event.target.classList.add('selectedWord');
			if(selectedKW != null && selectedTW != null){
				const mappedKW = mappings['key'][selectedKW.substring(2)];
				const mappedTW = mappings['target'][selectedTW.substring(2)];
				if(mappedKW == -1 || mappedTW == -1){
					displaySynsetDialogue(
						calculatePosition(selectedKW,selectedTW),
						-1, [null]);
				}
				else{
					displaySynsetDialogue(
						calculatePosition(selectedKW,selectedTW),
						resultsMatrix[mappedKW][mappedTW],
						allSynsetInfo[mappedKW][mappedTW]);
				}
			}
		}
		return doRelating;
	};
	return showRelation(mappings, resultsMatrix, allSynsetInfo);
}

function calculatePosition(id_one, id_two){
	let box1 = document.getElementById(id_one).getBoundingClientRect();
	let box2 = document.getElementById(id_two).getBoundingClientRect();
	return {x: Math.max(box1.right, box2.right) + window.pageXOffset,
		y: Math.min(box1.top, box2.top) + window.pageYOffset};
}

function displaySynsetDialogue(position, similarity, pairInfo){
	const posToNames = {'n':'Noun', 'v':'Verb', 'a':'Adjective', 'r': 'Adverb'};

	//Remove existing dialogue if it exists
	const oldInfo = document.getElementById('pairInfo');
	if(oldInfo != null){
		oldInfo.parentNode.removeChild(oldInfo);
	}

	//Build new dialogue box, make it float
	const dialogue = document.createElement('span');
	dialogue.id = 'pairInfo';
	const dialogueContent = document.createElement('table');
	dialogueContent.classList.add('dialogueBox');
	dialogueContent.style.left = position.x + 'px';
	dialogueContent.style.top = position.y + 'px';
	dialogueContent.cellSpacing = '0';
	dialogueContent.cellPadding = '0';

	if(pairInfo == null){
		//No path between any synsets containing the words
		const tmp = document.createElement('tr');
		const tmp2 = document.createElement('td');
		tmp2.insertAdjacentText('beforeend', 'No path between words.');
		tmp.appendChild(tmp2);

		dialogueContent.appendChild(tmp);
	}
	else{
		//Populate the dialogue with the synset path
		for(let synset of pairInfo){
			const tmp = document.createElement('tr');
			let tmp2 = document.createElement('td');
			tmp2.insertAdjacentText('beforeend', synset.words.toString());
			tmp.appendChild(tmp2);

			tmp2 = document.createElement('td');
			tmp2.insertAdjacentText('beforeend', '('+posToNames[synset.pos]+')');
			tmp.appendChild(tmp2);

			//reverse order of path, for consistency
			dialogueContent.insertAdjacentElement('afterbegin',tmp);
		}
	}

	//Add a way to close the dialogue
	const tmp = document.createElement('tr');
	let tmp2 = document.createElement('td');
	tmp2.insertAdjacentText('beforeend', 'Similarity: ' + similarity);
	tmp.appendChild(tmp2);

	tmp2 = document.createElement('td');
	tmp2.align = 'right';
	tmp2.classList.add('dialogueCloseContainer');
	const copyTable = document.createElement('input');
	copyTable.type = 'button';
	copyTable.title = 'Copy Dialogue Info';
	copyTable.classList.add('dialogueCopy');
	copyTable.onclick = function(){
		if(navigator.clipboard){
			navigator.clipboard.writeText(dialogueContent.innerText).then(
				function(){
					console.log('Clipboard success');
				},
				function(err){
					console.log('Clipboard failed with: ',err);
				});
		}
		else{
			const tempCopyArea = document.createElement('textarea');
			tempCopyArea.value = dialogueContent.innerText;
			tempCopyArea.classList.add('tempCopyArea');
			document.body.appendChild(tempCopyArea);
			tempCopyArea.focus();
			tempCopyArea.select();
			try{
				console.log('execCommand returned ',document.execCommand('copy'));
			}catch(err){
				console.log('execCommand failed with: ',err);
			}
			document.body.removeChild(tempCopyArea);
		}
	};
	tmp2.appendChild(copyTable);
	const closeTable = document.createElement('input');
	closeTable.type = 'button';
	closeTable.value = 'x';
	closeTable.title = 'Close Dialogue';
	closeTable.classList.add('dialogueClose');
	closeTable.onclick = function(){
		let theTable = document.getElementById('pairInfo');
		theTable.parentNode.removeChild(theTable);
		showRelation(null);
	};
	tmp2.appendChild(closeTable);
	tmp.appendChild(tmp2);
	dialogueContent.appendChild(tmp);

	//Add the dialogue to the page
	dialogue.appendChild(dialogueContent);
	document.body.appendChild(dialogue);
}
