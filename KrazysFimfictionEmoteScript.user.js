// ==UserScript==
// @name        Fimfiction Emote Extender
// @namespace   ffemoteextender
// @description Adds additional emotes to fimfiction.net.
// @include     http*://www.fimfiction.net/*
// @include     http*://fimfiction.net/*
// @grant       none
// @require		https://github.com/iloveportalz0r/fimfiction-script/raw/master/emoteHandler.js
// @version     1.0
// ==/UserScript==

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false);
    run();
},false);

function run() {
	
	initializeAPI();
	
	if (Site.page ==  PAGE.GROUPTHREAD || Site.page == PAGE.GROUP) {
	
		$.ajax({
			url: "http://www.krazyweb.net/fimfictionemotes/RemoteEmotes.js",
			success: loadEmotesFromRemoteScript,
			error: loadSecondaryScript,
			timeout: 1000, // 2 seconds timeout before error function will be called
			dataType: 'script',
			crossDomain: true
		});
	
	}
	
}

function loadEmotesFromRemoteScript() {
	
	var emotes = fetchAndAddEmotes();
			
	for (var i = 0; i < emotes.length; i++) {
		addEmote(emotes[i][0], emotes[i][1]);
	}
	
}

function loadSecondaryScript() {
	
	$.ajax({
		url: "http://www.krazyweb.net/fimfictionemotes/RemoteEmotes.js",
		success: loadEmotesFromRemoteScript,
		timeout: 1000, // 2 seconds timeout before error function will be called
		dataType: 'script',
		crossDomain: true
	});
	
}