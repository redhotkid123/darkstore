var express = require('express');
var router = express.Router();
var models = require('../models/index');
var Yelp = require('yelp');

var yelp = new Yelp({
	consumer_key: 'NWNjebgoNS5WS5apL6J2Uw',
	consumer_secret: 'mkDjPvC2j_tMa1UfG4mSZTnLJ9w',
	token: '-BEUNjKPpIOl8dBoUKGQFGDwlAFMuTGk',
	token_secret: 'UCHvrbIruo7CNSRwlrBjgmdxY7o'
});

router.get('/', function (req, res, next) {
	res.render('index');
});

router.post('/yelp', function (req, res) {
	yelp.search({term: req.body.venue, location: req.body.zipcode})
	.then(function (data) {
		res.json(data);
	})
	.catch(function (err) {
		console.error(err);
	});
});

router.post('/comment', function (req, res) {
	models.Venue.find({
		where: {
			yelpId: req.body.yelpId
		}
	}).then(function (venue) {
		if(venue) {
			models.Comment.create({
				name: req.body.name,
				message: req.body.message,
				businessId: venue.id
			}).then(function (comment) {
				models.Comment.findAll({
					where: {
						businessId: venue.id
					},
					order: '"createdAt" DESC'
				}).then(function (comments) {
					var info = {venue: venue, comments: comments};
					res.json(info);
				})
			}).catch(function (err) {
				if(err) {
					console.log(err);
				}
			})
		}
	})

});

router.get('/results', function (req, res) {
	//searches datbase based on yelp id #
	if(req.query.bizid) {
		models.Venue.find({
			where: {
				yelpId: req.query.bizid
			}
		}).then(function (venue) {
			if(venue) {
				var vc = venue.dataValues.viewcount;
				vc++;
				venue.update({
					viewcount: vc
				}).then(function (venue) {
				// if venue is in the database already,
				// search for comments associated with venue
					models.Comment.findAll({
						where: {
							businessId: venue.id
						},
						order: '"createdAt" DESC'
					}).then(function (comments) {
						var info = {venue: venue, comments: comments};
						res.json(info);
					});
				});
			} else {
				// otherwise, add to database
				// and show more info
				models.Venue.create({
					yelpId: req.query.bizid,
					viewcount: 1
				}).then(function (venue) {
					var info = {venue: venue, comments: ''};
					res.json(info);
				}).catch(function (err) {
					if(err) {
						console.log(err);
					}
				});
			}
		}).catch(function (err) {
			if(err) {
				console.log('caught something', err);
				res.json({});
			}
		})
	} else {
		console.log('err');
	}
})

module.exports = router;