class FactsScript {
	constructor() {
		this.refreshDelay = 600000;
		this.container = $('facts');
		this.subboxManager = null;
		this.dates = [
			{ name: 'Rosenmontag', date: '2021-02-15 01:00:00', id: 'rosenmontag' },
			{ name: 'Steuererklärungfrist', date: '2020-07-31 01:00:00', id: 'sterfrist' },
		];

		this.subboxManager = new window.SubboxManager();
		this.subboxManager.setPrefix('facts');

		var emplBox = this.subboxManager.addNewBox('wahrheit');
		emplBox.setTitle('Die Antwort');
		emplBox.setText('42');
		emplBox.injectTo(this.container);
		emplBox.setSubTitle("Halbe Wahrheit");
		emplBox.setSubText("21");

		this.getNewValues();
	}

	getNewValues() {
		this.dates.forEach(function (item, count) {

			var box = this.subboxManager.addNewBox(item.id);

			var targetDate = new Date(item.date);
			var dayDiff = Math.round((targetDate - new Date()) / 1000 / 86400);

			box.setTitle(item.name);
			box.setText("noch " + dayDiff + " Tage");
			box.injectTo(this.container);
		}.bind(this));

		setTimeout(this.getNewValues.bind(this), this.refreshDelay);
	}
}

new FactsScript();
