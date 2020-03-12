var twitterboxScript = new (new Class({

	searchFor: 'ZDF',
	scrollTimer: null,
	url: "https://search.twitter.com/search.json",

	initialize: function() {
		Locale.use('de-DE');
		this.loadTweets();
	},

	loadTweets: function()
	{
		new Request.JSONP({
		    url: this.url,
		    data: {
		    	q: this.searchFor,
		    	rpp: 15,
		    	show_user: 'true',
		    	result_type: 'recent'
		    },
		    onComplete: this.showTweets.bind(this)
		}).send();
	},

	showTweets: function(data)
	{
		$('twitterbox').empty();

		data.results.each(function(tweet) {
			var from = tweet.from;
			if(typeof(tweet.from_user_name) != "undefined" && tweet.from_user_name != "")
			{
				from = tweet.from_user_name;
			}

			var date = new Date().parse(tweet.created_at).format();
			var text = "<div class='newMeta'><div class='newFrom'>"+from +":</div>";
			text += "<div class='newDate'>"+date+"</div>";
			text += "<div class='newProfileIcon'><img src='"+tweet.profile_image_url+"'></div></div>";
			text += "<div class='newText'><span class='tweettext'>"+tweet.text.replace(new RegExp('('+this.searchFor+')',"gi"),'<span class="found">$1</span>') + '</span></div>';
			var element = document.createElement('div', {'class': 'newTweet'}).set('html', text).inject($('twitterbox'));

			(function delayAlittle()
			{
				element.getElement('.tweettext').fitText( element.getElement('.newText').getSize().y );
			}).delay(100);

		}.bind(this));

		this.scrollTimer = this.scrollToNext.delay(5000, this);
		this.loadTweets.delay(60000, this);
	},

	scrollToNext: function()
	{
		clearTimeout(this.scrollTimer);

		var firstTweet = $('twitterbox').getElement('.newTweet');
		var tweetHeight = firstTweet.getSize().y;
		firstTweet.set('tween', { onComplete: function() {
			firstTweet.setStyle('marginTop', 0);
			firstTweet.inject($('twitterbox'), 'bottom');
			this.scrollTimer = this.scrollToNext.delay(5000, this);
		}.bind(this)});
		firstTweet.tween('marginTop', tweetHeight * -1);

	}

}))();
