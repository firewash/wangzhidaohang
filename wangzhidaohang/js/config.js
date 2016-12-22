// styles
(function () {
    let v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView(); //wangle 只能扩展颜色。Github sample扩展的内容能看不能交互。
    //v.titleBar.buttonBackgroundColor = Windows.UI.Colors.green;
    //v.titleBar.buttonForegroundColor = Windows.UI.Colors.yellow;
    //v.titleBar.backgroundColor = Windows.UI.Colors.indianRed;
    //v.titleBar.foregroundColor = Windows.UI.Colors.cyan;
    //v.titleBar.ExtendViewIntoTitleBar = true;
    Windows.UI.Core.AppViewBackButtonVisibility.visible = true;
})();

//configs
(function () {
    WinJS.Namespace.define("Config", {
        NewWindowOpenModes:{
            "inThisAppInstance":1,
            "inThisAppNewInstance":2,
            "inDefaultBrowser":3,
            "inUCBrowser":4
        },
        NewWindowOpenModeInHomePage: 1
    });
})();
