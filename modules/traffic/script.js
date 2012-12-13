var trafficScript = new (new Class({
		map: null,
		overlay: null,
		
		container: $('traffic'),
		subboxManager: null,
		
		mapBox: null,
		kittenBox: null,
		kitten: [],

		initialize: function()
		{
			this.subboxManager = new SubboxManager();
			this.subboxManager.setPrefix('traffic');
			this.mapBox = this.subboxManager.addNewBox('map');
			this.mapBox.injectTo(this.container);

			this.kittenBox = this.subboxManager.addNewBox('kitten');
			this.kittenBox.injectTo(this.container);
			
			this.subboxManager.recalculateWidth();
			google.load("maps", "3", {"callback" : this.initializeTrafficMap.bind(this), "other_params": "sensor=false"});
			google.load("feeds", "1", {"callback" : this.initializeKitten.bind(this) });
		},
		
		initializeTrafficMap: function () {
			this.mapBox.getDom().empty();
			var options = {
					zoom: 9,
					center: new google.maps.LatLng(51.128522,6.93237),
					disableDefaultUI: true,
					mapTypeId: google.maps.MapTypeId.ROADMAP
			};
		    this.map = new google.maps.Map(this.mapBox.getDom(), options);
		    this.addOverlay();
		},

		addOverlay: function()
		{
		    console.log("refreshing TrafficOverlay ....");
		    if(this.overlay == null)
		    	this.overlay = new google.maps.TrafficLayer({incidents:true});
		    this.overlay.setMap(this.map);

		    this.removeOverlay.delay(600000, this);
		},
		
		removeOverlay: function()
		{
		    console.log("remove overlay ....");
			this.overlay.setMap(null);
			this.addOverlay.delay(1000, this);
		},
		

		initializeKitten: function()
		{
			var feed = new google.feeds.Feed("http://feeds.feedburner.com/Octocats");
			feed.setNumEntries(25);
			
			feed.load(this.processLoadedKitten.bind(this));
		},
		
		processLoadedKitten: function(result)
		{
			if (!result.error) {
				for (var i = 0; i < result.feed.entries.length; i++) {
					var entry = result.feed.entries[i];
					this.kitten.push(entry.content);
				}
				this.rotateKitten();
			}
		},
				
		rotateKitten: function()
		{
			var kitten = this.kitten[ $random(0, this.kitten.length-1) ];
			this.kittenBox.getDom().empty();
			var height = this.kittenBox.getDom().getDimensions(true).height;
			this.kittenBox.getDom().set('html', kitten);
			this.kittenBox.getDom().getElement('img').addEvent('load', function() {
				this.kittenBox.getDom().getElement('img').setStyle('height', height);
			}.bind(this));
			this.rotateKitten.delay(30000, this);
		}
}))();
