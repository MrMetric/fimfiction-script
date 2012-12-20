// ==UserScript==
// @name        Fimfiction Emote Extender
// @namespace   ffemoteextender
// @description Adds additional emotes to fimfiction.net.
// @include     http*://www.fimfiction.net/*
// @include     http*://fimfiction.net/*
// @grant       none
// @require		https://github.com/iloveportalz0r/fimfiction-script/raw/master/emoteHandler.js
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @version     1.0
// ==/UserScript==

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false);
    run();
},false);

function run() {
	
	initializeAPI();
	
	$.getScript("https://github.com/iloveportalz0r/fimfiction-script/raw/master/RemoteEmotes.js", function(){
	   
		var emotes = fetchAndAddEmotes();
	   
		for (var i = 0; i < emotes.length; i++) {
			addEmote(emotes[i][0], emotes[i][1]);
		}
		
	});

}