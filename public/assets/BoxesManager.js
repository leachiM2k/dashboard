var loadHelper = {
	loadFiles: function (chain) {
		var el = chain.shift();
		if (typeof el === "undefined" || el === null) {
			return;
		}
		if (el.type === 'javascript') {
			dynamicallyLoadScript(el.url, {
					id: el.id,
					onload: function onLoad() {
						this.loadFiles(chain);
					}.bind(this)
				}
			);
		} else {
			console.log('*************************** el.type', el.type);
		}
	},

	isAbsoluteUri: function (url) {
		return (url.match(/^[a-zA-Z]*:/) || url.match(/^\/\//));
	},

	getIdForAsset: function (type, modulename, filename) {
		return [
			'style',
			modulename,
			filename.replace(/[^0-9a-zA-Z]/g, '')
		].join('_');
	}
};

class BoxesManager {
	constructor(options) {
		try {
			this.boxes = [];
			this.shownBoxes = [];
			this.container = [];

			this.loadedScripts = [];

			this.elements = {
				div: document.createElement('div')
			};

			this.options = {
				show: 3,
				firstChangeDelay: 10000,
				changeDelay: 10000,
				loadBoxes: [],
			};


			Object.assign(this.options, options);

			this.createContainers();

			this.options.loadBoxes.forEach(this.addNewBox.bind(this));

			setTimeout(this.changeRandom.bind(this), this.options.firstChangeDelay);
		} catch (e) {
			console.log('***** [BoxesManager:58] ********************** ', e);
		}
	}

	createContainers() {
		var container = null;
		for (var i = 0; i < this.options.show; i++) {
			container = this.elements.div.cloneNode();
			container.classList.add('containerBox');
			$('pageContent').insertBefore(container, $('pageContent').firstChild);
			this.container.push(container);
		}
	}

	initializeBox(el) {
		if (this.shownBoxes.length < this.options.show) {
			el.classList.remove("hidden");
			this.shownBoxes.push(el);
		} else {
			el.classList.add("hidden");
			this.boxes.push(el);
		}
	}

	insertInitialBoxes() {
		this.shownBoxes.forEach(function (el, count) {
			var container = this.container[count];
			container.appendChild(el);
		}.bind(this));

	}

	changeRandom() {
		try {
			if (this.boxes.length !== 0) {
				var to = this.boxes.shift(); // boxes.splice(Number.random(0, boxes.length -1), 1)[0];
				var from = this.shownBoxes.shift(); // shownBoxes.splice(Number.random(0, shownBoxes.length -1), 1)[0];

				// var cont = from.getParent('.containerBox');
				// this.contSize = cont.getSize();
				// var fromW = from.getSize().x;
				// var computedSize = to.getComputedSize();
				// var newWidth = this.contSize.x - computedSize.computedLeft - computedSize.computedRight;
				// var newHeight = this.contSize.y - computedSize.computedTop - computedSize.computedBottom;
				// to.setStyles({ left: this.contSize.x + 4, width: newWidth, height: newHeight });
				// to.inject(from, 'after');
				// to.classList.remove("hidden");
				//
				// from.set('tween', { transition: Fx.Transitions.Elastic.easeIn });
				// to.set('tween', { transition: Fx.Transitions.Elastic.easeOut });
				//
				// from.tween('left', fromW * -1);
				// to.tween('left', 0);

				from.classList.add('hidden');
				to.classList.remove('hidden');

				this.shownBoxes.push(to);
				this.boxes.push(from);
			}
			setTimeout(this.changeRandom.bind(this), this.options.changeDelay);
		} catch (e) {
			console.log('***** [BoxesManager:123] ********************** ', e);
		}
	}

	addNewBox(name) {
		var box = this.elements.div.cloneNode();
		box.classList.add('box', 'hidden');
		box.id = name;
		$('pageContent').appendChild(box);
		var url = new URL('./modules/' + name + '/package.json', location.href);
		url.search = new Date().getTime();

		getJSON(url, function (err, json) {
			if (!err) {
				this.processModuleDefinition(json, box, name);
			}
		}.bind(this));
	}

	processModuleDefinition(definition, box, name) {
		try {
			var callback = function () {
				this.loadStyles(definition.css, name);
				this.loadJavascripts(definition.js, name);
				this.insertBoxTitle(definition.name, box);

				this.initializeBox(box);
				this.insertInitialBoxes();
			}.bind(this);

			if (typeof definition.html !== "undefined" && definition.html !== null) {
				this.loadHTML(definition.html, box, name, callback);
			} else {
				callback();
			}
		} catch (e) {
			console.log('***** [BoxesManager:146] ********************** ', e);
		}
	}

	loadHTML(file, box, name, callback) {
		if (typeof file === "undefined" && file !== null) {
			return;
		}
		var uri = new URI();

		if (loadHelper.isAbsoluteUri(file)) {
			uri.set('value', file);
		} else {
			uri.set('file', '/modules/' + name + '/' + file).set('query', new Date().getTime());
		}

		new Request.HTML({
			update: box,
			evalScripts: false,
			url: uri.toString(),
			onFailure() { box.parentNode.removeChild(box); },
			onSuccess: callback
		}).get();
	}

	loadStyles(css, name) {
		if (typeof css === "undefined" && css !== null) {
			return;
		}
		var uri = new URL(location.href);

		(css || []).forEach(function (file) {
			var idForAsset = loadHelper.getIdForAsset('style', name, file);
			var node = $(idForAsset);
			if (node) {
				node.parentNode.removeChild(node);
			}
			if (loadHelper.isAbsoluteUri(file)) {
				uri.href = file;
			} else {
				uri.pathname = '/modules/' + name + '/' + file;
				uri.search = new Date().getTime();
			}
			dynamicallyLoadCss(uri.toString(), { id: idForAsset });
		}.bind(this));
	}

	loadJavascripts(js, name) {
		if (typeof js === "undefined" && js !== null) {
			return;
		}

		var chain = [];

		(js || []).forEach(function (file) {
			var idForAsset = loadHelper.getIdForAsset('script', name, file);
			var uri = new URL(location.href);
			var url = "";
			if (loadHelper.isAbsoluteUri(file)) {
				uri.href = file;
				url = uri.toString();
				if (this.loadedScripts.indexOf(url) !== -1) {
					return;
				}
				this.loadedScripts.push(url);
			} else {
				uri.pathname = '/modules/' + name + '/' + file;
				uri.search = new Date().getTime();
				url = uri.toString();
			}
			var node = $(idForAsset);
			if (node) {
				node.parentNode.removeChild(node);
			}
			chain.push({ url: url, id: idForAsset, type: 'javascript' });
		}.bind(this));

		loadHelper.loadFiles(chain);
	}

	insertBoxTitle(name, box) {
		if (typeof name !== "undefined" && name !== null && name !== "") {
			var title = this.elements.div.cloneNode();
			title.classList.add('title');
			title.innerText = name;
			$('pageContent').insertBefore(title, box);
		}
	}
}
