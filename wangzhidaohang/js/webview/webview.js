let PageManager = (function () {
    let viewtacks = null;
    let navstacks = null;
    let pages = [];
    let currentPage = null;
    function init(host) {
        viewstacks = document.getElementById("viewStacks");
        navstacks = document.getElementById("navStacks");
    }

    function addPage(opt) {
        let view = opt.view;
        let nav = opt.nav;
        let src = opt.src;
        let pinned = !!opt.pinned;
        let index = pages.length;
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
        viewstacks.appendChild(view);        
        navstacks.appendChild(nav);

        view.addEventListener("MSWebViewDOMContentLoaded", e => {
            if (!pinned) {
                nav.innerHTML = view.documentTitle;
                view.classList.remove("coming");
            }
            
        });

        nav.addEventListener("click", e => {
            setCurrentPage(index);
        });
        nav.addEventListener("contextmenu", e => {
            removePage(index);
        });

        if (src) {
            view.navigate(src);
        }
        
        let page = {
            src,
            view,
            nav,
            index
        };
        pages.push(page);
        if (!currentPage) currentPage = page;
        return page;
    }

    //移出一个Tab后所有的Tab
    function removePagesBeginWith(pageIndex) {
        var after = pages.splice(pageIndex);
        for (let i = 0, len = after.length; i < len; i++) {
            var page = after[i];
            page.view.remove();
            page.nav.remove();
        }
    }

    //移出一个tab
    function removePage(index) {
        var page = pages.splice(index, 1)[0];
        if (page) {
            page.view.remove();
            page.nav.remove();
            if (page === currentPage) {
                setCurrentPage(pages[pages.length-1]);
            }
        }
             
    }

    function setCurrentPage(pageIndex) {
        if (currentPage) {
            currentPage.view.classList.remove("current");
            currentPage.nav.classList.remove("current");
        }
        
        currentPage = pages[pageIndex];
        if (currentPage) {
            currentPage.view.className = "current";
            currentPage.nav.className = "current";
        }
        

        // removePagesBeginWith(pageIndex + 1); // 有这个想法来节省内存
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
