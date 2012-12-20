/*
 *	Fimfiction.net emote API Script
 *	Written by: iloveportalz0r and KrazyTheFox
 *
 *	Version: 1.0a
 *
 *	Usage:	@require this script in your Greasemonkey scripts
 *			Use addEmote("image url", "table name"); to add an emote
 */

"use strict";

// Utility stuff

function logg(msg)
{
	console.log(msg);
}

// from http://stackoverflow.com/questions/1622145/how-can-i-mimic-greasemonkey-firefoxs-unsafewindow-functionality-in-chrome
var bGreasemonkeyServiceDefined = false;
try
{
	if(typeof Components.interfaces.gmIGreasemonkeyService === "object")
	{
		bGreasemonkeyServiceDefined = true;
	}
}
catch(err){}
if(typeof unsafeWindow === "undefined" || !bGreasemonkeyServiceDefined)
{
	unsafeWindow = (function()
	{
		var dummyElem = document.createElement("p");
		dummyElem.setAttribute("onclick", "return window;");
		return dummyElem.onclick();
	})();
}

// Add jQuery
if(typeof $ === "undefined")
{
	if(typeof unsafeWindow.jQuery !== "undefined")
	{
		var $ = unsafeWindow.jQuery;
	}
	else
	{
		// TODO: Error handling
	}
}

function stringToBool(s)
{
	if(typeof s === "boolean")
	{
		return s;
	}
	switch(s)
	{
		case "true": return true;
		case "false": return false;
		default: return null;
	}
}

// GM function replacements are from https://raw.github.com/gist/3123124

function GM_addStyle(aCss)
{
	var head = document.getElementsByTagName("head")[0];
	if(head)
	{
		var stylenode = document.createElement("style");
		stylenode.type = "text/css";
		stylenode.textContent = aCss;
		head.appendChild(stylenode);
		return stylenode;
	}
	return null;
}

var GM_STORAGE_PREFIX = "FFE_";

// All of the GM_*Value methods rely on DOM Storage's localStorage facility.
// They work like always, but the values are scoped to a domain, unlike the
// original functions. The content page's scripts can access, set, and
// delete these values.

function GM_deleteValue(aKey)
{
	localStorage.removeItem(GM_STORAGE_PREFIX + aKey);
}

function GM_getValue(aKey, aDefault)
{
	var value = localStorage.getItem(GM_STORAGE_PREFIX + aKey);
	if(value == null && typeof aDefault !== "undefined")
	{
		value = aDefault;
	}
	var boolValue = stringToBool(value);
	if(boolValue != null)
	{
		value = boolValue;
	}
	logg("getValue returned " + value + " for " + aKey);
	return value;
}

function GM_setValue(aKey, aVal)
{
	localStorage.setItem(GM_STORAGE_PREFIX + aKey, aVal);
	logg("Set " + aKey + " to " + aVal);
}

var Site = {
	setTitle: function(title)
	{
		unsafeWindow.title_cache = title + " - FiMFiction.net";
		document.title = unsafeWindow.title_cache;
		logg("Set page title: "+title);
	},
	// from general_scripts.js
	setCookie: function(c_name, value, exdays)
	{
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + (exdays == null?"":"; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value + ";path=/";
	}
};

// End utility stuff

var initialized = false;
var emoteTables = [];
var commentBox;
var tabContainer;
var emotePanel;

function addEmote(url, tableName)
{
	if(!initialized)
	{
		initialize();
	}
	if(emoteTables[tableName] != undefined)
	{
		createNewEmote(url, tableName);
	}
	else
	{
		createNewEmoteTable(tableName);
		createNewEmote(url, tableName);
	}
}

function initialize()
{
	initialized = true;
	commentBox = document.getElementById("comment_comment");
	//Grab fimfiction's emote panel div and store it
	var emoticonsPanel = document.getElementsByClassName("emoticons_panel");
	for(var i = 0; i < emoticonsPanel.length; i++)
	{
		emotePanel = emoticonsPanel[i];
	}
	//Store the default emote table and give it an id
	var defaultEmoteTable = emotePanel.firstChild;
	defaultEmoteTable.id = "defaultemotetable";
	emoteTables["defaultEmoteTable"] = defaultEmoteTable;
	emotePanel.style.paddingTop = "15px";
	tabContainer = document.createElement("div");
	tabContainer.style.marginLeft = "12px";
	tabContainer.style.marginTop = "0px";
	tabContainer.style.width = "279px";
	emotePanel.insertBefore(tabContainer, emotePanel.firstChild);
	var defaultTableLink = document.createElement("span");
	defaultTableLink.className = "emoteTabButton";
	defaultTableLink.id = "defaultEmoteTable";
	defaultTableLink.style.marginLeft = "5px";
	defaultTableLink.style.marginTop = "5px";
	defaultTableLink.innerHTML = "defaultEmoteTable";
	defaultTableLink.addEventListener("click", function ()
	{
		showTable(this.id);
	}, false);
	tabContainer.appendChild(defaultTableLink);
}

function createNewEmoteTable(tableName)
{
	var emoteTable = document.createElement("div");
	emoteTable.style.display = "none";
	emoteTable.style.margin = "10px";
	emoteTable.style.marginTop = "0px";
	emoteTable.id = tableName;
	emoteTables[tableName] = emoteTable;
	emotePanel.appendChild(emoteTable);
}

function createNewEmote(url, tableName)
{
	var image = document.createElement("img");
	image.src = url;
	image.id = url;
	image.className = "customEmote";
	image.width = "54";
	image.height = "54";
	image.style.margin = "5px";
	//image.addEventListener("click", function() { addAnEmote(this.id); }, false);
	emoteTables[tableName].appendChild(image);
}

function showTable(tableName)
{
	alert("Showing table: " + tableName);
}
