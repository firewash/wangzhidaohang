(function () {

    const EMPTY_FAVICON = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
   
    function readDataFromStore() {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var data = localSettings.values['favorList'];
        try{
            data = JSON.parse(data);
        } catch (e) {
            data = null;
        }
        return data;
    }

    function saveDataToStore() {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        localSettings.values['favorList'] = JSON.stringify(favorList);
    }

    const favorList = readDataFromStore() || [
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
        favorList.push(json);
        saveDataToStore();
        return json;
    }
    function removeItemByIndex(index) {
        if (index > -1) {
            bindingList.splice(index, 1);
            favorList.splice(index, 1);
            saveDataToStore();
        }
    }

    //先判断url吧
    function removeItem(opt) {
        var index = -1;
        favorList.some((item, i) => {
            index = i;
            return opt.url && (opt.url === item.url);
        });
        removeItemByIndex(index);
    }
    
    var favorManager = {
        addItem,
        removeItem,
        bindingData: bindingList
    };


    WinJS.Namespace.define("AppManager", {
        favorManager: favorManager
    });
})();