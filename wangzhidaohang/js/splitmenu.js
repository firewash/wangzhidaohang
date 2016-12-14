﻿"use strict";

(function () {
	const EMPTY_FAVICON = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var topmenus = [
        { url: "components/webviewx.html", title: "首页", icon: "http://g.alicdn.com/browser/uc123_no/0.2.90/index/img/favicon_uc123_yellow.png", keywords: "首页 主页 第一页 " },
        { url: "http://haha.mx", title: "哈哈", icon: "http://www.haha.mx/favicon.ico", keywords: "哈哈 呵呵" },
        { url: "http://uwptest.com/2.html", title: "2.html", icon: "", keywords: "" },  //hosts for 127.0.0.1
        { url: "http://www.baidu.com", title: "省钱", icon: "" },
        { url: "components/help.html", title: "帮助", icon: EMPTY_FAVICON },
    ];
    var topmenusBindList = new WinJS.Binding.List(topmenus);
    
	WinJS.Namespace.define("AppDatas", {
	    appTitle: "UC123Plus",
	    topmenus: topmenusBindList,
	    addCustomTitleBar: addCustomTitleBar,
	    removeCustomTitleBar: removeCustomTitleBar,
	    paneOpenInitially: true
	});
    
	var customTitleBarPromise = WinJS.Promise.wrap();

	function addCustomTitleBar() {
	    // Wait for the previous operation to complete before starting a new one.
	    customTitleBarPromise = customTitleBarPromise.then(function () {
	        if (!customTitleBar) {
	            var host = document.createElement("div");
	            document.body.insertBefore(host, document.body.childNodes[0]);
	            return WinJS.UI.Pages.render("/html/customTitleBar.html", host).then(function (result) {
	                customTitleBar = result;
	            });
	        }
	    });
	    return customTitleBarPromise;
	}

	function removeCustomTitleBar() {
	    // Wait for the previous operation to complete before starting a new one.
	    customTitleBarPromise = customTitleBarPromise.then(function () {
	        if (customTitleBar) {
	            customTitleBar.unload();
	            document.body.removeChild(customTitleBar.element);
	            customTitleBar = null;
	        }
	    });
	    return customTitleBarPromise;
	}

    // Init Event
	WinJS.UI.Pages.define("/components/splitmenu_select.html", {
	    ready: function (element, options) {
	        var that = this;

	        element.addEventListener("selectionchanging", function (evt) {
	            if (evt.detail.newSelection.count() === 0) {
	                evt.preventDefault();
	            }
	        });
	        element.addEventListener("iteminvoked", function (evt) {
	            evt.detail.itemPromise.then(function (item) {
	                that._selectedIndex = item.index;
	                var newUrl = item.data.url;
	                if (currentScenarioUrl !== newUrl) {
	                    WinJS.Navigation.navigate(newUrl);
	                    var splitView = document.querySelector("#splitMenuElement");
	                    // splitView && splitView.winControl.closePane();
	                }
	            });
	        });
	        element.addEventListener("keyboardnavigating", function (evt) {
	            var listview = evt.target.winControl;
	            listview.elementFromIndex(evt.detail.newFocus).click();
	        });

	        this._selectedIndex = 0;

	        var lastUrl = WinJS.Application.sessionState.lastUrl;
	        AppDatas.topmenus.forEach(function (s, index) {
	            s.scenarioNumber = index + 1;
	            if (s.url === lastUrl && index !== that._selectedIndex) {
	                that._selectedIndex = index;
	            }
	        });

	        this._listview = element.querySelector(".win-listview").winControl;
	        this._listview.selection.set([this._selectedIndex]);
	        this._listview.currentItem = { index: this._selectedIndex, hasFocus: true };
	    }
	});

	WinJS.UI.Pages.define("/components/splitmenu_header.html", {
	    ready: function (element, options) {
	        WinJS.Binding.processAll();
	        
	    }});
    // End event

	function init() {
	    //wangle
	    AppDatas.paneOpenInitially = window.innerWidth > 768;
	    var splitView = document.querySelector("#splitMenuElement").winControl;
	    splitView.onbeforeclose = function () { WinJS.Utilities.addClass(splitView.element, "hiding"); };
	    splitView.onafterclose = function () { WinJS.Utilities.removeClass(splitView.element, "hiding"); };
	    function handleResize() {
	        if (window.innerWidth > 768) {
	            splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline; //none
	            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.inline;
	        } else {
	            splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.none;
	            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
	            //splitView.closePane();
	        }
	    }
	    window.addEventListener("resize", handleResize);
	    handleResize();

	    function handleSplitViewButton() {
	        splitView.paneOpened = !splitView.paneOpened;
	    }
	    var buttons = document.querySelectorAll(".splitViewButton");
	    for (var i = 0, len = buttons.length; i < len; i++) {
	        buttons[i].addEventListener("click", handleSplitViewButton);
	    }
	    // default select 
	    var url = AppDatas.topmenus.getAt(0).url;
	    nav.navigate(url, {});

	}

    // init navigating 
    var currentScenarioUrl = null;

    WinJS.Navigation.addEventListener("navigating", function (evt) {
        currentScenarioUrl = evt.detail.location;
    });

	function navigating(eventObject) {
	    var url = eventObject.detail.location;
	    var host = document.getElementById("splitContent");
	    // Call unload and dispose methods on current scenario, if any exist
	    if (host.winControl) {
	        host.winControl.unload && host.winControl.unload();
	        host.winControl.dispose && host.winControl.dispose();
	    }
	    WinJS.Utilities.disposeSubTree(host);
	    WinJS.Utilities.empty(host);
	    WinJS.log && WinJS.log("", "", "status");

	    if (/https?:\/\//.test(url)) {
            host.innerHTML = `<x-ms-webview id="defaultView" src="${url}" style="width:100%;height:100%;"></x-ms-webview>`;
	    } else {
            var p = WinJS.UI.Pages.render(url, host, eventObject.detail.state).
                then(function () {
                    //var navHistory = nav.history;
                    //app.sessionState.navigationHistory = {
                    //    backStack: navHistory.backStack.slice(0),
                    //    forwardStack: navHistory.forwardStack.slice(0),
                    //    current: navHistory.current
                    //};
                    //app.sessionState.lastUrl = url;
                });
	        p.done();
	        eventObject.detail.setPromise(p);
	    }
	    
	}
	var nav = WinJS.Navigation;
	nav.addEventListener("navigating", navigating);

	var splitmenu = window.splitmenu = {
        init
	};
	return splitmenu;
})();