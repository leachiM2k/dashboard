function $(el) {
    return document.getElementById(el);
}

function $$(sel) {
    return document.querySelectorAll(sel);
}

function dynamicallyLoadScript(url, options) {
    var script = document.createElement("script"); //Make a script DOM node
    script.src = url; //Set it's src to the provided URL
    if (options) {
        if(options.onload) {
            script.onload = options.onload;
            delete options.onload;
        }
        Object.keys(options).forEach(function (key) {
            script.setAttribute(key, options[key]);
        });
    }

    document.head.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

function dynamicallyLoadCss(url, options) {
    var link = document.createElement("link"); //Make a script DOM node
    link.rel = "stylesheet";
    link.media = "screen";
    link.type = "text/css";
    link.href = url;
    if (options) {
        Object.keys(options).forEach(function (key) { link.setAttribute(key, options[key])});
    }
    document.head.appendChild(link); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {

        var status = xhr.status;

        if (status === 200) {
            try {
                if (typeof xhr.response !== 'object') {
                    callback(null, JSON.parse(xhr.response));
                } else {
                    callback(null, xhr.response);
                }
            } catch (err) {
                callback(err);
            }
        } else {
            callback(status);
        }
    };

    xhr.send();
}

document.addEventListener("DOMContentLoaded", function () {
    if (location.hash.match(/^#load=/)) {
        var modules = location.hash.replace(/^#load=/, '').split(',').map(function (el) {return el.trim()});
        initializeBoxesManager(modules, modules.length < 3 ? modules.length : 3);
    } else {
        var url = new URL('./elements.json?' + new Date().getTime(), location.href);
        getJSON(url, function (err, data) {
            if (!err) {
                initializeBoxesManager(data);
            }
        });
    }

});

function initializeBoxesManager(boxesToLoad, elementCount) {
    if (typeof (elementCount) == "undefined" || typeof elementCount !== "number") {
        elementCount = 3;
    }

    window.boxesMgr = new BoxesManager({
        show: elementCount,
        firstChangeDelay: 1000,
        changeDelay: 10000,
        loadBoxes: boxesToLoad
    });
}

//
// Element.implement("fitText", function (targetHeight) {
//     var size = this.getSize().y;
//     if (size >= targetHeight) {
//         return;
//     }
//
//     var fontSize = this.getStyle("font-size").toInt();
//     while (size < targetHeight) {
//         fontSize += .5;
//         this.setStyle("font-size", fontSize + "px");
//         size = this.getSize().y;
//     }
//
//     if (size > targetHeight) {
//         fontSize -= .5;
//         this.setStyle("font-size", fontSize + "px");
//     }
//     return this;
// });

function humanizeNumber(number) {
    var sizes = ['', 'K', 'M', 'G', 'T'];
    if (number === 0) {
        return '0';
    }
    var i = parseInt(Math.floor(Math.log(number) / Math.log(1000)));
    return Math.round(number / Math.pow(1000, i), 2) + ' ' + sizes[i];
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

