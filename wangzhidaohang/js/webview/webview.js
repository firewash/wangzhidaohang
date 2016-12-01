let PageManager = (function () {
    let viewtacks = null;
    let navstacks = null;
    let pages = [];
    function init() {
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
            nav = document.createElement("button");
            nav.innerHTML = "loading...";
        }

        view.addEventListener("MSWebViewNewWindowRequested", e => { // NewWindowRequested
            this.addPage({ src: e.uri });
            e.preventDefault();
        });
        viewstacks.appendChild(view);        
        navstacks.appendChild(nav);

        view.addEventListener("MSWebViewDOMContentLoaded", e => {
            if (!pinned) {
                nav.innerHTML = view.documentTitle;
            }
            
        });

        nav.addEventListener("click", e => {
            setCurrentPage(index);
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
        return page;
    }

    function removePagesBeginWith(pageIndex) {
        var after = pages.splice(pageIndex);
        for (let i = 0, len = after.length; i < len; i++) {
            var page = after[i];
            page.view.remove();
            page.nav.remove();
        }
    }

    function setCurrentPage(pageIndex) {
        var page = pages[pageIndex];
        page.className = "current";
        removePagesBeginWith(pageIndex + 1);
    }

    return {
        init,
        addPage
    };
})();

window.onload = function () {
    PageManager.init();
    PageManager.addPage({
        view: document.getElementById("defaultView"),
        nav: document.getElementById("defaultNav"),
        pinned: true
    });
};
WinJS.UI.Pages