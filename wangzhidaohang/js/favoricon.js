(function () {
    var faviconLocs = new Map;

    this.getFavicon = loc => {
        let host = new URI(loc).host;

        // Exit for cached ico location
        if (faviconLocs.has(host)) {
            loc = this.faviconLocs.get(host);
            if (loc) {
                this.favicon.src = loc;
            }
            else {
                this.hideFavicon();
            }
            return;
        }
        // Asynchronously check for a favicon in the web page markup
        let asyncOp = this.webview.invokeScriptAsync("eval", `
            JSON.stringify(Array.from(document.getElementsByTagName('link'))
                .filter(link => link.rel.includes('icon'))
                .map(link => link.href))
        `);
        asyncOp.oncomplete = e => {
            // Parse result add fallbacks
            faviconFallback = JSON.parse(e.target.result);

            let protocol = loc.split(":")[0];
            if (protocol.startsWith("http") || !host) {
                loc = `${protocol}://${host}/favicon.ico`;
                faviconFallback.push(loc);
            }

            faviconFallback.push(EMPTY_FAVICON);
            this.setFavicon(faviconFallback.shift());
        };
        asyncOp.onerror = e => {
            console.error(`Unable to find favicon in markup: ${e.message}`);
            faviconFallback = [];
            this.setFavicon(EMPTY_FAVICON);
        };
        asyncOp.start();
    };

    return {

    }
})(window);