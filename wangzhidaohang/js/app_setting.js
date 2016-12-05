(function () {
    let v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    v.titleBar.buttonBackgroundColor = Windows.UI.Colors.green;
    v.titleBar.buttonForegroundColor = Windows.UI.Colors.yellow;
    v.titleBar.backgroundColor = Windows.UI.Colors.indianRed;
    v.titleBar.foregroundColor = Windows.UI.Colors.cyan;
    v.titleBar.ExtendViewIntoTitleBar = true;


    Windows.UI.Core.AppViewBackButtonVisibility.visible = true;

})();