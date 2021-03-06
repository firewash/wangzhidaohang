﻿"use strict";

(function () {
	var nav = WinJS.Navigation;
	var customTitleBarPromise = WinJS.Promise.wrap();
    
	WinJS.Namespace.define("AppDatas", {
	    appTitle: "UC123",
	    topmenus: AppManager.favorManager.bindingData,
	    addCustomTitleBar: addCustomTitleBar,
	    removeCustomTitleBar: removeCustomTitleBar,
	    paneOpenInitially: true
	});
    
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
	                if (nav.location !== newUrl) {
	                    WinJS.Navigation.navigate(newUrl);
	                    // var splitView = document.querySelector("#splitMenuElement");
	                    // splitView && splitView.winControl.closePane();
	                }
	            });
	        });
	        element.addEventListener("keyboardnavigating", function (evt) {
	            var listview = evt.target.winControl;
	            listview.elementFromIndex(evt.detail.newFocus).click();
	        });

	        element.addEventListener("contextmenu", function(e){
	            var url = e.target.dataset.url;
	            var locked = e.target.dataset.locked;
	            locked = locked === true || locked === "true" || locked === "1" || locked === 1;
	            if (!url || locked) return;
	            function onRemoveFavor() {
	                AppManager.favorManager.removeItem({
	                    url: url,
	                    title: nav.innerText
	                });
	            }
                function onOpenInBrower(){
                    Utils.openInBrowser({url: url});
                }
	            function pageToWinRT(pageX, pageY) {
	                var zoomFactor = document.documentElement.msContentZoomFactor;
	                return {
	                    x: (pageX - window.pageXOffset) * zoomFactor,
	                    y: (pageY - window.pageYOffset) * zoomFactor
	                };
	            }
	            var menu = new Windows.UI.Popups.PopupMenu();
	            menu.commands.append(new Windows.UI.Popups.UICommand("移除收藏", onRemoveFavor));
	            menu.commands.append(new Windows.UI.Popups.UICommand("在浏览器中打开", onOpenInBrower));
	            // We don't want to obscure content, so pass in the position representing the selection area.
	            // We registered command callbacks; no need to handle the menu completion event
	            menu.showAsync(pageToWinRT(e.pageX, e.pageY)).then(function (invokedCommand) {
	                if (invokedCommand === null) {
	                    // The command is null if no command was invoked.
	                    WinJS.log && WinJS.log("Context menu dismissed", "sample", "status");
	                } else {
	                    WinJS.log && WinJS.log("!", e, invokedCommand);
	                }
	            });
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
	        
	    }
	});
	WinJS.UI.Pages.define("/components/splitmenu_footer.html", {
	    ready: function (element, options) {
	        document.querySelector("#helpBtn").onclick = function () {
	            WinJS.Navigation.navigate("components/help.html");
	        }
	    }
	});
    // End event

	function init() {
	    //wangle
	    AppDatas.paneOpenInitially = window.innerWidth > 768;
	    var splitView = document.querySelector("#splitMenuElement").winControl;
	    splitView.onbeforeclose = function () { WinJS.Utilities.addClass(splitView.element, "hiding"); };
	    splitView.onafterclose = function () { WinJS.Utilities.removeClass(splitView.element, "hiding"); };
	    function handleResize() {
	        splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline; //none
	        if (window.innerWidth > 768) {
	            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.inline;
	        } else {
	            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
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
	var lastURL = '';
	function navigating(eventObject) {
	    var url = eventObject.detail.location;
	    if (url == lastURL) {
	        return;
	    } else {
	        lastURL = url;
	    }
	    var host = document.getElementById("splitContent");
        
	    if (host.winControl) {
	        host.winControl.unload && host.winControl.unload();
	        host.winControl.dispose && host.winControl.dispose();
	    }
	    WinJS.Utilities.disposeSubTree(host);
	    WinJS.Utilities.empty(host);
	    WinJS.log && WinJS.log("1111111");
	   
	    if (/https?:\/\//.test(url)) {
	        //host.innerHTML = `<x-ms-webview id="defaultView" src="${url}" style="width:100%;height:100%;"></x-ms-webview>`;
	        if (document.getElementById('navMenu')) {
	            throw new Error('clear unuseful');
	        }
	        var p = WinJS.UI.Pages.render('components/webviewx.html', host, eventObject.detail.state).
                then(function (ele) {
                    AppManager.PageManager.init().closeAll().addPage({
                        src: url
                    });
                });
	        p.done();
	        eventObject.detail.setPromise(p);
	    } else {	        
            var p = WinJS.UI.Pages.render(url, host, eventObject.detail.state).
                then(function (ele) {
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
	nav.addEventListener("navigating", navigating);

	var topMenu = {
        init
	};

    WinJS.Namespace.define("topMenu",topMenu);
})();