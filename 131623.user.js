// ==UserScript==
// @name			FiMFiction Enhancements
// @description		More BBCode tag buttons + More emoticons + Some other crap
// @include			http*://www.fimfiction.net/*
// @include			http*://fimfiction.net/*
// @version			12
// @icon			https://dl.dropbox.com/u/31471793/FiMFiction/Luna_lolface.png
// @grant			none
// @require			https://github.com/iloveportalz0r/fimfiction-script/raw/master/emoteHandler.js
// @require			http://labs.abeautifulsite.net/jquery-miniColors/jquery.minicolors.js
// ==/UserScript==

/*jshint newcap:false, globalstrict:true, scripturl:false*/
/*global self:true, alert:true, prompt:true, unsafeWindow:true, escape:true, logg:true, Site:true, PAGE:true, GM_getValue:true, GM_setValue:true, GM_addStyle:true, initializeAPI:true, createNewEmoteTable:true, createNewEmote:true*/

"use strict";

logg("Starting Le Script");

initializeAPI(1);

// INFOCARD REPLACEMENT

var infocard_timeout = null;

function infocard_hover_over()
{
	if(infocard_timeout != null)
	{
		clearTimeout(infocard_timeout);
		infocard_timeout = null;
	}
	var link = $(this);
	var href = $(this).attr("href");
	infocard_timeout = setTimeout(function()
	{
		var expression = /\/user\/([^\/]*)$/;
		var matches = expression.exec(href);
		if(matches)
		{
			var show = false;
			if(typeof matches[1] !== 'undefined')
			{
				$("#infocard .infocard").html('<img src="//www.fimfiction-static.net/images/loading_white.gif" style="margin:10px;">');
				$("#infocard .infocard").load("/ajax/infocard_user.php?name=" + matches[1].replace(/ /g, "%20"));
				show = true;
			}
			if(show)
			{
				$("#infocard").addClass("infocard_visible");
				$("#infocard").css("left", link.offset().left + link.width() - 5);
				$("#infocard").css("top", link.offset().top - 30);
			}
		}
	}, 1000);
}

function infocard_hover_off()
{
	if(infocard_timeout != null)
	{
		clearTimeout(infocard_timeout);
		infocard_timeout = null;
	}
	if($(this).attr("href") != null && $(this).attr("href").match(/\/user\/(.*)/))
	{
		$("#infocard").removeClass("infocard_visible");
	}
}

$(document).off("mouseenter");
$(document).off("mouseleave");
$(document).on("mouseenter", "div.content a", infocard_hover_over);
$(document).on("mouseleave", "div.content a", infocard_hover_off);

// END

/*
.reu_basket
{
	position: absolute;
	left: 50%;
	margin-left: -222px;
	top: 0px;
	z-index: 0;
	display:none;
}
*/

var i = 0;
var addEmoticons = GM_getValue("addEmoticons", true);
var fullwidth = GM_getValue("fullWidth", false);
//var hideads = GM_getValue("hideAds", false);
var banner = GM_getValue("banner", "");
var userBanners = GM_getValue("userBanners", "");
//var errmsg502 = GM_getValue("errmsg502", "502 Bad Gateway");
//var characters = GM_getValue("characters", "7,11,9,10,8,12,45");
var eha = GM_getValue("eha", "1:0:0:0:0:0").split(":");
var error502 = (document.body.innerHTML.indexOf("<center><h1>502 Bad Gateway</h1></center>") !== -1);

// Fix void links
var anchors = document.getElementsByTagName("a");
for(i = 0; i < anchors.length; i++)
{
	if(anchors[i].href === "javascript:void()" || anchors[i].href === "javascript:void();")
	{
		anchors[i].href = "javascript:void(0);";
	}
}

var user_toolbar = document.getElementsByClassName("user_toolbar")[0];
if(user_toolbar != null)
{
	var innerdiv_ut = user_toolbar.getElementsByClassName("inner")[0];
	if(innerdiv_ut != null)
	{
		logg("Modifying user_toolbar");
		innerdiv_ut.innerHTML = '<a href="/" class="button"><img src="//www.fimfiction-static.net/images/icons/group.png" title="Home">Home</a> ' + innerdiv_ut.innerHTML;
		var dropdown_ut = innerdiv_ut.getElementsByClassName("menu_list")[0];
		if(dropdown_ut != null)
		{
			dropdown_ut.innerHTML = dropdown_ut.innerHTML.replace("Edit Account</a>					", 'Edit Account</a> <a href="/manage_user/avatar" class="button"><img src="//www.fimfiction-static.net/images/icons/image.png">Change Avatar</a>');
			dropdown_ut.innerHTML = dropdown_ut.innerHTML.replace("Groups</a>", 'Groups</a> <a class="button" href="/manage_user/scriptsettings"><img src="//www.fimfiction-static.net/images/icons/dashboard.png">Script Settings</a>');
			// The Blocked Users page is gone
			// <a class="button" href="/manage_user/blocked_users"><img src="//www.fimfiction-static.net/images/icons/error.png">Blocked Users</a>
			var vmt = dropdown_ut.getElementsByTagName("input")[0];
			if(vmt != null)
			{
				vmt.addEventListener("change", function()
				{
					if(vmt.checked)
					{
						vmt.checked = confirm("Please confirm that you are of legal age to read sexual or other adult content in your country by clicking OK. Click Cancel if this is not true.");
					}
					Site.setCookie("view_mature", vmt.checked, 10000);
				}, false);
			}
			if(Site.username === "")
			{
				var expression = /\/user\/([^\/]*)$/; // from general_scripts.js
				var matches = expression.exec(user_toolbar.getElementsByClassName("user_drop_down_menu")[0].getElementsByClassName("button")[0].href);
				if(matches != null && typeof matches[1] !== "undefined")
				{
					Site.username = matches[1];
					logg("Found username: " + Site.username);
				}
			}
		}
		logg("Done: user_toolbar");
	}
}

var sideMenu = document.getElementsByClassName("user_cp main")[0];
if(sideMenu != null)
{
	var sideTabs = sideMenu.getElementsByClassName("tabs")[0];
	if(sideTabs != null)
	{
		logg("Modifying side tabs");
		sideTabs.getElementsByClassName("tab")[0].getElementsByTagName("img")[0].src = "//www.fimfiction-static.net/images/icons/settings.png";
		sideTabs.innerHTML += '<a href="/manage_user/scriptsettings" class="tab'+((Site.page === PAGE.SCRIPTSETTINGS)?" tab_selected":"")+'"><img src="//www.fimfiction-static.net/images/icons/dashboard.png"> Script Settings</a>';
		logg("Done: side tabs");
	}
}

// TODO: Make this work
/*if(Site.page === PAGE.BLOG || Site.page === PAGE.STORY)
{
	var e_username = document.getElementById("comment_username");
	if(e_username != null && e_username.value != null && e_username.value !== "")
	{
		if(Site.username == null || Site.username === "")
		{
			Site.username = e_username.value;
			logg("Found username: " + Site.username);
		}
		e_username.style.display = "none";
		e_username.parentNode.getElementsByClassName("label")[0].style.display = "none";
		logg("Hid comment_username");
	}
//<ul><li><a href="#new_comment"><img src="//www.fimfiction-static.net/images/icons/comments.png" /> Post Comment</a></li><li><a class="refresh_comments" href="javascript:void()"><img src="//www.fimfiction-static.net/images/icons/switch.png" /> Refresh</a></li></ul><ul class="page_list" data-num_pages="1"><li><a href="javascript:void(0);" class="button_previous_comments">&#9664;</a></li><li><a href="#page/1";" data-page="1" class="selected_button">1</a></li><li><a href="javascript:void(0);" class="button_next_comments">&#9654;</a></li></ul><ul><li><a href="javascript:void()" class="comment_order " data-order="DESC">&#9660; Newest First</a></li><li><a href="javascript:void()" class="comment_order  selected_button" data-order="ASC">&#9650; Oldest First</a></li></ul>

	var page_lists = document.getElementsByClassName("page_list");
	if(page_lists[0] != null)
	{
		var page_list = page_lists[0];
		var start = 0;
		if(page_list.innerHTML.indexOf("Chapter") !== -1)
		{
			page_list = page_lists[2];
			start = 2;
		}
		logg("Page lists: " + page_lists.length);
		var pages = page_list.getAttribute("data-num_pages");
		logg("Comment pages: " + pages);
		for(i = start; i < page_lists.length; i++)
		{
			if(pages > 1)
			{
				page_lists[i].innerHTML += '<li><a href="javascript:void(0);" class="btnLoadAllPages">Load All</a></li>';
			}
			var load_all = page_lists[i].getElementsByClassName("btnLoadAllPages")[0];
			if(load_all != null)
			{
				logg("Adding event listener for loadAllPages [" + i + "]");
				load_all.addEventListener("click", function(){loadAllPages(pages);}, false);
			}
		}
	}
}

function loadAllPages(pages)
{
	var story_comments = document.getElementById("story_comments");
	if(story_comments != null)
	{
		var itemSpan = story_comments.getElementsByClassName("item")[0];
		var typeSpan = story_comments.getElementsByClassName("type")[0];
		if(itemSpan != null && typeSpan != null)
		{
			var item_id = itemSpan.innerHTML;
			var type = typeSpan.innerHTML;
			var comment_list = document.getElementsByClassName("comment_list")[0];
			if(comment_list != null)
			{
				var divsToAdd = "";
				for(i = 1; i < pages + 1; i++)
				{
					divsToAdd += '<div id="page_' + i + '"><b>Page ' + i + ' is not yet loaded</b></div>';
				}
				comment_list.innerHTML = divsToAdd;
				var scriptnode = document.createElement("script");
				scriptnode.type = "text/javascript";
				scriptnode.textContent = '"use strict";var comment_list=document.getElementsByClassName("comment_list")[0],pageArray=[],pages=' + pages + ',i=0;function addLoad(num,data){console.log("Recieved page "+(num+1));var pageDiv=document.getElementById("page_"+(num+1));if(pageDiv!=null){pageArray[num]=data;pageDiv.innerHTML=pageArray[num];}var updateList=true;for(i=0;i<pages;i++){if(pageArray[i]==null){updateList=false;break;}}if(updateList){for(i=0;i<pages;i++){comment_list.innerHTML+=pageArray[i];}SetupCommentQuotes($("#story_comments"));}}';
				for(i = 0; i < pages; i++)
				{
					scriptnode.textContent += 'console.log("Loading page "+(' + (i + 1) +'));$.get("/ajax_fetch_comments.php",{"type":' + type + ',"item":' + item_id + ',"page":' + (i + 1) + '},function(xml){if(xml!="")addLoad(' + i + ',xml);});';
				}
				comment_list.appendChild(scriptnode);
			}
		}
	}
}*/

if(Site.page === PAGE.BLOG || Site.page === PAGE.STORY || Site.page === PAGE.GROUPTHREAD)
{
	var e_authors = document.getElementsByClassName("author");
	for(i = 0; i < e_authors.length; i++)
	{
		var e_avatar = e_authors[i].getElementsByClassName("avatar");
		if(e_avatar != null && e_avatar.length > 0)
		{
			var auname = e_avatar[0].parentNode.getElementsByClassName("name")[0].getElementsByTagName("a")[0].innerHTML;
			if(auname === Site.username)
			{
				Site.userid = e_avatar[0].src;
				Site.userid = Site.userid.substring(Site.userid.indexOf("tars/")+5, Site.userid.indexOf("_64"));
				logg("Found userid (1): " + Site.userid);
				break;
			}
		}
	}
}

if((Site.userid == null || Site.userid === "" || Site.userid === -1) && !(/\/manage_user\//.test(self.location.href)))
{
	var avatar = document.getElementsByClassName("user_info")[0];
	if(avatar != null)
	{
		avatar = avatar.getElementsByClassName("name")[0].getElementsByClassName("avatar")[0];
		if(avatar.href.substring(avatar.href.indexOf("user/")+5) === Site.username)
		{
			Site.userid = avatar.getElementsByTagName("img")[0].src;
			Site.userid = Site.userid.substring(Site.userid.indexOf("tars/")+5, Site.userid.indexOf("_64"));
			logg("Found userid (2): " + Site.userid);
		}
	}
}

/* Xaquseg said that I should not do this:
<iloveportalz0r> I just added an option to my script that changes the search bar at the top to use the search option in index.php instead of Google
<iloveportalz0r> Is that okay with you?
<Xaquseg> i guess but that feature is hidden because it currently works VERY poorly
<Xaquseg> it's been limited *majorly* compared to what it used to do
<Xaquseg> because those queries were taking up nearly all the server time
<Xaquseg> we're going to move to an actual search daemon
<Xaquseg> and then it'll be moved back for everyone
<iloveportalz0r> Well, not everyone wants to use Google
<Xaquseg> the difference is the google search tends to actually find it
<iloveportalz0r> I put in "perfect for me" and it appeared
<Xaquseg> well if load goes up because of your feature the on-site is becoming exact match only
<Xaquseg> just fyi
<Xaquseg> it's already heavily restricted wildcarding
<Xaquseg> the only reason we can leave that up is few people use it.
<iloveportalz0r> Well, there's a Search Term box in that filters thing
<iloveportalz0r> This is just for easier access
<Xaquseg> yeah
<Xaquseg> but few use it
<Xaquseg> if you make it easier it'll get used more again
<Xaquseg> which will cause it to increase load
<Xaquseg> look, that filter is VERY slow
<Xaquseg> we HAVE to discourage use until that's fixed
<Xaquseg> anyway, the plan is to move to fulltext search soonish
<Xaquseg> for that
<Xaquseg> and remove the filter one entirely
<iloveportalz0r> Okay
<Xaquseg> the filter one will be replaced with the new tag search
<Xaquseg> eventually
<Xaquseg> or, that's the plan
<Xaquseg> but for right now, please don't go messing with that, it's been done for a reason.
<iloveportalz0r> I see
<iloveportalz0r> I'll comment it out for now

var searchform = document.getElementById("form_search_sidebar");
if(searchform != null)
{
	searchform.action = "/index.php";
	searchform.innerHTML = '<div class="textbox"><input type="hidden" value="category" name="view"><input type="text" placeholder="Search" style="width:160px; padding-left:8px;" value="" name="search" class="search"></div><input type="submit" value="" class="search_submit">';
}*/

if(Site.page === PAGE.SCRIPTSETTINGS)
{
	var tableHTML = '<table class="properties"><tr><td class="label" style="line-height:1em;text-align:center;" colspan="2"><h2>General</h2></td></tr><tr><td class="label" style="line-height:1em;">More Emoticons</td><td><div><input id="ss_emoticons" type="checkbox" '+(addEmoticons?' checked="true"':' ')+'></div></td></tr><tr><td class="label" style="line-height:1em;">Full-width chapters</td><td><div><input id="ss_fullwidth" type="checkbox" '+(fullwidth?' checked="true"':' ')+'></div></td></tr><tr><td class="label">Banner (leave blank for default)</td><td><div><input id="ss_banner" type="text" style="width:80%" value="'+banner+'"><input type="button" style="width:5%;margin-left:1%;" value="Add" id="ss_banner_add"><input type="button" style="width:7%;margin-left:1%;" value="Delete" id="ss_banner_del"><br><select id="ss_banner_dd" style="width:100%;"><option value="">Default</option><option value="" disabled="true">Official</option><option value="//www.fimfiction-static.net/images/custom_banners/zecora.jpg">"Hanging by the Edge" by AeronJVL</option><option value="//www.fimfiction-static.net/images/custom_banners/aeron_fluttershy.jpg">"Nature" by AeronJVL</option><option value="//www.fimfiction-static.net/images/custom_banners/aeron_philomena.jpg">"Philomena - Equestria\'s Finest Phoenix" by AeronJVL</option><option value="//www.fimfiction-static.net/images/custom_banners/aeron_celestia.jpg">"Path to Canterlot" by AeronJVL</option><option value="//www.fimfiction-static.net/images/custom_banners/derpy_dash.jpg">"Full Armour D vs D" by ponyKillerX</option><option value="//www.fimfiction-static.net/images/custom_banners/ponykiller_trixie.jpg">"No Title" by ponyKillerX</option><option value="//www.fimfiction-static.net/images/custom_banners/maplesunrise_pinkiedash.jpg">"A Warm Evening" by MapleSunrise</option><option value="//www.fimfiction-static.net/images/custom_banners/yamio_fluttershy.jpg">"Fluttershy" by Yamio</option><option value="//www.fimfiction-static.net/images/custom_banners/smitty_derpy.jpg">"Derpy for Kiyoshi" by Smitty G</option><option value="//www.fimfiction-static.net/images/custom_banners/ratofdrawn_1.jpg">"Wet Fun" by RatofDrawn</option><option value="//www.fimfiction-static.net/images/custom_banners/ratofdrawn_rarijack.jpg">"Differences" by RatofDrawn</option><option value="//www.fimfiction-static.net/images/custom_banners/jinzhan_applejack.jpg">"Applejack" by JinZhan</option><option value="//www.fimfiction-static.net/images/custom_banners/jinzhan_group.jpg">"There are alligators in the lake" by JinZhan</option><option value="//www.fimfiction-static.net/images/custom_banners/solar_luna.jpg">"Chibi Luna - Star Fishing" by Soapie-Solar</option><option value="//www.fimfiction-static.net/images/custom_banners/solar_group.jpg">"Forest Foundation" by Soapie-Solar</option><option value="//www.fimfiction-static.net/images/custom_banners/uc77_1.jpg">"Ponies Dig Giant Robots" by UC77</option><option value="//www.fimfiction-static.net/images/custom_banners/cmaggot_fluttershy.jpg">"Dangerous Mission" by cmaggot</option><option value="//www.fimfiction-static.net/images/custom_banners/rainbow_ss.jpg">Silver Spoon by Rainbow</option><option value="//www.fimfiction-static.net/images/custom_banners/rainbow_markerpone.jpg">Untitled by Rainbow</option><option value="//www.fimfiction-static.net/images/custom_banners/rainbow_roseluck.jpg">Roseluck by Rainbow</option><option value="//www.fimfiction-static.net/images/custom_banners/jj_trixie.jpg">"Trixie\'s Life is so Hard" by John Joseco</option><option value="//www.fimfiction-static.net/images/custom_banners/anima_1.jpg">"C\'mon, lift your Spirit" by Anima-dos</option><option value="//www.fimfiction-static.net/images/custom_banners/mew_pinkie.jpg">"Reflect" by Mewball</option><option value="//www.fimfiction-static.net/images/custom_banners/tsitra_dash.jpg">"Morning Flight" by Tsitra360</option><option value="//www.fimfiction-static.net/images/custom_banners/knifeh_scoots.jpg">"Scootaloo" by KnifeH</option></select></div></td></tr></table>';
	if(error502)
	{
		document.title = "Script Settings - 502fiction.net";
		document.body.innerHTML = tableHTML;
	}
	else
	{
		Site.setTitle("Script Settings");
		var innerContent = document.getElementsByClassName("content_background")[0].getElementsByClassName("inner")[0].getElementsByClassName("content_box user_cp_content_box ")[0];
		if(innerContent != null)
		{
			document.getElementsByClassName("content_box_header")[0].innerHTML = "<h2>Script Settings</h2>";
			document.getElementsByClassName("user_cp main")[0].innerHTML += tableHTML;
		}
	}
	document.getElementById("ss_emoticons").addEventListener("click", setting_emoticons, false);
	document.getElementById("ss_fullwidth").addEventListener("click", setting_fullwidth, false);
	//document.getElementById("ss_hideads").addEventListener("click", setting_hideads, false);
	document.getElementById("ss_banner").addEventListener("input", setting_banner, false);
	document.getElementById("ss_banner_dd").addEventListener("click", setting_banner_dd, false);
	document.getElementById("ss_banner_dd").addEventListener("change", setting_banner_dd, false);
	document.getElementById("ss_banner_dd").addEventListener("keydown", function(){setTimeout(setting_banner_dd,10);}, false);
	//document.getElementById("ss_banner_dd").addEventListener("keyup", setting_banner_dd, false);
	document.getElementById("ss_banner_add").addEventListener("click", setting_banner_add, false);
	document.getElementById("ss_banner_del").addEventListener("click", setting_banner_del, false);
	//document.getElementById("ss_errmsg502").addEventListener("input", setting_errmsg502, false);
	var e = document.getElementById("ss_banner_dd");
	if(userBanners != null && userBanners !== "" && userBanners.split("\x01").length > 1)
	{
		var txt = e.innerHTML + '<option value="" disabled="true">Custom URLs</option>';
		var uba = userBanners.split("\x01");
		for(i = 0; i < uba.length; i+=2)
		{
			txt += '<option value="'+uba[i]+'">'+uba[i+1]+'</option>';
		}
		e.innerHTML = txt;
	}
	if(banner === "")
	{
		e.selectedIndex = 0;
	}
	else
	{
		for(i = 2; i < e.options.length; i++)
		{
			if(banner === e.options[i].value)
			{
				e.selectedIndex = i;
				break;
			}
		}
	}
	/*var selectchars = document.getElementsByClassName("select_character");
	var arraay = characters.split(",");
	if(arraay.length > 0)
	{
		for(i = 0; i < arraay.length; i++)
		{
			for(var j = 0; j < selectchars.length; j++)
			{
				if(selectchars[j].innerHTML.indexOf('value="'+arraay[i]+'"') !== -1)
				{
					selectchars[j].innerHTML = selectchars[j].innerHTML.replace("opacity:0.5", "opacity:1.0");
					break;
				}
			}
		}
	}
	for(i = 0; i < selectchars.length; i++)
	{
		(function(i){selectchars[i].addEventListener("click", function(){setting_character(i);}, false);})(i);
	}*/
}
else if(error502)
{
	logg("Detected page: 502 Bad Gateway");
	//document.body.innerHTML = document.body.innerHTML.replace("502 Bad Gateway", errmsg502);
	addEmoticons = false;
}
else if(Site.page === PAGE.NOTIFICATIONS)
{
	Site.setTitle("Notifications");
	var notifications = document.getElementsByClassName("notification");
	for(i = 0; i < notifications.length; i++)
	{
		if(notifications[i].innerHTML.indexOf('"></a>') !== -1 && notifications[i].innerHTML.indexOf('blog') !== -1)
		{
			notifications[i].innerHTML = notifications[i].innerHTML.replace('"></a>', '">Untitled</a>');
		}
	}
}
else if(Site.page === PAGE.BANNERCREDITS)
{
	Site.setTitle("Banner Credits");
}
else if(/view=category/.test(self.location.href))
{
	if(/&read_it_later/.test(self.location.href))
	{
		logg("Detected page: Read Later");
		Site.setTitle("Read Later");
	}
	else if(/&tracking=1&order=updated&unread=1/.test(self.location.href))
	{
		logg("Detected page: Favorites");
		Site.setTitle("Favorites");
	}
}
else if(Site.page === PAGE.MANAGEBLOG)
{
	Site.setTitle("Manage Blog");
}
else if(Site.page === PAGE.CHAPTER)
{
	if(fullwidth)
	{
		var container = document.getElementById("chapter_container");
		if(container != null)
		{
			logg("Setting chapter width");
			container.setAttribute("style", "max-width:100%");
			//container.getElementsByClassName("inner_margin")[0].setAttribute("style", "max-width:100%");
		}
		else
		{
			logg("Error changing chapter width: chapter_container is null");
		}
	}
	/*var chapter_toolbar = document.getElementById("chapter_toolbar_container");
	if(chapter_toolbar != null)
	{
		var dark_toolbar = chapter_toolbar.getElementsByClassName("dark_toolbar");
		if(dark_toolbar != null && dark_toolbar.length === 1)
		{
			dark_toolbar = dark_toolbar[0];
			var labelDiv = dark_toolbar.getElementsByTagName("div");
			if(labelDiv != null && labelDiv.length === 1)
			{
				labelDiv = labelDiv[0];
				var labels = labelDiv.getElementsByTagName("label");
				if(labels == null || labels.length === 0)
				{
					logg("Chapter Toolbar -> Dark Toolbar -> Label Div -> Labels not found");
				}
				else if(labels.length === 4)
				{
					// Font size
					labels[1].innerHTML = '<img src="//www.fimfiction-static.net/images/icons/font_size.png"><select id="format_size"><option value="0.9em">Very Small (0.9em)</option><option value="1.0em">Small (1.0em)</option><option value="1.1em">Normal (1.1em)</option><option value="1.4em">Big (1.4em)</option><option value="1.6em">Large (1.6em)</option><option value="1.8em">X Large (1.8em)</option><option value="2.0em">XX Large (2.0em)</option><option value="other">Other</option></select>';
					$("#format_size").change(function(event)
					{
						var fontSize = $("#format_size option:selected").val();
						if(fontSize === "other")
						{
							fontSize = prompt("Font size:");
							if(isNumber(fontSize))
							{
								fontSize += "em";
							}
							$("#format_size option:selected").html("Other: " + fontSize);
						}
						$("#chapter_format").css("font-size", fontSize);
						unsafeWindow.localStorage["format_size"] = $("#format_size option:selected").val();
					});
					logg("Added Other option for font size");

					var ffontScheme = "bow",
						defaultFontSchemes = ["bow:Light", "medium_light:Medium Light", "medium_dark:Medium Dark", "wob:Dark", "pinkie:Pinkie", "applejack:Applejack", "rarity:Rarity", "twilight:Twilight", "dash:Dash", "fluttershy:Fluttershy"];
					if("format_colours" in unsafeWindow.localStorage && unsafeWindow.localStorage["format_colours"] != undefined)
					{
						ffontScheme = unsafeWindow.localStorage["format_colours"];
					}
					var sfontScheme = GM_getValue("fontScheme", ffontScheme),
						fontSchemeName = sfontScheme;
					for(i = 0; i < defaultFontSchemes.length; ++i)
					{
						var schemeCode = defaultFontSchemes[i].split(":");
						if(sfontScheme === schemeCode[0])
						{
							fontSchemeName = schemeCode[1];
							break;
						}
					}
					labels[2].innerHTML = '<img src="//www.fimfiction-static.net/images/icons/color.png"><span style="padding:3px;line-height:2.11em;" id="format_colours">' + fontSchemeName + '</span></select>';

					$("#format_colours").click(function(event)
					{
						var pickerWidth = 178,
							picker = document.createElement("div");
						picker.id = "fontColorPicker";
						picker.setAttribute("style", "position:absolute;width:" + pickerWidth + "px;height:158px;padding:4px;left:" + Math.floor($(this).offset().left + $(this).outerWidth() - pickerWidth + 0.5) + "px;top:" + Math.floor($(this).offset().top + $(this).outerHeight() + 4.5) + "px;border-radius:5px;padding:4px;background-color:#FFF;border:1px solid silver;");
						picker.innerHTML = '<input type="minicolors" data-control="inline">';
						document.body.appendChild(picker);
						$.minicolors.init();
						// TODO
					});
					logg("Added Other option for font color");

					// Line spacing
					labels[3].innerHTML = '<img src="//www.fimfiction-static.net/images/icons/line_spacing.png"><select id="format_line_spacing"><option value="1.0em">1.0em</option><option value="1.1em">1.1em</option><option value="1.2em">1.2em</option><option value="1.3em">1.3em</option><option value="1.4em">1.4em</option><option value="1.5em">1.5em</option><option value="1.6em">1.6em</option><option value="1.7em">1.7em</option><option value="1.8em">1.8em</option><option value="1.9em">1.9em</option><option value="2.0em">2.0em</option><option value="other">Other</option></select>';
					$("#format_line_spacing").change(function(event)
					{
						var lineHeight = $("#format_line_spacing option:selected").val();
						if(lineHeight === "other")
						{
							lineHeight = prompt("Line height:");
							if(isNumber(lineHeight))
							{
								lineHeight += "em";
							}
							$("#format_line_spacing option:selected").html("Other: " + lineHeight);
						}
						$("#chapter_format .chapter_content").css("line-height", lineHeight);
						unsafeWindow.localStorage["format_line_spacing"] = $("#format_line_spacing option:selected").val();
					});
					logg("Added Other option for line spacing");
				}
				else
				{
					logg("Wrong labels.length: " + labels.length);
				}
			}
			else
			{
				logg("Chapter Toolbar -> Dark Toolbar -> Label Div not found");
			}
		}
		else
		{
			logg("Chapter Toolbar -> Dark Toolbar not found");
		}
	}
	else
	{
		logg("Chapter Toolbar not found");
	}*/
}
else if(Site.page === PAGE.BLOGEDIT)
{
	var e_blog_title = document.getElementById("blog_title");
	if(e_blog_title != null && e_blog_title.value === "")
	{
		e_blog_title.setAttribute("value", "Untitled");
	}
}
else if(Site.page === PAGE.OTHER)
{
	addEmoticons = false;
}

function setting_emoticons()
{
	addEmoticons = document.getElementById("ss_emoticons").checked;
	GM_setValue("addEmoticons", addEmoticons);
}

function setting_fullwidth()
{
	fullwidth = document.getElementById("ss_fullwidth").checked;
	GM_setValue("fullWidth", fullwidth);
}

/*function setting_hideads()
{
	hideads = document.getElementById("ss_hideads").checked;
	GM_setValue("hideAds", hideads);
	var bordered = document.getElementsByClassName("bordered");
	if(bordered.length == 1)
	{
		bordered[0].style.display = (hideads?"none":"inherit");
	}
}*/

function setting_banner()
{
	banner = document.getElementById("ss_banner").value.trim();
	GM_setValue("banner", banner);
	if(!error502 && banner !== "")
	{
		GM_addStyle('div.header a.home_link{background-image:url("'+banner+'") !important;}');
	}
}

function setting_banner_dd()
{
	document.getElementById("ss_banner").value = document.getElementById("ss_banner_dd").value;
	setting_banner();
}

function setting_banner_add()
{
	banner = document.getElementById("ss_banner").value.trim();
	var e = document.getElementById("ss_banner_dd");
	for(i = 0; i < e.options.length; i++)
	{
		if(e.options[i].value === banner)
		{
			return null;
		}
	}
	if(userBanners.indexOf(banner) === -1)
	{
		var bannerName = prompt("Banner name:");
		if(bannerName == null) // user clicked Cancel
		{
			return null;
		}
		if(bannerName === "")
		{
			bannerName = banner.substring(banner.lastIndexOf("/")+1);
		}
		userBanners += "\x01"+banner+"\x01"+bannerName;
		if(userBanners.indexOf("\x01") === 0)
		{
			userBanners = userBanners.substring(1);
		}
		GM_setValue("userBanners", userBanners);
		var ss_banner_dd = document.getElementById("ss_banner_dd");
		ss_banner_dd.innerHTML += ((ss_banner_dd.innerHTML.indexOf("Custom URLs") === -1)?'<option value="" disabled="true">Custom URLs</option>':"")+'<option value="'+banner+'">'+bannerName+'</option>';
		ss_banner_dd.selectedIndex = ss_banner_dd.options.length-1;
	}
}

function setting_banner_del()
{
	banner = document.getElementById("ss_banner").value.trim();
	if(userBanners.indexOf(banner) !== -1)
	{
		var arraray = userBanners.split("\x01");
		var indecks = arraray.indexOf(banner);
		if(indecks !== -1)
		{
			arraray.splice(indecks, 2);
			userBanners = arraray.join("\x01");
			GM_setValue("userBanners", userBanners);

			var e = document.getElementById("ss_banner_dd"), txt = e.innerHTML;
			txt = txt.substring(0, txt.indexOf('<option value="" disabled="true">Custom URLs</option>'));
			if(userBanners.length > 0)
			{
				txt += '<option value="" disabled="true">Custom URLs</option>';
				var cURLs = false;
				for(i = 0; i < e.options.length; i++)
				{
					if(!cURLs)
					{
						cURLs = (e.options[i].innerHTML === "Custom URLs");
					}
					else if(e.options[i].value !== banner)
					{
						txt += '<option value="'+e.options[i].value+'">'+e.options[i].innerHTML+'</option>';
					}
				}
			}
			e.innerHTML = txt;
		}
	}
}

/*function setting_errmsg502()
{
	errmsg502 = document.getElementById("ss_errmsg502").value.trim();
	GM_setValue("errmsg502", errmsg502);
}

function setting_character(num)
{
	var e = document.getElementsByClassName("select_character")[num];
	var img = document.getElementById(e.getElementsByClassName("included")[0].value);
	if(img.style.cssText.indexOf("0.5") !== -1)
	{
		//console.log("add #"+num);
		characters += ","+img.id;
		img.style.opacity = 1.0;
	}
	else
	{
		//console.log("del #"+num);
		var arraray = characters.split(",");
		var indecks = arraray.indexOf(img.id);
		if(indecks !== -1)
		{
			arraray.splice(indecks, 1);
			characters = arraray.join(",");
			img.style.opacity = 0.5;
		}
	}
	GM_setValue("characters", characters);
}*/

GM_addStyle("div.add_comment div.emoticons_panel{height:400px;}div.add_comment div.textbox_container textarea{height:380px;}");
if(!error502 && banner !== "")
{
	GM_addStyle('div.header a.home_link{background-image:url("'+banner+'") !important;}');
}

/*if(hideads)
{
	var bordered = document.getElementsByClassName("bordered");
	if(bordered.length == 1)
	{
		bordered[0].style.display = (hideads?"none":"inherit");
	}
}*/

/*function getCharImg(cID)
{
	switch(cID)
	{
		case "7": return "twilight_sparkle";
		case "8": return "rainbow_dash";
		case "9": return "pinkie_pie";
		case "10": return "applejack";
		case "11": return "rarity";
		case "12": return "fluttershy";
		case "13": return "apple_bloom";
		case "14": return "scootaloo";
		case "15": return "sweetie_belle";
		case "16": return "spike";
		case "17": return "celestia";
		case "18": return "princess_luna";
		case "19": return "gilda";
		case "20": return "zecora";
		case "21": return "trixie";
		case "22": return "big_mac";
		case "23": return "granny_smith";
		case "24": return "braeburn";
		case "25": return "diamond_tiara";
		case "26": return "silver_spoon";
		case "27": return "twist";
		case "28": return "snips";
		case "29": return "snails";
		case "30": return "cherilee";
		case "31": return "the_mayor";
		case "32": return "hoity_toity";
		case "33": return "photo_finish";
		case "34": return "sapphire_shores";
		case "35": return "spitfire";
		case "36": return "soarin";
		case "37": return "prince_blueblood";
		case "38": return "little_strongheart";
		case "39": return "angel";
		case "40": return "winona";
		case "41": return "opalescence";
		case "42": return "gummy";
		case "43": return "owlowiscious";
		case "44": return "philomena";
		case "45": return "derpy_hooves";
		case "46": return "lyra";
		case "47": return "bon_bon";
		case "48": return "dj_pon3";
		case "49": return "oc";
		case "50": return "caramel";
		case "51": return "doctor_whooves";
		case "52": return "octavia";
		case "53": return "discord";
		case "54": return "nightmare_moon";
		case "55": return "pipsqueak";
		case "56": return "berry_punch";
		case "57": return "carrot_top";
		case "58": return "mare_do_well";
		case "59": return "tank";
		case "60": return "fancypants";
		case "61": return "fleur_de_lis";
		case "62": return "other";
		case "63": return "daring_do";
		case "64": return "colgateicon";
		case "65": return "flimflamicon";
		case "66": return "cranky doodle icon";
		case "67": return "matilda icon";
		case "68": return "mr cake icon";
		case "69": return "mrs cake icon";
		case "70": return "dinkyicon";
		case "71": return "ironwillicon";
		case "72": return "Cadence";
		case "73": return "shining-armor";
		case "74": return "main_6";
		case "75": return "cmc";
		case "76": return "wonderbolts";
		case "77": return "diamond_dogs";
		case "78": return "queen-chrysalis";
		case "79": return "thunderlane";
		case "80": return "flitter_and_cloudchaser";
		case "81": return "rumble";
		case "82": return "roseluck";
		default: return "undefined";
	}
}

var browsething = document.getElementsByClassName("drop_down_container")[0];
if(browsething != null)
{
	browsething = browsething.getElementsByClassName("container")[0];
	if(browsething != null)
	{
		browsething = browsething.getElementsByClassName("panel")[0];
		if(browsething != null)
		{
			browsething = browsething.getElementsByClassName("section")[1];
			if(browsething != null)
			{
				var arraay = characters.split(",");
				if(arraay.length > 0)
				{
					logg("Modifying characters under Browse");
					var defaultchars = browsething.getElementsByTagName("a");
					var teckzt = "";
					if(defaultchars.length === 9 || defaultchars.length === 10)
					{
						var i1 = defaultchars.length-1;
						var i2 = defaultchars.length-7;
						for(i = i1; i > i2; i--)
						{
							if(defaultchars[i].innerHTML.indexOf("images/characters") !== -1)
							{
								defaultchars[i].parentNode.removeChild(defaultchars[i]);
							}
						}
					}
					else
					{
						teckzt = "<br>";
					}
					teckzt += "<div>";
					for(i = 0; i < arraay.length; i++)
					{
						teckzt += '<a href="/index.php?view=category&amp;characters%5B%5D='+arraay[i]+'"><img src="//www.fimfiction-static.net/images/characters/'+getCharImg(arraay[i])+'.png"></a>';
						if(i % 6 === 5)
						{
							teckzt += '</div><div style="margin-top:4px;">';
						}
						else if(i !== arraay.length)
						{
							teckzt += " ";
						}
					}
					teckzt += "</div>";
					browsething.innerHTML += " "+teckzt;
					logg("Done: characters");
				}
			}
		}
	}
}*/

var commentForm = document.getElementById("comment_form");
if(commentForm != null)
{
	/*if(Site.username != null && Site.username !== "") // Better safe than sorry!
	{
		var commentType = -1;
		var commentItem = -1;
		var div_add_comment_box = document.getElementById("add_comment_box");
		var addCommentScripts = div_add_comment_box.getElementsByTagName("script");
		for(i = 0; i < addCommentScripts.length; i++)
		{
			if(addCommentScripts[i].innerHTML.indexOf("/ajax_add_comment.php") !== -1)
			{
				var scriptText = addCommentScripts[i].innerHTML;
				var typeIndex = scriptText.indexOf("type:");
				var idIndex = scriptText.indexOf(",item:")
				logg("Type index: " + typeIndex);
				logg("ID index: " + idIndex);
				if(typeIndex !== -1 && idIndex !== -1)
				{
					commentType = scriptText.substring(typeIndex + 5, idIndex).trim();
					commentItem = scriptText.substring(idIndex + 6, scriptText.indexOf(",random_pony:")).trim();
					logg("Comment type: " + commentType);
					logg("Comment item: " + commentItem);
				}
				break;
			}
		}
		if(commentType != -1 && commentItem != -1)
		{
			commentForm.innerHTML = commentForm.innerHTML.replace("> Incorrect Pony</span>", '> Incorrect Pony</span><span id="comment_time" style="display:none;vertical-align:middle;font-size:0.7em;font-weight:bold;"><img src="//www.fimfiction-static.net/images/icons/cross.png" style="vertical-align:middle;" /></span>');
			$("#comment_form").unbind("submit");
			commentForm.onsubmit = function(event)
			{
				event.preventDefault();
				var _comment = document.getElementById("comment_comment").value;
				if(_comment != "")
				{
					document.getElementById("comment_success").style.display = "none";
					document.getElementById("comment_time").style.display = "none";
					document.getElementById("comment_wrong_pony").style.display = "none";
					document.getElementById("comment_processing").style.display = "";
					$.post("/ajax_add_comment.php",
					{
						username: Site.username,
						comment: _comment,
						type: commentType,
						item: commentItem,
						random_pony: 0,
						random_pony_name: ""
					}, function(xml)
					{
						var timeHTML = "<div class='message' style='margin-left:10px; margin-right:10px;'>Please wait ";
						document.getElementById("comment_processing").style.display = "none";
						//logg("Comment HTML: " + xml);
						if(xml == "Wrong Pony")
						{
							document.getElementById("comment_wrong_pony").style.display = "";
						}
						else if(xml.indexOf(timeHTML) !== -1)
						{
							var e_comment_time = document.getElementById("comment_time");
							e_comment_time.innerHTML = '<img style="vertical-align:middle;" src="//www.fimfiction-static.net/images/icons/cross.png"> ';
							var seconds = xml.substring(timeHTML.length, timeHTML.length + 2).trim();
							e_comment_time.innerHTML += "Wait " + seconds + " second" + (seconds != 1 ? "s" : "") + " before posting another comment";
							document.getElementById("comment_processing").style.display = "none";
							e_comment_time.style.display = "";
						}
						else
						{
							document.getElementById("comment_success").style.display = "";
							boomstick();
							$(".comment_list").append('<div class="single_comment">' + xml + "</div>");
						}
					});
				}
			};
		}
	}*/

	var light_toolbar = document.getElementsByClassName("light_toolbar");
	for(i = 0; i < light_toolbar.length; i++) // Modify toolbar(s)
	{
		if(light_toolbar[i].id.indexOf("report_chapter") === -1)
		{
			addTBB(light_toolbar[i], i);
		}
	}
}

function addTBB(toolbar, id) // TBB = Toolbar Buttons
{
	var things = toolbar.getElementsByClassName("toolbar_buttons");
	for(i = 0; i < things.length; i++)
	{
		if(things[i].innerHTML.indexOf("AddYoutube") !== -1)
		{
			var lis = things[i].getElementsByTagName("a");
			for(var li = 0; li < lis.length; li++)
			{
				if(lis[li].href.indexOf("AddYoutube") !== -1)
				{
					lis[li].href = "javascript:void(0);";
					lis[li].id = "youtubebtn_"+id;
					break;
				}
			}
			break;
		}
	}
	//if(toolbar.parentNode.id.indexOf("comment_form") !== -1)
		toolbar.innerHTML += '<ul class="toolbar_buttons"><li><a href="javascript:Center(document.getElementById(\'comment_comment\'));" title="Center Align"><img class="icon_16" src="//www.fimfiction-static.net/images/icons/center.png"></a></li><li><a href="javascript:AddHR(document.getElementById(\'comment_comment\'));" title="Add Horizontal Rule" class="left_curved_4"><img class="icon_16" src="//www.fimfiction-static.net/images/icons/horizontal_rule.png"></a></li><li><a href="javascript:var field=document.getElementById(\'comment_comment\'),txt=BBCodeGetSelection(field);if(txt==null)txt=\'\';InsertTextAt(field,\'[smcaps]\'+txt+\'[/smcaps]\');" title="SMCaps" class="left_curved_4">SMCaps</a></li><li><a href="javascript:var field=document.getElementById(\'comment_comment\'),txt=BBCodeGetSelection(field);if(txt==null)txt=\'\';InsertTextAt(field,\'[email]\'+txt+\'[/email]\');" title="Email" class="left_curved_4"><img class="icon_16" src="//www.fimfiction-static.net/images/icons/mail.png"></a></li></ul>';
	var ytbtn = document.getElementById("youtubebtn_"+id);
	if(ytbtn != null)
	{
		ytbtn.addEventListener("click", AddYT, false);
	}
}

function AddYT()
{
	var txtfield = document.getElementById((Site.page === PAGE.BLOGEDIT?"blog_post_content":"comment_comment"));
	if(txtfield != null)
	{
		var url = prompt("Enter a YouTube video URL","");
		if(url != null && url !== "")
		{
			url = url.trim().replace("m.youtube", "youtube");
			var id = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
			if(id != null && id[2].length === 11)
			{
				InsertTextAt(txtfield, "[youtube="+id[2]+"]");
			}
			else
			{
				alert("That is not a valid YouTube video URL");
			}
		}
	}
}

// This function is from FiMFiction's bbcode_scripts.js
function InsertTextAt(field, text)
{
	if(field.selectionStart || field.selectionStart === '0')
	{
		var startPos = field.selectionStart;
		var endPos = field.selectionEnd;
		field.value = field.value.substring(0, startPos) + text + field.value.substring(endPos, field.value.length);
		field.selectionStart = startPos + text.length;
		field.selectionEnd = startPos + text.length;
	}
	else
	{
		field.value += text;
	}
}

if(addEmoticons && Site.page === PAGE.BLOGEDIT)
{
	var form = document.getElementById("edit_story_form");
	if(form != null)
	{
		unsafeWindow.smilie = function(txt){InsertTextAt(document.getElementById("blog_post_content"),txt);};
		var txt = "</textarea>\n\t\t\t\t</div>\n\t\t\t</td>\n\t\t</tr>";
		form.innerHTML = form.innerHTML.replace(txt, txt + '<tr><td colspan="2"><div class="emoticons_panel" style="width:100%;"><div class="inner_padding"></div></div></td></tr>');
	}
}

if(addEmoticons)
{
	var emoticon_panels = document.getElementsByClassName("emoticons_panel");
	if(emoticon_panels == null || emoticon_panels.length === 0)
	{
		logg("No emoticon panels found");
	}
	else
	{
		for(i = 0; i < emoticon_panels.length; i++)
		{
			if(emoticon_panels[i] != null)
			{
				addEmoticonsF(emoticon_panels[i], i);
			}
		}
	}
}
else
{
	logg("Not adding emoticons");
}
function addEmoticonsF(emoticons_panel, num)
{
	if(emoticons_panel != null)
	{
		logg("Adding panel #" + num);
		emoticons_panel.style.overflow = "auto";

		createNewEmoteTable("Default", "FF", num);
		createNewEmote("ajbemused", "AJ Bemused", "FF");
		createNewEmote("ajsleepy", "AJ Sleepy", "FF");
		createNewEmote("ajsmug", "AJ Smug", "FF");
		createNewEmote("applecry", "Crying Applebloom", "FF");
		createNewEmote("applejackconfused", "AJ Confused", "FF");
		createNewEmote("applejackunsure", "AJ Unsure", "FF");
		createNewEmote("coolphoto", "Cool Photo", "FF");
		createNewEmote("derpyderp1", "Derpy Derp #1", "FF");
		createNewEmote("derpyderp2", "Derpy Derp #2", "FF");
		createNewEmote("derpytongue2", "Derpy Tongue", "FF");
		createNewEmote("fluttercry", "Crying Fluttershy", "FF");
		createNewEmote("flutterrage", "LOVE ME OR DIE", "FF");
		createNewEmote("fluttershbad", "Fluttershy Bad", "FF");
		createNewEmote("fluttershyouch", "Fluttershy Ouch", "FF");
		createNewEmote("fluttershysad", "Sad Fluttershy", "FF");
		createNewEmote("heart", "Heart", "FF");
		createNewEmote("pinkiecrazy", "Pinkamena", "FF");
		createNewEmote("pinkiegasp", "Pinkie Gasp", "FF");
		createNewEmote("pinkiehappy", "Happy Pinkie", "FF");
		createNewEmote("pinkiesad2", "Sad Pinkie", "FF");
		createNewEmote("pinkiesick", "Sick Pinkie", "FF");
		createNewEmote("pinkiesmile", "Pinkie Smile", "FF");
		createNewEmote("rainbowderp", "Rainbow Derp", "FF");
		createNewEmote("rainbowdetermined2", "Rainbow Determined", "FF");
		createNewEmote("rainbowhuh", "Rainbow Huh", "FF");
		createNewEmote("rainbowkiss", "Rainbow Kiss", "FF");
		createNewEmote("rainbowlaugh", "Rainbow Laugh", "FF");
		createNewEmote("rainbowwild", "Rainbow Wild", "FF");
		createNewEmote("raritycry", "Crying Rarity", "FF");
		createNewEmote("raritydespair", "Rarity Despair", "FF");
		createNewEmote("raritystarry", "Rarity Starry", "FF");
		createNewEmote("raritywink", "Rarity Wink", "FF");
		createNewEmote("scootangel", "Scootaloo Angel", "FF");
		createNewEmote("trixieshiftleft", "Trixie Shift Left", "FF");
		createNewEmote("trixieshiftright", "Trixie Shift Right", "FF");
		createNewEmote("twilightangry2", "Angry Twilight", "FF");
		createNewEmote("twilightblush", "Blushing Twilight", "FF");
		createNewEmote("twilightoops", "Twilight Oops", "FF");
		createNewEmote("twilightsheepish", "Sheepish Twilight", "FF");
		createNewEmote("twilightsmile", "Twilight Smile", "FF");
		createNewEmote("twistnerd", "Twist Nerd", "FF");
		createNewEmote("unsuresweetie", "Unsure Sweetie", "FF");
		createNewEmote("yay", "Yay", "FF");
		createNewEmote("trollestia", "Trollestia", "FF");
		createNewEmote("moustache", "Moustache", "FF");
		createNewEmote("facehoof", "Facehoof", "FF");
		createNewEmote("eeyup", "Eeyup", "FF");
		createNewEmote("duck", "Duck", "FF");

		createNewEmoteTable("Awesome Faces", "AF", num);
		createNewEmote(getURL1("Luna_lolface"), "Luna Lolface", "AF");
		createNewEmote(getURL2("lolface_Celestia"), "Celestia Lolface", "AF");
		createNewEmote(getURL1("Sweetie_Belle_lolface"), "Sweetie Belle Lolface", "AF");
		createNewEmote(getURL1("Twilight_Sparkle_lolface"), "Twilight Sparkle Lolface", "AF");
		createNewEmote(getURL1("Spike_lolface"), "Spike Lolface", "AF");
		createNewEmote(getURL1("Pinkie_Pie_lolface"), "Pinkie Pie Lolface", "AF");
		createNewEmote(getURL1("Rarity_lolface"), "Rarity Lolface", "AF");
		createNewEmote(getURL1("Rainbow_Dash_lolface"), "Rainbow Dash Lolface", "AF");
		createNewEmote(getURL1("Applejack_lolface"), "Applejack Lolface", "AF");
		createNewEmote(getURL1("Vinyl_Scratch_lolface"), "Vinyl Scratch Lolface", "AF");
		createNewEmote(getURL1("Fluttershy_lolface"), "Fluttershy Lolface", "AF");
		createNewEmote(getURL1("Scootaloo_lolface"), "Scootaloo Lolface", "AF");
		createNewEmote(getURL1("Applebloom_lolface"), "Applebloom Lolface", "AF");
		createNewEmote(getURL1("Derpy_Hooves_lolface"), "Derpy Hooves Lolface", "AF");
		createNewEmote(getURL1("Trixie_lolface_1"), "Trixie Lolface 1", "AF");
		createNewEmote(getURL1("Trixie_lolface_2"), "Trixie Lolface 2", "AF");
		createNewEmote(getURL2("lolface_Queen_Chrysalis"), "Queen Chrysalis Lolface", "AF");

		createNewEmoteTable("Sillyfillies", "SF", num); // Couldn't think of a better name than "sillyfilly" :|
		createNewEmote(getURL2("sillyfilly_Sweetie_Belle"), "Sweetie Belle Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Scootaloo"), "Scootaloo Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Applebloom"), "Applebloom Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Twilight_Sparkle"), "Twilight Sparkle Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Fluttershy"), "Fluttershy Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Applejack"), "Applejack Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Pinkie_Pie"), "Pinkie Pie Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Rarity"), "Rarity Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Rainbow_Dash"), "Rainbow Dash Sillyfilly", "SF");
		createNewEmote(getURL2("sillyfilly_Derpy_Hooves"), "Derpy Hooves Sillyfilly", "SF");

		createNewEmoteTable("Shrugponies", "SP", num);
		createNewEmote(getURL2("shrug_Luna_apple"), "Luna Shrug (Apple)", "SP");
		createNewEmote(getURL2("shrug_Celestia"), "Celestia Shrug", "SP");
		createNewEmote(getURL2("shrug_Twilight_Sparkle"), "Twilight Sparkle Shrug", "SP");
		createNewEmote(getURL2("shrug_Twilight_future"), "Future Twilight Shrug", "SP");
		createNewEmote(getURL2("shrug_Rainbow_Dash"), "Rainbow Dash Shrug", "SP");
		createNewEmote(getURL2("shrug_Derpy_Hooves"), "Derpy Hooves Shrug", "SP");
		createNewEmote(getURL2("shrug_Queen_Chrysalis"), "Queen Chrysalis Shrug", "SP");
		createNewEmote(getURL2("shrug_bronymaster1"), "bronymaster1 Shrug", "SP");

		createNewEmoteTable("Deal With It", "DWI", num);
		createNewEmote(getURL2("misc_Rainbow_dealwithit"), "Rainbow Dash Deal With It", "DWI");
		createNewEmote(getURL2("misc_Derpy_dealwithit"), "Rainbow Dash Deal With It", "DWI");
		createNewEmote(getURL2("misc_Cloudchaser_dealwithit"), "Cloudchaser Deal With It", "DWI");
		createNewEmote(getURL2("misc_Lyra_dealwithit"), "Lyra Deal With It", "DWI");

		createNewEmoteTable("Miscellaneous", "MISC", num);
		createNewEmote(getURL2("misc_unsuresweetie_flip"), "Unsure Sweetie (flipped)", "MISC");
		createNewEmote(getURL2("misc_rainbowkiss_flip"), "Rainbow Kiss (flipped)", "MISC");
		createNewEmote(getURL2("misc_rainbowderp_flip"), "Rainbow Derp (flipped)", "MISC");
		createNewEmote(getURL2("misc_duck_flip"), "Duck (flipped)", "MISC");
		createNewEmote(getURL1("discord"), "Discord", "MISC");
		createNewEmote(getURL2("misc_Discord"), "Discord 2", "MISC");
		createNewEmote(getURL1("eenope"), "Eenope", "MISC");
		createNewEmote(getURL1("Mr_Cake"), "Mr. Cake", "MISC");
		createNewEmote(getURL1("yay_red"), "Red Yay", "MISC");
		createNewEmote(getURL2("misc_TwilightWut"), "Twilight Wut", "MISC");
		createNewEmote(getURL2("misc_Twilight_crazy"), "Crazy Twilight", "MISC");
		createNewEmote(getURL2("misc_Twilight_crazy_invert"), "Crazy Twilight (inverted)", "MISC");
		createNewEmote(getURL2("misc_Twilight_pea"), "Twilight Pea", "MISC");
		createNewEmote(getURL2("misc_Fluttershy_umad"), "Fluttershy Umad", "MISC");
		createNewEmote(getURL2("misc_Fluttershy"), "Fluttershy being Fluttershy", "MISC");
		createNewEmote(getURL2("misc_Pinkie_loool"), "Pinkie LOOOL", "MISC");
		createNewEmote(getURL2("misc_Sweetie_happy"), "Happy Sweetie Belle", "MISC");
		createNewEmote(getURL2("misc_Lyra2"), "Happy Lyra", "MISC");
		createNewEmote(getURL2("misc_Lyra"), "Super Happy Lyra", "MISC");
		createNewEmote(getURL2("misc_Lyra_cry"), "Lyra Cry", "MISC");
		createNewEmote(getURL2("misc_Lyra_smile"), "Smiling Lyra", "MISC");
		createNewEmote(getURL2("misc_Lyra_ooh"), '"Oooh!"', "MISC");
		createNewEmote(getURL2("misc_Bonbon_gaze"), "Bonbon Gaze", "MISC");
		createNewEmote(getURL2("misc_Bonbon_grin"), "Bonbon Grin", "MISC");
		createNewEmote(getURL2("misc_Bonbon_OMG_LOVE"), "Bonbon OMG LOVE", "MISC");
		createNewEmote(getURL2("misc_Redheart_hmph"), "Nurse Redheard Hmph", "MISC");
		createNewEmote(getURL2("misc_Redheart_shh"), "Nurse Redheard Shh", "MISC");
		createNewEmote(getURL2("misc_Redheart_smile"), "Nurse Redheart Smile", "MISC");
		createNewEmote(getURL2("misc_Redheart_gasp"), "Nurse Redheart Gasp", "MISC");
		createNewEmote(getURL2("misc_Octavia"), "Octavia", "MISC");
		createNewEmote(getURL2("misc_Octavia2"), "Octavia 2", "MISC");
		createNewEmote(getURL2("misc_Octavia_O_O"), "Octavia O_O", "MISC");
		createNewEmote(getURL2("misc_Octavia_cake"), "Octavia likes cake", "MISC");
		createNewEmote(getURL2("misc_Octavia_chair"), "Octavia Chair", "MISC");
		createNewEmote(getURL2("misc_Octavia_plot"), "Octavia Plot", "MISC");
		createNewEmote(getURL2("misc_Cheerilee"), "Cheerilee", "MISC");
		createNewEmote(getURL2("misc_Vinyl_Scratch"), "Vinyl Scratch", "MISC");
		createNewEmote(getURL2("misc_Vinyl2"), "Vinyl Scratch 2", "MISC");
		createNewEmote(getURL2("misc_Vinyl_sad"), "Sad Vinyl", "MISC");
		createNewEmote(getURL2("misc_Vinyl_shock"), "Shocked Vinyl", "MISC");
		createNewEmote(getURL2("misc_Soarin_dayum"), "Soarin DAYUM", "MISC");
		createNewEmote(getURL2("misc_Spitfire"), "Spitfire", "MISC");
		createNewEmote(getURL2("misc_Spitfire_dayum"), "Spitfire DAYUM", "MISC");
		createNewEmote(getURL2("misc_Spitfire_lazy"), "Lazy Spitfire", "MISC");
		createNewEmote(getURL2("misc_Spitfire_rape"), "Spitfire Rapeface", "MISC");
		createNewEmote(getURL2("misc_Spitfire_sad"), "Sad Spitfire", "MISC");
		createNewEmote(getURL2("misc_Colgate_beam"), "Colgate Beam", "MISC");
		createNewEmote(getURL2("misc_Colgate_bedroomeyes"), "Colgate Bedroom Eyes", "MISC");
		createNewEmote(getURL2("misc_Twilightclopple"), "Twilightclopple", "MISC");
		createNewEmote(getURL2("misc_RageFace"), "Rage Face", "MISC");
		createNewEmote(getURL2("misc_YouDontSay2"), "You Don't Say?!", "MISC");

		createNewEmoteTable("deviantART", "dA", num);
		createNewEmote("//e.deviantart.net/emoticons/t/trollface.png", "Trollface", "dA");
		createNewEmote("//e.deviantart.net/emoticons/b/biggrin.gif", "Big Grin", "dA");
		createNewEmote("//e.deviantart.net/emoticons/h/horny2.gif", "Horny 2", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love.gif", "Love", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection.gif", "Affection", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/adoration.gif", "Adoration", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/attraction.gif", "Attraction", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/caring.gif", "Caring", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/compassion.gif", "Compassion", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/da_love.gif", "dA Love", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/flirty.gif", "Flirty", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/obsessed.gif", "Obsessed", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/sentimental.gif", "Sentimental", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/sweet.gif", "Sweet", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/affection/tender.gif", "Tender", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/longing.gif", "Longing", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/longing/drooling.gif", "Drooling", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/longing/love_dazed.gif", "Love Dazed", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/longing/yearning.gif", "Yearning", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust.gif", "Lust", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/aroused.gif", "Aroused", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/horny.gif", "Horny", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/hump.gif", "Hump", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/passionate.gif", "Passionate", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/suggestive.gif", "Suggestive", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/love/lust/unf.gif", "Unf!", "dA");
		createNewEmote("//e.deviantart.net/emoticons/moods/joy.gif", "Joy", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/surprise.gif", "Wow!", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/anger.gif", "Anger", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/sadness.gif", "Sadness", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/fear.gif", "Fear", "dA");
		createNewEmote("//e.deviantart.com/emoticons/moods/neutral.gif", "Neutral", "dA");

		addEmotes(num);
	}
}

function getURL1(url) // old format
{
	return("//dl.dropbox.com/u/31471793/FiMFiction/" + url + ".png");
}

function getURL2(url) // new format
{
	return("//dl.dropbox.com/u/31471793/FiMFiction/emoticons/" + url + ".png");
}
