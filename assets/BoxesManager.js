var BoxesManager = new Class({
	Implements:Options,
	options: {
		show: 3,
		firstChangeDelay: 10000,
		changeDelay: 10000,
		loadBoxes: []
	},
	boxes: [],
	shownBoxes: [],
	container: [],
	
	loadedScripts: [],
	
	elements: {
		div: new Element('div')
	},
	
	contSize: null,
	
	initialize: function(options) {
		this.setOptions(options);
		
		this.createContainers();

		this.options.loadBoxes.each(this.addNewBox.bind(this));
		
		this.changeRandom.delay(this.options.firstChangeDelay, this);
	},

	createContainers: function()
	{
		var documentSize = document.getSize();
		var containerHeight = Math.floor(documentSize.y / this.options.show);
		
		var container = null;
		for(var i=0; i< this.options.show; i++)
		{
			container = this.elements.div.clone().addClass('containerBox').inject($(document.body), 'top');
			container.setStyle('height', containerHeight);
			this.container.push(container);
		}
		this.contSize = container.getSize();
	},
	
	initializeBox: function(el)
	{
		if (this.shownBoxes.length < this.options.show) {
			el.removeClass("hidden");
			this.shownBoxes.push(el);
		} else {
			el.addClass("hidden");
			this.boxes.push(el);
		}
		el.setStyles({width: this.contSize.x-4, height: this.contSize.y-4});
	},
	
	insertInitialBoxes: function() {
		this.shownBoxes.each(function(el, count) {
			var container = this.container[count];
			this.contSize = container.getSize();
			el.inject(container);
		}.bind(this));

	},
	
	changeRandom: function() {
		if(this.boxes.length != 0)
		{
			var to = this.boxes.shift(); // boxes.splice(Number.random(0, boxes.length -1), 1)[0];
			var from = this.shownBoxes.shift(); // shownBoxes.splice(Number.random(0, shownBoxes.length -1), 1)[0];
			
			var cont = from.getParent('.containerBox');
			this.contSize = cont.getSize();
			var fromW = from.getSize().x;
			var computedSize = to.getComputedSize();
			var newWidth = this.contSize.x - computedSize.computedLeft - computedSize.computedRight;
			var newHeight = this.contSize.y - computedSize.computedTop - computedSize.computedBottom;
			to.setStyles({left: this.contSize.x+4, width: newWidth, height: newHeight});
			to.inject(from, 'after');
			to.removeClass("hidden");
			
			from.set('tween', {transition: Fx.Transitions.Elastic.easeIn});
			to.set('tween', {transition: Fx.Transitions.Elastic.easeOut});
						
			from.tween('left', fromW * -1);
			to.tween('left', 0);
			
			this.shownBoxes.push(to);
			this.boxes.push(from);
		}
		this.changeRandom.delay(this.options.changeDelay, this);
	},
	
	addNewBox: function(name)
	{
		var box = this.elements.div.clone().addClass('box hidden').setProperty('id', name);
		box.inject($(document.body), 'bottom');
		var uri = new URI();
		
		new Request.JSON({
			url: uri.set('file', '/modules/' + name + '/package.json').set('query', new Date().getTime()).toString(),
			onSuccess: function(json) { this.processModuleDefinition(json, box, name); }.bind(this)
		}).get();

	},
	
	processModuleDefinition: function(definition, box, name)
	{

		var callback = function() {
			this.loadStyles(definition.css, name);
			this.loadJavascripts(definition.js, name);
			this.insertBoxTitle(definition.name, box);
			
			this.initializeBox(box);
			this.insertInitialBoxes();			
		}.bind(this);
		
		if(typeof definition.html != "undefined" && definition.html != null)
		{
			this.loadHTML(definition.html, box, name, callback);
		} else {
			callback();
		}

	},
	
	loadHTML: function(file, box, name, callback)
	{
		if(typeof file == "undefined" && file != null) {
			return;
		}
		var uri = new URI();

		if(this.loadHelper.isAbsoluteUri(file))
		{
			uri.set('value', file);
		} else {
			uri.set('file', '/modules/' + name + '/'+ file).set('query', new Date().getTime());
		}
		
		new Request.HTML({
			update: box,
			evalScripts: false,
			url: uri.toString(),
			onFailure: function() { box.destroy(); },
			onSuccess: callback
		}).get();
	},
	
	loadStyles: function(css, name)
	{
		if(typeof css == "undefined" && css != null) {
			return;
		}
		var uri = new URI();
		
		css.each(function(file) {
			var idForAsset = this.loadHelper.getIdForAsset('style', name, file);
			if($(idForAsset)) $(idForAsset).destroy(); 
			if(this.loadHelper.isAbsoluteUri(file))
			{
				uri.set('value', file);
			} else {
				uri.set('file', '/modules/' + name + '/'+ file).set('query', new Date().getTime());
			}
			Asset.css(uri.toString(), { id: idForAsset });
		}.bind(this));	
	},
	
	loadJavascripts: function(js, name)
	{
		if(typeof js == "undefined" && js != null) {
			return;
		}

		var chain = [];

		js.each(function(file) {
			var idForAsset = this.loadHelper.getIdForAsset('script', name, file);
			var uri = new URI();
			var url = "";
			if(this.loadHelper.isAbsoluteUri(file))
			{
				url = uri.set('value', file).toString();
				if(this.loadedScripts.contains(url))
				{
					return;
				}
				this.loadedScripts.push(url);
			} else {
				url = uri.set('file', '/modules/' + name + '/'+ file).set('query', new Date().getTime()).toString();
			}
			if($(idForAsset)) { 
				$(idForAsset).destroy();
			}			
			chain.push({url: url, id: idForAsset, type: 'javascript'});
		}.bind(this));	
		
		this.loadHelper.loadFiles(chain);

	},
	
	insertBoxTitle: function(name, box)
	{
		if(typeof name != "undefined" && name != null && name != "")
		{
			this.elements.div.clone().addClass("title").set('text',name).inject(box, 'top');
		}
	},

	loadHelper: {
		loadFiles: function(chain)
		{
			var el = chain.shift();
			if(typeof el == "undefined" || el == null) {
				return;
			}
			Asset[el.type](el.url, {id: el.id, onLoad: function() { this.loadFiles(chain); }.bind(this) });
		},
		isAbsoluteUri: function(url) {
			return (url.match(/^[a-zA-Z]*:/) || url.match(/^\/\//));
		},
		getIdForAsset: function(type, modulename, filename) {
			return [
			        'style',
			        modulename,
			        filename.replace(/[^0-9a-zA-Z]/g,'')
			       ].join('_');
		}
	}
}); 
