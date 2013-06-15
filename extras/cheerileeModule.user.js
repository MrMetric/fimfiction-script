// ==UserScript==
// @name        Fimfiction Emote Extender: Cheerilee Module
// @namespace   ffemoteextendercheerilee
// @description Adds additional emotes to fimfiction.net.
// @include     http*://www.fimfiction.net/*
// @include     http*://fimfiction.net/*
// @grant       none
// @require		https://github.com/iloveportalz0r/fimfiction-script/raw/master/emoteHandler.js
// @version     1.0
// ==/UserScript==

$(document).ready(run);

function run() {
	
	initializeAPI();
	
	if (Site.page ==  PAGE.GROUPTHREAD || Site.page == PAGE.GROUP) {
		
		var emotes = [
			["http://i.imgur.com/IdiNEoG.png", "CHR"],
			["http://i.imgur.com/zi55aHB.png", "CHR"],
			["http://i.imgur.com/Z9dmrsL.png", "CHR"],
			["http://i.imgur.com/etvChCJ.png", "CHR"],
			["http://i.imgur.com/4CT6FFE.png", "CHR"],
			["http://i.imgur.com/sqalbWn.png", "CHR"],
			["http://i.imgur.com/rRAQgvt.png", "CHR"],
			["http://i.imgur.com/8uzdXWe.png", "CHR"],
			["http://i.imgur.com/PsTsg73.png", "CHR"],
			["http://i.imgur.com/7OlsrI3.png", "CHR"],
			["http://i.imgur.com/PC1vZ9r.png", "CHR"]
		];
		
		for (var i = 0; i < emotes.length; i++) {
			addEmote(emotes[i][0], emotes[i][1]);
		}
		
	}
	
}