/*
 *	Fimfiction.net emote API Script
 *	Written by: iloveportalz0r and KrazyTheFox
 *
 *	Version: 1.0a
 *
 *	Usage:	@require this script in your Greasemonkey scripts
 *			Use addEmote("image url", "table name"); to add an emote
 */

/*jshint multistr:true*/
/*global Components:true, escape:true*/

"use strict";

// Utility stuff

function logg(msg)
{
	console.log(msg);
}

window.onerror = function(message, url, line)
{
	logg(message + " @ " + line);
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

function isNumber(n)
{
	return !isNaN(parseFloat(n)) && isFinite(n);
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

var PAGE = {
	OTHER:			{value: -1, name: "Other"},
	MAIN:			{value:  0, name: "Main"},
	SCRIPTSETTINGS:	{value:  1, name: "Script Settings"},
	BLOG:			{value:  2, name: "Blog"},
	BLOGEDIT:		{value:  3, name: "Blog Editor"},
	MANAGEBLOG:		{value:  4, name: "Manage Blog"},
	GROUP:			{value:  5, name: "Group"},
	GROUPTHREAD:	{value:  6, name: "Group Thread"},
	NOTIFICATIONS:	{value:  7, name: "Notifications"},
	USER:			{value:  8, name: "User"},
	STORY:			{value:  9, name: "Story"},
	CHAPTER:		{value: 10, name: "Chapter"},
	BANNERCREDITS:	{value: 11, name: "Banner Credits"}
};

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

var initialized = false,
	emoteTables = [],
	commentBox,
	tabContainer,
	emotePanel,
	hasEmotePanel = false,
	tablePrefix = "emoteAPI_Table:";

function addEmote(url, tableName)
{
	if(initialized && hasEmotePanel)
	{
		if(emoteTables[tablePrefix + tableName] != undefined)
		{
			createNewEmote(url, tableName, tableName);
		}
		else
		{
			createNewEmoteTable(tableName, tableName);
			createNewEmote(url, tableName, tableName);
		}
	}
}

function initializeAPI(m)
{
	if(initialized)
	{
		return;
	}
	initialized = true;

	if(typeof m === "undefined" || m == null || m < 0 || m > 1)
	{
		m = 0;
	}
	Site.mode = m; // emoticon mode

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
			logg("jQuery not found");
		}
	}

	Site.username = "";
	Site.userid = -1;

	// TODO: Detect main page
	/*if()
	{
		Site.page = PAGE.MAIN;
	}
	else*/ if(/\/manage_user\/scriptsettings/.test(location.href))
	{
		Site.page = PAGE.SCRIPTSETTINGS;
	}
	else if(/\/blog\//.test(location.href))
	{
		Site.page = PAGE.BLOG;
	}
	else if(/\/manage_user\/edit_blog_post/.test(location.href))
	{
		Site.page = PAGE.BLOGEDIT;
	}
	else if(/\/group\//.test(location.href))
	{
		if(/\/thread\//.test(location.href))
		{
			Site.page = PAGE.GROUPTHREAD;
		}
		else
		{
			Site.page = PAGE.GROUP;
		}
	}
	else if(/view=group/.test(location.href) && /thread=/.test(location.href))
	{
		Site.page = PAGE.GROUPTHREAD;
	}
	else if(/\/manage_user\/notifications/.test(location.href))
	{
		Site.page = PAGE.NOTIFICATIONS;
	}
	else if(/\/user\//.test(location.href))
	{
		Site.page = PAGE.USER;
	}
	else if(/\/story\//.test(location.href))
	{
		if(document.getElementById("chapter_format") != null)
		{
			Site.page = PAGE.CHAPTER;
		}
		else
		{
			Site.page = PAGE.STORY;
		}
	}
	else if(/\/chapter\//.test(location.href))
	{
		Site.page = PAGE.CHAPTER;
	}
	else if(/page=banner_credits/.test(location.href))
	{
		Site.page = PAGE.BANNERCREDITS;
	}
	else if(/\/manage_user\/blog/.test(location.href))
	{
		Site.page = PAGE.MANAGEBLOG;
	}
	else
	{
		Site.page = PAGE.OTHER;
	}
	logg("Detected page: " + Site.page.name);

	var style = "";

	style += ".emoticons_panel {";
	if(Site.mode === 0)
	{
		style += "	height: auto !important;";
		style += "	min-height: 300px !important;";
		style += "	display: block !important;";
	}
	else if(Site.mode === 1)
	{
		style += "	overflow: auto;";
	}
	style += "}";

	if(Site.mode === 0)
	{
		style += ".customEmote {";
		style += "	opacity: 0.7;";
		style += "	transition: opacity .2s ease-out;";
		style += "	-moz-transition: opacity .2s ease-out;";
		style += "	-webkit-transition: opacity .2s ease-out;";
		style += "	-o-transition: opacity .2s ease-out;";
		style += "	-webkit-touch-callout: none;";
		style += "	-webkit-user-select: none;";
		style += "	-khtml-user-select: none;";
		style += "	-moz-user-select: none;";
		style += "	-ms-user-select: none;";
		style += "	user-select: none;";
		style += "}";

		style += ".customEmote:hover {";
		style += "	opacity: 1;";
		style += "	transition: opacity .2s ease-in;";
		style += "	-moz-transition: opacity .2s ease-in;";
		style += "	-webkit-transition: opacity .2s ease-in;";
		style += "	-o-transition: opacity .2s ease-in;";
		style += "	cursor: pointer;";
		style += "}";

		style += ".emoteTabButton {";
		style += "	width: 32px;";
		style += "	height: 23px;";
		style += "	background-image: url(\"http://i.imgur.com/p8O1R.png\");";
		style += "	float: left;";
		style += "	text-align: center;";
		style += "	padding-top: 5px;";
		style += "	font: 13px normal \"Segoe UI\" !important;";
		style += "	-webkit-touch-callout: none;";
		style += "	-webkit-user-select: none;";
		style += "	-khtml-user-select: none;";
		style += "	-moz-user-select: none;";
		style += "	-ms-user-select: none;";
		style += "	user-select: none;";
		style += "	opacity: 1;";
		style += "	transition: opacity .2s ease-in;";
		style += "	-moz-transition: opacity .2s ease-in;";
		style += "	-webkit-transition: opacity .2s ease-in;";
		style += "	-o-transition: opacity .2s ease-in;";
		style += "	color: #ffffff";
		style += "}";

		style += ".emoteTabButton:hover {";
		style += "	cursor: pointer;";
		style += "	opacity: 0.8;";
		style += "	transition: opacity .2s ease-out;";
		style += "	-moz-transition: opacity .2s ease-out;";
		style += "	-webkit-transition: opacity .2s ease-out;";
		style += "	-o-transition: opacity .2s ease-out;";
		style += "}";
	}

	style += ".inner_padding {";
	style += "	margin-top: 0px !important;";
	style += "}";

	GM_addStyle(style);

	commentBox = document.getElementById("comment_comment");
	//Grab FiMFiction's emote panel div and store it
	var emoticonsPanel = document.getElementsByClassName("emoticons_panel");
	if(emoticonsPanel != null && emoticonsPanel.length > 0)
	{
		hasEmotePanel = true;
		for(var i = 0; i < emoticonsPanel.length; i++)
		{
			emotePanel = emoticonsPanel[i];
		}
		var tableOffset = 0;
		if(Site.page !== PAGE.STORY && Site.page !== PAGE.CHAPTER && Site.page !== PAGE.BLOG)
		{
			tableOffset = 2;
		}
		else
		{
			tableOffset = 1;
		}
		//Store the default emote table and give it an id
		var defaultEmoteTable = emotePanel.childNodes[emotePanel.childNodes.length - tableOffset];
		emoteTables[tablePrefix + "FF"] = defaultEmoteTable;
		emotePanel.style.paddingTop = "15px";

		tabContainer = document.createElement("div");
		tabContainer.style.marginLeft = "12px";
		tabContainer.style.marginTop = "0px";
		tabContainer.style.float = "left";
		tabContainer.style.clear = "both";
		tabContainer.style.width = "279px";
		emotePanel.insertBefore(tabContainer, emotePanel.firstChild);

		defaultEmoteTable.style.float = "left";
		defaultEmoteTable.style.clear = "both";
		defaultEmoteTable.style.paddingTop = "20px";

		tabContainer.appendChild(createTableLink("FF"));

		setTimeout(function()
		{
			commentBox.style.minHeight = commentBox.style.height = (emotePanel.offsetHeight + 1) + 'px';
		}, 1);
	}
}

function createNewEmoteTable(tableName, shortTableName)
{
	if(initialized && hasEmotePanel)
	{
		logg("Creating emoticon table: " + tableName + "(" + shortTableName + ")");
		var emoteTable = document.createElement("div");
		emoteTable.style.display = "none";
		emoteTable.style.margin = "10px";
		emoteTable.style.paddingTop = "20px";
		emoteTable.style.float = "left";
		emoteTable.style.clear = "both";
		emoteTable.style.textAlign = "center";
		emoteTables[tablePrefix + shortTableName] = emoteTable;
		emotePanel.appendChild(emoteTable);

		tabContainer.appendChild(createTableLink(shortTableName));
	}
}

function createNewEmote(url, emoteName, tableName)
{
	if(initialized && hasEmotePanel)
	{
		logg("Adding emoticon: " + url + " (" + emoteName + ") to " + tableName);
		var image = document.createElement("img");
		image.src = url;
		if(Site.mode === 0)
		{
			image.width = '58';
			image.height = '58';
			image.id = url;
		}
		else
		{
			image.id = emoteName.toLowerCase().replace(" ", "_");
		}
		image.title = emoteName;
		image.className = "customEmote";
		image.style.margin = "5px";
		image.addEventListener("click", function() { addEmoteToCommentBox(this.id); }, false);
		emoteTables[tablePrefix + tableName].appendChild(image);
	}
}

function createTableLink(tableName)
{
	if(initialized && hasEmotePanel)
	{
		var tableLink = document.createElement("span");
		tableLink.className = "emoteTabButton";
		tableLink.id = tablePrefix + tableName;
		tableLink.style.marginLeft = "5px";
		tableLink.style.marginTop = "5px";
		tableLink.innerHTML = tableName;
		tableLink.addEventListener("click", function()
		{
			showTable(this.id);
		}, false);

		return tableLink;
	}
	return null;
}

function showTable(tableID)
{
	if(initialized && hasEmotePanel)
	{
		emoteTables[tableID].style.display = "block";

		setTimeout(function()
		{
			commentBox.style.minHeight = commentBox.style.height = (emotePanel.offsetHeight + 1) + "px";
		}, 1);

		for(var table in emoteTables)
		{
			if(emoteTables.hasOwnProperty(table))
			{
				if(emoteTables[table] != emoteTables[tableID])
				{
					emoteTables[table].style.display = "none";
				}
			}
		}
	}
}

function addEmoteToCommentBox(url)
{
	replaceSelectedText(commentBox, "[img]" + url + "[/img]");
}

function getInputSelection(el)
{
	var _start = 0, _end = 0, normalizedValue, range,
		textInputRange, len, endRange;

	if(typeof el.selectionStart === "number" && typeof el.selectionEnd === "number")
	{
		_start = el.selectionStart;
		_end = el.selectionEnd;
	}
	else
	{
		range = document.selection.createRange();

		if(range && range.parentElement() == el)
		{
			len = el.value.length;
			normalizedValue = el.value.replace(/\r\n/g, "\n");

			textInputRange = el.createTextRange();
			textInputRange.moveToBookmark(range.getBookmark());

			endRange = el.createTextRange();
			endRange.collapse(false);

			if(textInputRange.compareEndPoints("StartToEnd", endRange) > -1)
			{
				_start = _end = len;
			}
			else
			{
				_start = -textInputRange.moveStart("character", -len);
				_start += normalizedValue.slice(0, _start).split("\n").length - 1;

				if(textInputRange.compareEndPoints("EndToEnd", endRange) > -1)
				{
					_end = len;
				}
				else
				{
					_end = -textInputRange.moveEnd("character", -len);
					_end += normalizedValue.slice(0, _end).split("\n").length - 1;
				}
			}
		}
	}

	return {
		start: _start,
		end: _end
	};
}

function replaceSelectedText(el, text)
{
	var sel = getInputSelection(el), val = el.value;
	el.value = val.slice(0, sel.start) + text + val.slice(sel.end);
}

Object.size = function(obj)
{
	var size = 0, key;
	for(key in obj)
	{
		if(obj.hasOwnProperty(key))
		{
			size++;
		}
	}
	return size;
};
