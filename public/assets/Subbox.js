class SubboxManager {
	constructor(props) {
		this.prefix = '';
		this.boxes = {};
	}

	setPrefix(prefix) {
		this.prefix = prefix;
	}

	addNewBox(id) {
		if (typeof this.boxes[id] === "undefined") {
			this.boxes[id] = new Subbox(this.prefix + '_' + id);
		}
		return this.boxes[id];
	}

	addNewRawBox(id, box) {
		if (typeof this.boxes[id] === "undefined") {
			this.boxes[id] = new SubboxRaw(box);
		} else {
			this.boxes[id].setDom(box);
		}
		return this.boxes[id];
	}
}

class Subbox {
	constructor(id) {
		this.title = null;
		this.text = null;
		this.subtitle = null;
		this.subtext = null;

		this.lastInjectedTo = null;

		this.boxDom = {};

		this.elements = {
			div: document.createElement('div')
		};

		this.id = id;

		this.boxDom.wrapper = this.elements.div.cloneNode();
		this.boxDom.wrapper.setAttribute('id', this.id);
		this.boxDom.wrapper.classList.add('subbox')

		this.boxDom.head = this.elements.div.cloneNode();
		this.boxDom.head.classList.add('head');

		this.boxDom.text = this.elements.div.cloneNode();
		this.boxDom.text.classList.add('text');

		this.boxDom.wrapper.appendChild(this.boxDom.head);
		this.boxDom.wrapper.appendChild(this.boxDom.text);
	}

	setTitle(title) {
		this.title = title;
		this.boxDom.head.innerText = title;
	}

	setText(text) {
		this.text = text;
		this.boxDom.text.innerText = text;
	}

	setSubTitle(title) {
		this.subtitle = title;

		if (typeof (this.boxDom.subtitle) === "undefined") {
			this.boxDom.subtitle = this.boxDom.head.cloneNode();
			this.boxDom.subtitle.classList.add('smaller');
			this.boxDom.wrapper.appendChild(this.boxDom.subtitle);
		}
		this.boxDom.subtitle.innerText = title;
	}

	setSubText(text) {
		this.subtext = text;

		if (typeof (this.boxDom.subtext) === "undefined") {
			this.boxDom.subtext = this.boxDom.text.cloneNode();
			this.boxDom.subtitle.classList.add('smaller');
			this.boxDom.wrapper.appendChild(this.boxDom.subtitle);
		}
		this.boxDom.subtext.innerText = text;
	}

	getDom() {
		return this.boxDom.wrapper;
	}

	injectTo(where) {
		if (this.lastInjectedTo !== where) {
			where.appendChild(this.getDom());
			this.lastInjectedTo = where;
		}
	}
}

class SubboxRaw {
	constructor(box) {
		this.lastInjectedTo = null;
		this.boxDom = null;
		this.setDom(box);
	}

	getDom() {
		return this.boxDom;
	}

	setDom(box) {
		if (this.boxDom !== null) {
			this.boxDom.replaceChild(box);
		}

		this.boxDom = box;
	}

	injectTo(where) {
		if (this.lastInjectedTo !== where) {
			where.appendChild(this.getDom());
			this.lastInjectedTo = where;
		}
	}
}

window.SubboxManager = SubboxManager;
window.Subbox = Subbox;
window.SubboxRaw = SubboxRaw;
