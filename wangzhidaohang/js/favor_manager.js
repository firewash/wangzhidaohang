(function () {

    const EMPTY_FAVICON = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var favorList = [
        { url: "components/webviewx.html", title: "首页", icon: "http://g.alicdn.com/browser/uc123_no/0.2.90/index/img/favicon_uc123_yellow.png", keywords: "首页 主页 第一页 " },
        { url: "http://haha.mx", title: "哈哈", icon: "http://www.haha.mx/favicon.ico", keywords: "哈哈 呵呵" },
        { url: "http://uwptest.com/2.html", title: "2.html", icon: "", keywords: "" },  //hosts for 127.0.0.1
        { url: "http://www.baidu.com", title: "省钱", icon: "" },
        { url: "components/help.html", title: "帮助", icon: EMPTY_FAVICON },
    ];
    var bindingList = new WinJS.Binding.List(favorList);

    function addItem(json) {
        if (!json.url) return null;
        json.icon = json.icon || EMPTY_FAVICON;
        bindingList.push(json);
        return json;
    }
    function removeItemByIndex(index) {
        bindingList.splice(index, 1);
    }
    
    var favorManager = {
        addItem,
        removeItemByIndex,
        bindingData: bindingList
    };


    WinJS.Namespace.define("AppManager", {
        favorManager: favorManager
    });
})();