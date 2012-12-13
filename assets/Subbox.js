var SubboxManager = new Class({
	
	prefix: "",
	
	boxes: {
		
	},
	
	initialize: function()
	{
		
	},
	
	setPrefix: function(prefix)
	{
		this.prefix = prefix;
	},
	
	addNewBox: function(id)
	{
		if(typeof this.boxes[id] == "undefined")
		{
			this.boxes[id] = new Subbox(this.prefix + '_' + id);
		}
		return this.boxes[id];
	},
	
	addNewRawBox: function(id, box)
	{
		if(typeof this.boxes[id] == "undefined")
		{
			this.boxes[id] = new SubboxRaw(box);
		} else {
			this.boxes[id].setDom(box);
		}
		return this.boxes[id];
		
	},
	
	recalculateWidth: function()
	{
		var boxes = $H(this.boxes);
		var boxWidth = null;
		
		boxes.each(function(box) {
			if(boxWidth == null)
			{
				var parent = box.getDom().getParent();

				var styles = box.getDom().getStyles(['marginLeft', 'marginRight', 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight']);
				var leftOffset = styles.marginLeft.toInt() + styles.borderLeftWidth.toInt() + styles.paddingLeft.toInt();
				var rightOffset = styles.marginRight.toInt() + styles.borderRightWidth.toInt() + styles.paddingRight.toInt();
				
				boxWidth = Math.floor(parent.getScrollSize().x / boxes.getLength()) - leftOffset - rightOffset;
			}
			box.getDom().setStyle('width', boxWidth-1);
			
		});
	},
	
	recalculateHeight: function()
	{
		var boxes = $H(this.boxes);
		boxes.each(function(box) {

			var dom = box.getDom();
			var parent = dom.getParent();

			var relativePosition = dom.getPosition(parent);
			var parentSize = parent.getSize();
			var targetHeight = parentSize.y - relativePosition.y - 15;
			dom.setStyle('height', targetHeight);

			var styles = dom.getStyles(['marginTop', 'borderTopWidth', 'paddingTop']);
			targetHeight += styles.marginTop.toInt() + styles.borderTopWidth.toInt() + styles.paddingTop.toInt();
			
			var size =  dom.getSize().y;
		    var fontSize = 100;

		    while(size > targetHeight) {
		        fontSize -= .5;
		        dom.setStyle("fontSize", fontSize + "%");
		        size = dom.getSize().y;
		        if(fontSize < 10) break;
		    }

			
		});
	}
	
}); 

var Subbox = new Class({
	
	title: null,
	text: null,
	subtitle: null,
	subtext: null,
	
	lastInjectedTo: null,
	
	boxDom: {
		
	},
	
	elements: {
		div: new Element('div') 
	},

	initialize: function(id)
	{
		this.id = id;
		
		this.boxDom.wrapper = this.elements.div.clone()
			.addClass('subbox')
			.setProperty('id', this.id);
	
		this.boxDom.head = this.elements.div.clone()
			.addClass('head');
	
		this.boxDom.text = this.elements.div.clone()
			.addClass('text');
	
		this.boxDom.head.inject(this.boxDom.wrapper);
		this.boxDom.text.inject(this.boxDom.wrapper);		
	},
	
	setTitle: function(title)
	{
		this.title = title;
		this.boxDom.head.set('text', title);
	},
	setText: function(text)
	{
		this.text = text;
		this.boxDom.text.set('text', text);
	},
	
	setSubTitle: function(title)
	{
		this.subtitle = title;
		
		if(typeof(this.boxDom.subtitle) == "undefined")
		{
			this.boxDom.subtitle = this.boxDom.head.clone()
			.addClass('smaller')
			.inject(this.boxDom.wrapper);
		}
		this.boxDom.subtitle.set('text', title);
	},
	
	setSubText: function(text)
	{
		this.subtext = text;
		
		if(typeof(this.boxDom.subtext) == "undefined")
		{
			this.boxDom.subtext = this.boxDom.text.clone()
			.addClass('smaller')
			.inject(this.boxDom.wrapper);
		}
		this.boxDom.subtext.set('text', text);		
	},
	
	getDom: function()
	{
		return this.boxDom.wrapper;
	},
	
	injectTo: function(where)
	{
		if(this.lastInjectedTo != where) {
			this.getDom().inject(where);
			this.lastInjectedTo = where;
		}
	}	
});

var SubboxRaw = new Class({
	
	lastInjectedTo: null,
	boxDom: null,
	
	initialize: function(box)
	{
		this.setDom(box);
	},
	
	getDom: function()
	{
		return this.boxDom;
	},
	
	setDom: function(box)
	{
		if(this.boxDom != null)
			box.replaces(this.boxDom);
		
		this.boxDom = box;
	},
	
	injectTo: function(where)
	{
		if(this.lastInjectedTo != where) {
			this.getDom().inject(where);
			this.lastInjectedTo = where;
		}
	}	
});