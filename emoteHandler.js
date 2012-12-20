/*
*	Fimfiction.net emote API Script
*	Written by: iloveportalz0r and KrazyTheFox
*
*	Version: 1.0a
*	
*	Usage:	@require this script in your Greasemonkey scripts
*			Use addEmote("image url", "table name"); to add an emote
*/

var initialized = false;
var emoteTables = [];
var commentBox;
var tabContainer;
var emotePanel;

function addEmote(url, tableName) {
	
	if (!initialized) {
		initialize();
	}
	
	if (emoteTables[tableName] != undefined) {
		createNewEmote(url, tableName);
	} else {
		createNewEmoteTable(tableName);
		createNewEmote(url, tableName);
	}
	
}

function initialize() {
	
	initialized = true;
	
	commentBox = document.getElementById('comment_comment');
	
	//Grab fimfiction's emote panel div and store it
	var emoticonsPanel = document.getElementsByClassName('emoticons_panel');
	
	for(var i = 0; i < emoticonsPanel.length; i++) {
		emotePanel = emoticonsPanel[i];
	}
	
	//Store the default emote table and give it an id
	var defaultEmoteTable = emotePanel.firstChild;
	defaultEmoteTable.setAttribute('id', "defaultemotetable");
	emoteTables["defaultEmoteTable"] = defaultEmoteTable;
	
	emotePanel.style.paddingTop = '15px';
	
	tabContainer = document.createElement('div');
	tabContainer.style.marginLeft = '12px';
	tabContainer.style.marginTop = '0px';
	tabContainer.style.width = '279px';
	emotePanel.insertBefore(tabContainer, emotePanel.firstChild);
	
	var defaultTableLink = document.createElement('span');
	defaultTableLink.setAttribute('class', "emoteTabButton");
	defaultTableLink.setAttribute('id', "defaultEmoteTable");
	defaultTableLink.style.marginLeft = '5px';
	defaultTableLink.style.marginTop = '5px';
	defaultTableLink.innerHTML = "defaultEmoteTable";
	defaultTableLink.addEventListener("click", function() { showTable(this.id); }, false); 
	tabContainer.appendChild(defaultTableLink);	
	
}

function createNewEmoteTable(tableName) {
	
	var emoteTable = document.createElement('div');
	emoteTable.style.display = 'none';
	emoteTable.style.margin = '10px';
	emoteTable.style.marginTop = '0px';
	emoteTable.setAttribute('id', tableName);
	
	emoteTables[tableName] = emoteTable;
	
	emotePanel.appendChild(emoteTable);
	
}

function createNewEmote(url, tableName) {
	
	var image = document.createElement('img');
	image.setAttribute('src', url);
	image.setAttribute('id', url);
	image.setAttribute('class', "customEmote");
	image.setAttribute('width', "54");
	image.setAttribute('height', "54");
	image.style.margin = '5px';
	//image.addEventListener("click", function() { addAnEmote(this.id); }, false);
	emoteTables[tableName].appendChild(image);
	
}

function showTable(tableName) {
	
	alert("Showing table: " + tableName);
	
}

function addStyle(style) {
	var head = document.getElementsByTagName("HEAD")[0];
	var ele = head.appendChild(document.createElement('style'));
	ele.innerHTML = style;
	return ele;
}