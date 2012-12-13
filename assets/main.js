var boxesMgr;

window.addEvent('load', function() {

	if(location.hash.match(/^#load=/))
	{
		var modules = location.hash.replace(/^#load=/,'').split(',').invoke("trim");
		initializeBoxesManager(modules, modules.length < 3 ? elementCount=modules.length : 3);
	}
	else
	{	
		var uri = new URI();
		uri.set('file', 'elements.json?' + new Date().getTime());
			
		new Request.JSON({
			url: uri,
			onSuccess: initializeBoxesManager
		}).get();
	}

});

function initializeBoxesManager(boxesToLoad, elementCount)
{
	if(typeof(elementCount) == "undefined" || $type(elementCount) != "number")
	{
		elementCount = 3;
	}

	boxesMgr = new BoxesManager({
		show: elementCount,
		firstChangeDelay: 10000,
		changeDelay: 10000,
		loadBoxes: boxesToLoad
	});
}

Element.implement("fitText", function(targetHeight) {
    var size = this.getSize().y;
    if (size >= targetHeight)
        return;

    var fontSize = this.getStyle("font-size").toInt();
    while(size < targetHeight) {
        fontSize += .5;
        this.setStyle("font-size", fontSize + "px");
        size = this.getSize().y;
    }
    
    if(size > targetHeight)
    {
        fontSize -= .5;
        this.setStyle("font-size", fontSize + "px");
    }
    return this;
});

function humanizeNumber(number) {
    var sizes = ['', 'K', 'M', 'G', 'T'];
    if (number == 0) return '0';
    var i = parseInt(Math.floor(Math.log(number) / Math.log(1000)));
    return Math.round(number / Math.pow(1000, i), 2) + ' ' + sizes[i];
};


function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

