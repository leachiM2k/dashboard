class TimetableScript {
	constructor() {
		this.refreshDelay = 60000;
		this.container = $('timetable');
		this.url = '/data/timetable';
		this.elements = {
			box: document.createElement('div', { 'class': 'subbox' }),
			table: document.createElement('table'),
			tr: document.createElement('tr'),
			td: document.createElement('td'),
		};
		this.subboxManager = null;

		this.subboxManager = new SubboxManager();
		this.subboxManager.setPrefix('timetable');
		this.getTimetable();
	}

	getTimetable() {
		this.request(this.parseTimeTable.bind(this), function () {
			setTimeout(this.getTimetable.bind(this), this.refreshDelay);
		}.bind(this));
	}

	parseTimeTable(data) {
		var bx = this.elements.box.cloneNode();

		const head = document.createElement('div');
		head.classList.add('timetableHead');
		head.innerText = 'Abfahrt für ' + data.dm.points.point.name;
		bx.appendChild(head);

		var tbl = this.elements.table.cloneNode();
		tbl.classList.add('timetableTable');

		var createCell = function (text, classNames) {
			var cell = this.elements.td.cloneNode();
			cell.innerText = text;

			cell.classList.add.apply(cell.classList, [].concat(classNames));
			return cell;
		}.bind(this);

		var padStart = function(what, withThat, len) {
			return typeof withThat === 'string' && withThat.length === 1 ? withThat.repeat(Math.max(len - String(what).length, 0)) + String(what) : what;
		};

		data.departureList.forEach(function (line) {
			var row = this.elements.tr.cloneNode();
			row.appendChild(createCell(padStart(line.dateTime.hour, '0', 2) + ':' + padStart(line.dateTime.minute, '0', 2), 'time'));
			var trainClassNames = ['train'];
			if (line.servingLine.motType === "4") {
				trainClassNames.push('tram');
			} else if (line.servingLine.type === "2") {
				trainClassNames.push('ubahn');
			}
			row.appendChild(createCell(line.servingLine.symbol, trainClassNames));
			row.appendChild(createCell(line.servingLine.direction, 'goal'));
			row.appendChild(createCell(Number(line.servingLine.delay) > 0 ? '+ ' + line.servingLine.delay + ' Min' : 'pünktlich', ['ris', Number(line.servingLine.delay) > 0 ? 'delayed' : 'ontime']));
			tbl.appendChild(row);
		}.bind(this));

		bx.appendChild(tbl);
		bx.classList.add('subbox');
		bx.style.display = 'initial';
		var subbox = this.subboxManager.addNewRawBox('timetable', bx);
		subbox.injectTo(this.container);
	}

	request(success, complete) {
		getJSON(this.url, function (err, data) {
			if (!err) {
				success(data);
			}
			complete();
		});
	}
}

new TimetableScript();
