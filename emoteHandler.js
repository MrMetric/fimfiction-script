/*
 *	Fimfiction.net emote API Script
 *	Written by: iloveportalz0r and KrazyTheFox
 *
 *	Version: 1.0a
 *
 *	Usage:	@require this script in your Greasemonkey scripts
 *			Use addEmote("image url", "table name"); to add an emote
 */

/*jshint multistr: true*/

"use strict";

// Utility stuff

function logg(msg)
{
	console.log(msg);
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

var PAGE = {
	OTHER:			{value: -1, name: "Other"},
	MAIN:			{value: 0, name: "Main"},
	SCRIPTSETTINGS:	{value: 1, name: "Script Settings"},
	BLOG:			{value: 2, name: "Blog"},
	BLOGEDIT:		{value: 3, name: "Blog Editor"},
	GROUP:			{value: 4, name: "Group"},
	GROUPTHREAD:	{value: 5, name: "Group Thread"},
	NOTIFICATIONS:	{value: 6, name: "Notifications"},
	USER:			{value: 7, name: "User"},
	STORY:			{value: 8, name: "Story"},
	BANNERCREDITS:	{value: 9, name: "Banner Credits"},
	MANAGEBLOG:		{value:10, name: "Manage Blog"}
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

var initialized = false;
var emoteTables = [];
var commentBox;
var tabContainer;
var emotePanel;
var tablePrefix = "emoteAPI_Table:";

function addEmote(url, tableName)
{
	if(emoteTables[tablePrefix + tableName] != undefined)
	{
		createNewEmote(url, tableName);
	}
	else
	{
		createNewEmoteTable(tableName);
		createNewEmote(url, tableName);
	}
}

function initializeAPI()
{
	if(initialized)
	{
		return;
	}
	initialized = true;

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

	/*if()
	{
		Site.page = PAGE.MAIN;
	}
	else*/ if(/manage_user\/scriptsettings/.test(self.location.href))
	{
		Site.page = PAGE.SCRIPTSETTINGS;
	}
	else if(/blog\//.test(self.location.href))
	{
		Site.page = PAGE.BLOG;
	}
	else if(/manage_user\/edit_blog_post/.test(self.location.href))
	{
		Site.page = PAGE.BLOGEDIT;
	}
	/*else if()
	{
		Site.page = PAGE.GROUP;
	}*/
	else if(/view=group/.test(self.location.href) && /thread=/.test(self.location.href))
	{
		Site.page = PAGE.GROUPTHREAD;
	}
	else if(/manage_user\/notifications/.test(self.location.href))
	{
		Site.page = PAGE.NOTIFICATIONS;
	}
	else if(/\/user\//.test(self.location.href))
	{
		Site.page = PAGE.USER;
	}
	else if(/story\//.test(self.location.href) || /chapter\//.test(self.location.href))
	{
		Site.page = PAGE.STORY;
	}
	else if(/page=banner_credits/.test(self.location.href))
	{
		Site.page = PAGE.BANNERCREDITS;
	}
	else if(/manage_user\/blog/.test(self.location.href))
	{
		Site.page = PAGE.MANAGEBLOG;
	}
	else
	{
		Site.page = PAGE.OTHER;
	}

	var style = "";

	style += ".emoticons_panel {";
	style += "	height: auto !important;";
	style += "	min-height: 300px !important;";
	style += "	display: block !important;";
	style += "}";

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

	style += ".inner_padding {";
	style += "	margin-top: 0px !important;";
	style += "}";

	GM_addStyle(style);

	commentBox = document.getElementById("comment_comment");
	//Grab FiMFiction's emote panel div and store it
	var emoticonsPanel = document.getElementsByClassName("emoticons_panel");
	for(var i = 0; i < emoticonsPanel.length; i++)
	{
		emotePanel = emoticonsPanel[i];
	}
	var tableOffset = 0;
	if(Site.page != PAGE.STORY && Site.page != PAGE.BLOG)
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

function createNewEmoteTable(tableName)
{
	var emoteTable = document.createElement("div");
	emoteTable.style.display = "none";
	emoteTable.style.margin = "10px";
	emoteTable.style.paddingTop = "20px";
	emoteTable.style.float = "left";
	emoteTable.style.clear = "both";
	emoteTables[tablePrefix + tableName] = emoteTable;
	emotePanel.appendChild(emoteTable);

	tabContainer.appendChild(createTableLink(tableName));
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
	image.addEventListener("click", function() { addEmoteToCommentBox(this.id); }, false);
	emoteTables[tablePrefix + tableName].appendChild(image);
}

function createTableLink(tableName)
{
	var tableLink = document.createElement("span");
	tableLink.className = "emoteTabButton";
	tableLink.id = tablePrefix + tableName;
	tableLink.style.marginLeft = "5px";
	tableLink.style.marginTop = "5px";
	tableLink.innerHTML = tableName;
	tableLink.addEventListener("click", function ()
	{
		showTable(this.id);
	}, false);

	return tableLink;
}

function showTable(tableID)
{
	emoteTables[tableID].style.display = "block";

	setTimeout(function()
	{
		commentBox.style.minHeight = commentBox.style.height = (emotePanel.offsetHeight + 1) + 'px';
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
