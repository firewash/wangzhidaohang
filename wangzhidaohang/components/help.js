(function () {
    WinJS.UI.Pages.define("/components/help.html", {
        ready: function (element, options) {
            document.querySelector("#appResetBtn").onclick = function () {
                AppManager.favorManager.reset();
            }
        }
    });
})();