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
            nav = document.createElement("button");
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
            if(!opt.pinned) closePage(index);
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
        // closePagesBeginWith(pageIndex + 1); // 有这个想法来节省内存
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
