var timetableScript = new (new Class({
	refreshDelay: 60000,

	container: $('timetable'),
	url: '/db/bahn.php',
	elements: {
		box: new Element('div',{'class': 'subbox'}),
		table: new Element('table'),
		tr: new Element('tr'),
		td: new Element('td'),
		
	},
	
	subboxManager: null,
	
	initialize: function()
	{
		this.subboxManager = new SubboxManager();
		this.subboxManager.setPrefix('timetable');
		this.getTimetable();
	},

	getTimetable: function()
	{
		this.request(this.parseTimeTable.bind(this), this.getTimetable.delay(this.refreshDelay, this));
	},

	
	parseTimeTable: function(data)
	{
		// this.container.empty();
		for(var u in data)
		{
			var bx = this.elements.box.clone();
			new Element('div', {'class': 'timetableHead'}).set('text', data[u][0]['route_start']).inject(bx);
			var tbl = this.elements.table.clone().addClass('timetableTable');
			data[u].each(function(line) {
				var row = this.elements.tr.clone();
				this.elements.td.clone().set('text', line.time).addClass('time').inject(row);
				var trainEl = this.elements.td.clone().addClass('train').inject(row);
				if(line.type == "SBAHN")
				{
					trainEl.addClass("sbahn");
					line.train = line.train.replace(/^s/i,'');
				} else if(line.type == "TRAM")
				{
					trainEl.addClass("tram");
					line.train = line.train.replace(/^str/i,'');
				}
				trainEl.set('text', line.train);
				
				this.elements.td.clone().set('text', line.route_ziel).addClass('goal').inject(row);
				var ris = line.ris;
				ris = ris.replace(/,.*$/,'');
				if(ris=="k.A.") ris = "";
				var risEl = this.elements.td.clone().set('text', ris);
				risEl.addClass('ris').inject(row);
				if(ris == "+0") risEl.addClass('ontime');
				if(ris.match(/\+[1-9]\d*/)) risEl.addClass('delayed');
				
				row.inject(tbl);
			}.bind(this));
			tbl.inject(bx);
			var subbox = this.subboxManager.addNewRawBox(u, bx);
			subbox.injectTo(this.container);
		}
		
		this.subboxManager.recalculateWidth();
	},
	
	request: function(success, complete)
	{
		var uri = new URI();
		uri.set("file", this.url);
		new Request.JSON({
			url: uri.toString(),
			onSuccess: success,
			onComplete: complete
		}).get();
	}

}))();
