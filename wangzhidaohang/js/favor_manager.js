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

    function getDefaultData(){
        return [
               { url: "components/webviewx.html", title: "首页", icon: "http://g.alicdn.com/browser/uc123_no/0.2.90/index/img/favicon_uc123_yellow.png", keywords: "首页 主页 第一页 ",locked:true },
               //{ url: "http://haha.mx", title: "哈哈", icon: "http://www.haha.mx/favicon.ico", keywords: "哈哈 呵呵" },
               //{ url: "http://uwptest.com/2.html", title: "2.html", icon: "", keywords: "" },  //hosts for 127.0.0.1
               { url: "https://alimarket.taobao.com/markets/browser/hongbao?from=uc123plus", title: "省钱", icon: "https://g.alicdn.com/mui/global/1.2.35/file/favicon.ico" },
        ];
    }

    let favorList = readDataFromStore() || getDefaultData();

    var bindingList = new WinJS.Binding.List(favorList);

    function addItem(json) {
        if (!json.url) return null;
        json.icon = json.icon || EMPTY_FAVICON;
        bindingList.push(json);
        favorList.push(json);
        saveDataToStore();
        // fetchFavorIcon(json); // todo
        return json;
    }
    function removeItemByIndex(index) {
        if (index > -1 && !favorList[index].locked) {
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
    
    function updateItem(index, part) { //todo
        if (!json.url) return null;
        json.icon = json.icon || EMPTY_FAVICON;
        bindingList.push(json);
        favorList.push(json); //todo
        saveDataToStore();
        return json;
    }

    function reset() {
        favorList = getDefaultData();
        while (bindingList.pop()){}
        favorList.forEach(function(item){
            bindingList.push(item);
        });
        saveDataToStore();
    }
    
    //先简单获取页面内的href字符串。todo：网站根目录放置；相对地址；缓存
    function getFavoriconByPageUrl(pageUrl) {
        return WinJS.Namespace.xhr({
             url:pageUrl,
             responseType: "text" //document
        }).done(function completed(result) {
            if (result.status === 200) {
                 var html = result.text;
                 var reg = /<link rel="shortcut icon" href="(.)*?>"/g; 
                 var iconUrl = "";
                 if(reg.test(html)){
                 		iconUrl = RegExp.$1;
                 }
                 return iconUrl;
            }
        }, 
        function error(result) {
            // handle error conditions.
        });
    }
    
    //function fetchFavorIcon(json) {
    //	getFavoriconByPageUrl(json.url).then(function(iconUrl){
    //			if(iconUrl){
    //				json.icon = iconUrl;
    //				updateItem(json)
    //			}
    //		});
    //}

    var favorManager = {
        addItem,
        removeItem,
        reset,
        bindingData: bindingList
    };


    WinJS.Namespace.define("AppManager", {
        favorManager: favorManager
    });
})();