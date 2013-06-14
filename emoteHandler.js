/*
 *	Fimfiction.net emote API Script
 *	Written by: iloveportalz0r and KrazyTheFox
 *
 *	Version: 1.1
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

top.initialized = false;
top.emoteTables = [];
top.txtToAdd = []; // HTML to append (mode 1)
top.commentBox;
top.tabContainer;
top.emotePanel;
top.hasEmotePanel = false;
top.tablePrefix = "emoteAPI_Table:";

function addEmote(url, tableName)
{
	if(top.initialized && top.hasEmotePanel)
	{
		if(Site.mode == 0)
		{
			if(top.emoteTables[top.tablePrefix + tableName] != undefined)
			{
				createNewEmote(url, tableName, tableName);
			}
			else
			{
				createNewEmoteTable(tableName, tableName);
				createNewEmote(url, tableName, tableName);
			}
		}
		// TODO: Handle mode 1
	}
}

function initializeAPI(m)
{

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
	
	if(top.initialized)
	{
		return;
	}
	
	top.initialized = true;

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
		style += "	background-image: url(\"//dl.dropbox.com/u/31471793/FiMFiction/script/buttonBG.png\");";
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

	top.commentBox = document.getElementById("comment_comment");
	//Grab FiMFiction's emote panel div and store it
	var emoticonsPanel = document.getElementsByClassName("emoticons_panel");
	if(emoticonsPanel != null && emoticonsPanel.length > 0)
	{
		top.hasEmotePanel = true;
		for(var i = 0; i < emoticonsPanel.length; i++)
		{
			top.emotePanel = emoticonsPanel[i];
		}
		if(Site.mode == 0)
		{
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
			var defaultEmoteTable = top.emotePanel.childNodes[top.emotePanel.childNodes.length - tableOffset];
			top.emoteTables[top.tablePrefix + "FF"] = defaultEmoteTable;
			top.emotePanel.style.paddingTop = "15px";

			top.tabContainer = document.createElement("div");
			top.tabContainer.style.marginLeft = "12px";
			top.tabContainer.style.marginTop = "0px";
			top.tabContainer.style.float = "left";
			top.tabContainer.style.clear = "both";
			top.tabContainer.style.width = "279px";
			top.emotePanel.insertBefore(top.tabContainer, top.emotePanel.firstChild);

			defaultEmoteTable.style.float = "left";
			defaultEmoteTable.style.clear = "both";
			defaultEmoteTable.style.paddingTop = "20px";

			top.tabContainer.appendChild(createTableLink("FF"));

			setTimeout(function()
			{
				top.commentBox.style.minHeight = top.commentBox.style.height = (top.emotePanel.offsetHeight + 1) + 'px';
			}, 1);
		}
	}
}

function createNewEmoteTable(tableName, shortTableName, panelID)
{
	if(top.initialized && top.hasEmotePanel)
	{
		logg("Creating emoticon table: " + tableName + "(" + shortTableName + ")" + " for panel #" + panelID);
		if(Site.mode == 0)
		{
			var emoteTable = document.createElement("div");
			emoteTable.style.display = "none";
			emoteTable.style.margin = "10px";
			emoteTable.style.paddingTop = "20px";
			emoteTable.style.float = "left";
			emoteTable.style.clear = "both";
			emoteTable.style.textAlign = "center";
			top.emoteTables[top.tablePrefix + shortTableName] = emoteTable;
			top.emotePanel.appendChild(emoteTable);
			top.tabContainer.appendChild(createTableLink(shortTableName));
		}
		else if(Site.mode == 1)
		{
			top.emoteTables.push(shortTableName);
			var open = (tableName === "Default"); // TODO
			top.txtToAdd[top.emoteTables.indexOf(shortTableName)] = '<a id="ehl_' + shortTableName  + '_' + panelID + '"><span id="ehs_' + shortTableName + '_' + panelID + '">' +
				(open?"▼":"▶") + '<i>' + tableName + '</i>' + (open?":":"&nbsp;") +
				'</a></span><br><div id="ehd_' + shortTableName + '_' + panelID + '" style="display:' + (open?"inherit":"none") + ';">';
		}
	}
}

function createNewEmote(url, emoteName, shortTableName)
{
	if(top.initialized && top.hasEmotePanel)
	{
		logg("Adding emoticon: " + url + " (" + emoteName + ") to " + shortTableName);
		if(Site.mode == 0)
		{
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
			top.emoteTables[top.tablePrefix + shortTableName].appendChild(image);
		}
		else if(Site.mode == 1)
		{
			if(shortTableName == "FF")
			{
				top.txtToAdd[top.emoteTables.indexOf(shortTableName)] += '<a href="javascript:smilie(\':' + url + ':\');" title="' + emoteName +
					'"><img style="margin:1px;" src="//www.fimfiction-static.net/images/emoticons/' + url + '.png" alt="' + emoteName + '" title="' + emoteName + '"></a>&nbsp;';
			}
			else
			{
				top.txtToAdd[top.emoteTables.indexOf(shortTableName)] += '<a href="javascript:smilie(\'[img]' + url + '[/img]\');" title="' + emoteName +
					'"><img style="margin:1px;" src="' + url + '" alt="' + emoteName + '" title="' + emoteName + '"></a>';
			}
		}
	}
}

function createTableLink(tableName)
{
	if(top.initialized && top.hasEmotePanel)
	{
		var tableLink = document.createElement("span");
		tableLink.className = "emoteTabButton";
		tableLink.id = top.tablePrefix + tableName;
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
	if(top.initialized && top.hasEmotePanel)
	{
		top.emoteTables[tableID].style.display = "block";

		setTimeout(function()
		{
			top.commentBox.style.minHeight = top.commentBox.style.height = (top.emotePanel.offsetHeight + 1) + "px";
		}, 1);

		for(var table in top.emoteTables)
		{
			if(top.emoteTables.hasOwnProperty(table))
			{
				if(top.emoteTables[table] != top.emoteTables[tableID])
				{
					top.emoteTables[table].style.display = "none";
				}
			}
		}
	}
}

function addEmotes(panelID)
{
	var text = (Site.page !== PAGE.BLOGEDIT?"<b>Do not post more than 20 emoticons at once</b><br>":"");
	for(var t = 0; t < top.emoteTables.length; ++t)
	{
		text += top.txtToAdd[t] + "</div>";
	}
	top.txtToAdd.splice(0, top.txtToAdd.length); // clear array

	top.emotePanel.getElementsByClassName("inner_padding")[0].innerHTML = text;

	for(var t = 0; t < top.emoteTables.length; ++t)
	{
		var table = document.getElementById("ehl_" + top.emoteTables[t] + "_" + panelID);
		(function(shortTableName, pID)
		{
			table.addEventListener("click", function()
			{
				toggleTable(shortTableName, pID);
			}, false);
		})(top.emoteTables[t], panelID);
	}

	top.emoteTables.splice(0, top.emoteTables.length); // clear array

	logg("Added emoticons for panel #" + panelID);
}

// TODO: Save open/closed
function toggleTable(shortTableName, panelID)
{
	var spanid = "ehs_" + shortTableName + "_" + panelID,
		span = document.getElementById(spanid);
	if(span.innerHTML.indexOf("▶") !== -1)
	{
		span.innerHTML = span.innerHTML.replace("▶", "▼").replace("&nbsp;", ":");
		document.getElementById("ehd_" + shortTableName + "_" + panelID).style.display = "inherit";
		//eha[sID] = "1";
	}
	else if(span.innerHTML.indexOf("▼") !== -1)
	{
		span.innerHTML = span.innerHTML.replace("▼", "▶").replace(":", "&nbsp;");
		document.getElementById("ehd_" + shortTableName + "_" + panelID).style.display = "none";
		//eha[sID] = "0";
	}
	//GM_setValue("eha", eha.join(":"));
}

function addEmoteToCommentBox(url)
{
	replaceSelectedText(top.commentBox, "[img]" + url + "[/img]");
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
