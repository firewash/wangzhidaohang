let PageManager = (function () {
    let viewtacks = null;
    let navstacks = null;
    let pages = [];
    let autoIdPointer = 0;
    let currentPage = null;
    function init(host) {
        viewstacks = document.getElementById("viewStacks");
        navstacks = document.getElementById("navStacks");
    }

    function addPage(opt) {
        let src = opt.src;
        if (src) {
            switch (Config.NewWindowOpenModeInHomePage) {
                case Config.NewWindowOpenModes.inDefaultBrowser:
                    var uri = new Windows.Foundation.Uri("http://www.baidu.com");
                    var options = new Windows.System.LauncherOptions();
                    Windows.System.Launcher.launchUriAsync(uri).then(function (res) {
                        //console.log("使用默认程序打开成功")
                    }, function (err) {
                        //console.log("失败")
                    });
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
        let nav = opt.nav;
        let pinned = !!opt.pinned;
        let index = autoIdPointer++;
        if (!view || !nav) {
            view = document.createElement("x-ms-webview");
            view.className = "coming";
            nav = document.createElement("li");
            nav.innerHTML = "loading...";
        }

        view.addEventListener("MSWebViewNewWindowRequested", e => {
            console.log("NewWindowRequested");
            this.addPage({ src: e.uri });           
            e.preventDefault();
        });

        
        view.addEventListener("MSWebViewNavigationStarting", e => {
            if (!pinned) {
                setCurrentPage(index);
                view.classList.remove("coming");
            }
        });
        
        view.addEventListener("MSWebViewDOMContentLoaded", e => {
            if (!pinned) {
                nav.innerHTML = view.documentTitle;
            }            
        });

        nav.addEventListener("click", e => {
            setCurrentPage(index);
        });

        nav.addEventListener("contextmenu", e => {
            //if(!opt.pinned) closePage(index);
            //var menu = document.querySelector('#navMenu');
            // menu.winControl.show(nav, 'right', 'center');     
            //var menu = document.querySelector('#navMenu');
            function onSaveFavor() {
                AppManager.favorManager.addItem({
                    url: src,
                    title:nav.innerText
                });
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

        if (src) {
            view.navigate(src);
        }
        viewstacks.appendChild(view);
        navstacks.appendChild(nav);
        setTimeout(() => {

        }, 0);
        
        let page = {
            src,
            view,
            nav,
            index
        };
        pages.push(page);
        if (!currentPage) setCurrentPage(index);
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
    }

    //移出一个tab
    function closePage(index) {
        for (var i = 0, len = pages.length; i < len; i++) {
            if (pages[i].index === index) {
                var page = pages[i];
                if (page === currentPage) {
                    var next = pages[i - 1] || pages[i+1];
                    next && setCurrentPage(next.index);
                }                
                page.view.remove();
                page.nav.remove();
                pages.splice(i, 1)[0];
                break;
            }
            
        }  
    }

    function setCurrentPage(index) {
        if (currentPage) {
            currentPage.view.classList.remove("current");
            currentPage.nav.classList.remove("current");
        }
        
        for (var i = 0, len = pages.length; i < len; i++) {
            if (pages[i].index === index) {
                currentPage = pages[i];
                currentPage.view.className = "current";
                currentPage.nav.className = "current";
                break;
            }
        }
        closePagesBeginWith(index + 1); // 有这个想法来节省内存
    }

    return {
        init,
        addPage
    };
})();

window.onload = function () {
    WinJS.UI.Pages.define("/components/webviewx.html", {
        ready: function (element, options) {
            PageManager.init({
                host: document.getElementById("MyWebviewx")
            });
            PageManager.addPage({
                view: document.getElementById("defaultView"), // optional
                nav: document.getElementById("defaultNav"),// optional
                pinned: true
            });

          

            
        }
    });
};
