class Traffic {
	constructor() {
		this.map =  null;
		this.overlay =  null;

		this.container = $('traffic');
		this.subboxManager = null;

		this.mapBox = null;
		this.kittenBox = null;
		this.kitten = [];

		this.subboxManager = new window.SubboxManager();
		this.subboxManager.setPrefix('traffic');
		this.mapBox = this.subboxManager.addNewBox('map');
		this.mapBox.injectTo(this.container);

		google.load("maps", "3", {"callback" : this.initializeTrafficMap.bind(this), "other_params": "key=xxxxxxxxxxxxxxxxxxxxxx&sensor=false"});
	}

	initializeTrafficMap() {
		this.mapBox.getDom().innerHTML = '';
		var options = {
			zoom: 9,
			center: new google.maps.LatLng(51.128522,6.93237),
			disableDefaultUI: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.mapBox.getDom(), options);
		this.addOverlay();
	}

	addOverlay()
	{
		console.log("refreshing TrafficOverlay ....");
		if(this.overlay == null)
			this.overlay = new google.maps.TrafficLayer({incidents:true});
		this.overlay.setMap(this.map);
		setTimeout(this.removeOverlay.bind(this), 600000);
	}

	removeOverlay()
	{
		console.log("remove overlay ....");
		this.overlay.setMap(null);
		setTimeout(this.addOverlay.bind(this), 1000);
	}
}

new Traffic();
