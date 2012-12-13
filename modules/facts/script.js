var factsScript = new (new Class({
	refreshDelay: 600000,
	container: $('facts'),
	
	subboxManager: null,
	
	dates: [
        {name: 'Rosenmontag', date: '2013-02-11 01:00:00', id: 'rosenmontag'},
        {name: 'Steuererklärungfrist', date: '2013-05-31 01:00:00', id: 'sterfrist'},
	],
	
	initialize: function()
	{
		Locale.use('de-DE');
		this.subboxManager = new SubboxManager();
		this.subboxManager.setPrefix('facts');
		
		var emplBox = this.subboxManager.addNewBox('wahrheit');
		emplBox.setTitle('Die Antwort');
		emplBox.setText('42');
		emplBox.injectTo(this.container);
		emplBox.setSubTitle("Halbe Wahrheit");
		emplBox.setSubText("21");
		
		this.getNewValues();
		
		this.subboxManager.recalculateWidth();
	},
	getNewValues: function()
	{
		this.dates.each(function(item, count) {
			
			var box = this.subboxManager.addNewBox(item.id);
			
			var targetDate = new Date().parse(item.date);
			var dayDiff = targetDate.diff(new Date(), 'day');
			
			box.setTitle(item.name);
			box.setText(Date.getMsg('daysUntil').substitute({delta: dayDiff * -1}));
			box.injectTo(this.container);
		}.bind(this));
		
		this.getNewValues.delay(this.refreshDelay, this);
	},

}))();
