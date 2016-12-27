(function () {
    function openInBrowser(opt) {
        var url = opt.url;
        if (!url) return null;
        var uri = new Windows.Foundation.Uri(url);
        var options = new Windows.System.LauncherOptions();
        Windows.System.Launcher.launchUriAsync(uri).then(function (res) {
            console.log("使用默认程序打开成功")
        }, function (err) {
            console.log("失败")
        });
    }

    WinJS.Namespace.define("Utils", {
        openInBrowser,
    });
})();