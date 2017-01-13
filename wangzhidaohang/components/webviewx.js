(function () {
    let viewtacks = null;
    let navstacks = null;
    let pages = [];
    let autoIdPointer = 0;
    let currentPage = null;
    function init(host) {
        viewstacks = document.getElementById("viewStacks");
        navstacks = document.getElementById("navStacks");
        return this;
    }

    function getfaviconUrl(webview) {
        return new WinJS.Promise(function (resolve) {
            let asyncOp = webview.invokeScriptAsync("eval", `
            JSON.stringify(Array.from(document.getElementsByTagName('link'))
                .filter(link => link.rel.includes('shortcut icon')) //icon will take apple-touch
                .map(link => link.href))
           `);
            asyncOp.oncomplete = e => {
                var icons = JSON.parse(e.target.result);
                var icon = icons[0];
                if (!icon) {
                    icon = new URL(webview.src).origin + "/favicon.ico";
                }
                resolve(icon);
            };
            asyncOp.start();
        });

    }

    function addPage(opt) {
        let src = opt.src;
        if (src) {
            switch (Config.NewWindowOpenModeInHomePage) {
                case Config.NewWindowOpenModes.inDefaultBrowser:
                    Utils.openInBrowser({url: src});
                    return null;
                case Config.NewWindowOpenModes.inThisAppNewInstance:
                    window.open(src);
                    return null;
                case Config.NewWindowOpenModes.inThisAppInstance:
                    break;
                default:;
            }
        }

        let view = opt.view;
        // if (view) src = view.src;
        let nav = opt.nav;
        let pinned = !!opt.pinned;
        let id = autoIdPointer++;
        if (!view || !nav) {
            view = document.createElement("x-ms-webview");
            view.className = "coming";
            nav = document.createElement("li");
            nav.innerHTML = "loading...";
        }

        view.addEventListener("MSWebViewNewWindowRequested", e => {
            console.log("NewWindowRequested");
            this.addPage({ src: e.uri , active: true});
            e.preventDefault();
        });

        view.addEventListener("MSWebViewNavigationStarting", e => {
            if (!pinned) {
                // setCurrentPage(id);
            }
            view.classList.remove("coming");
            viewstacks.classList.add("pageloading");
        });

        view.addEventListener("MSWebViewDOMContentLoaded", e => {
            if (!pinned) {
                nav.innerHTML = view.documentTitle;
                nav.title = view.documentTitle + "\n" + view.src;
            }
            viewstacks.classList.remove("pageloading");
            getfaviconUrl(view).then(faviconUrl => {
                faviconUrl && (nav.dataset.favicon = faviconUrl);
            });
        });

        nav.addEventListener("click", e => {
            setCurrentPage(id);
        });

        nav.addEventListener("contextmenu", e => {
            if (!src) return;
            //if(!opt.pinned) closePage(index);
            //var menu = document.querySelector('#navMenu');
            // menu.winControl.show(nav, 'right', 'center');     
            //var menu = document.querySelector('#navMenu');
            function onSaveFavor() {
                AppManager.favorManager.addItem({
                    url: src,
                    title: nav.innerText,
                    icon: nav.dataset.favicon
                });
            }
            function onOpenInBrower() {
                Utils.openInBrowser({ url: src });
            }
            function pageToWinRT(pageX, pageY) {
                var zoomFactor = document.documentElement.msContentZoomFactor;
                return {
                    x: (pageX - window.pageXOffset) * zoomFactor,
                    y: (pageY - window.pageYOffset) * zoomFactor
                };
            }
            var menu = new Windows.UI.Popups.PopupMenu();
            menu.commands.append(new Windows.UI.Popups.UICommand("添加收藏", onSaveFavor));
            menu.commands.append(new Windows.UI.Popups.UICommand("在浏览器中打开", onOpenInBrower));
            // We don't want to obscure content, so pass in the position representing the selection area.
            // We registered command callbacks; no need to handle the menu completion event
            try {
                menu.showAsync(pageToWinRT(e.pageX, e.pageY)).then(function (invokedCommand) {
                    if (invokedCommand === null) {
                        // The command is null if no command was invoked.
                        WinJS.log && WinJS.log("Context menu dismissed", "sample", "status");
                    } else {
                        WinJS.log && WinJS.log("!", e, invokedCommand);
                    }
                });
            } catch (e) {
                //
            }
        });

        viewstacks.appendChild(view);
        navstacks.appendChild(nav);

        if (src) {
            view.navigate(src);
        }

        let page = {
            src,
            view,
            nav,
            id
        };
        pages.push(page);
        if (!currentPage || opt.active) setCurrentPage(id);
        return page;
    }

    //移出一个Tab(不包含)后所有的Tab
    function closePagesBeginWith(pageIndex) {
        var after = pages.splice(pageIndex);
        for (let i = 0, len = after.length; i < len; i++) {
            var page = after[i];
            page.view.remove();
            page.nav.remove();
        }
        return this;
    }

    //移出一个tab
    function closePage(id) {
        for (var i = 0, len = pages.length; i < len; i++) {
            if (pages[i].id === id) {
                var page = pages[i];
                if (page === currentPage) {
                    var next = pages[i - 1] || pages[i + 1];
                    next && setCurrentPage(next.id);
                }
                page.view.remove();
                page.nav.remove();
                pages.splice(i, 1)[0];
                break;
            }

        }
        return this;
    }

    function closeAll() {
        closePagesBeginWith(0);
        closePage(0);
        currentPage = null;
        return this;
    }

    function setCurrentPage(id) {
        if (currentPage) {
            currentPage.view.classList.remove("current");
            currentPage.nav.classList.remove("current");
        }

        for (var i = 0, len = pages.length; i < len; i++) {
            if (pages[i].id === id) {
                currentPage = pages[i];
                currentPage.view.className = "current";
                currentPage.nav.className = "current";

                closePagesBeginWith(i + 1); // 有这个想法来节省内存
                break;
            }
        }
        
        return this;
    }

    var PageManager = {
        init,
        addPage,
        closeAll
        };

    WinJS.Namespace.define("AppManager", {
        PageManager
    });
}) ();
