// Everything! The mother component
var ResultBox = React.createClass({
	getInitialState: function () {
		return {searchResults: []};
	},

	_handleSubmit: function(query){
		// make ajax call to yelp api
		$.ajax({
			url: "/yelp",
			dataType: 'json',
			type:'POST',
			data: query,
			cache: false,
			success: function (data) {
				this.setState({searchResults: data});
			}.bind(this),
			error: function (xhr, status, err) {
				console.log(status, err.toString());
			}.bind(this)
		});
	},

	render: function () {
		return (
			<div>
				<SearchForm onSearchSubmit={this._handleSubmit} />
				<div className="resultBox">
					<ResultList searchResults={this.state.searchResults} />
				</div>
			</div>
			);
	}
});

// all comments are wrapped in the CommentBox with nested comments (via CommentWrapper)
var CommentBox = React.createClass({

	render: function () {

		 if(!(typeof this.props.newResults === 'undefined') && (this.props.newResults.comments.length > this.props.commentResults.length)) {
			var commentNodes = this.props.newResults.comments.map(function (comment) {
				return (<CommentWrapper key={comment.id} allinfo={comment} />);
			});
		} else if(this.props.commentResults){
			var commentNodes = this.props.commentResults.map(function (comment) {
				return (<CommentWrapper key={comment.id} allinfo={comment} />);
			});
		}
		return (<div>{commentNodes}</div>);
		}
});

// each comment formatted/ rendered
var CommentWrapper = React.createClass({
	render: function () {
		return (
			<p> {this.props.allinfo.name}: {this.props.allinfo.message} </p>
			);
	}
})

// the giant unordered list item with nested elements (via ResultWrapper)
var ResultList = React.createClass({
	render: function () {

		if(this.props.searchResults.businesses){
			var resultNodes = this.props.searchResults.businesses.map(function (result) {
				return (<ResultWrapper key={result.id} data={result} />);
			});
		}
		return (<ul className="resultList"> {resultNodes} </ul>);
	}
});

// deals with data for each restaurant
var RestaurantBox = React.createClass({
	getInitialState: function () {
		return {commentResults: []};
	},

	_handleCommentSubmit: function(query) {
			var combinedInfo = {name: query.name, message: query.message, yelpId: this.props.restaurant.id};
			$.ajax({
				url: "/comment",
				dataType: 'json',
				type:'POST',
				data: combinedInfo,
				cache: false,
				success: function (data) {
					this.setState({commentResults: data});
					this.setState({newResults: data});
				}.bind(this),
				error: function (xhr, status, err) {
					console.log(status, err.toString());
				}.bind(this)
			});
		},

	render: function () {
		// display info only if restaurant and viewcount are available
		if (this.props.restaurant.name && this.props.dbVenue.viewcount) {
			return (
				<div>
					<p> Viewcount: {this.props.dbVenue.viewcount} </p>
					<p> Phone: {this.props.restaurant.display_phone} </p>
					<p> Rating: {this.props.restaurant.rating} </p>
					<p> Description: {this.props.restaurant.snippet_text} </p>
					<div><CommentBox commentResults={this.props.commentResults} newResults={this.state.newResults} /></div>
					<CommentForm onCommentSubmit={this._handleCommentSubmit} />
				</div>
				);
		}
		// otherwise, return empty div
		else {
			return <div></div>;
		}
	}
})

// list of places once yelp returns a list of venues
var ResultWrapper = React.createClass({
	getInitialState: function () {
		return {
			commentResults: [],
			restaurant: [],
			dbVenue: []
		};
	},

	render: function() {
		// when you click on name of venue, bind information
		let boundResult = this.onNameClick.bind(this, this.props.data.id);	
		return (
			<div>
				<li onClick={boundResult}>{this.props.data.name} </li>
				<div><RestaurantBox restaurant={this.state.restaurant} dbVenue={this.state.dbVenue} commentResults={this.state.commentResults} /></div>
			</div>
			
		);
	},

	onNameClick: function(bizid, e) {
		var bizid = {bizid: bizid};
		// make get request to receive comments & viewcount associated with venue clicked
		$.ajax({
			url: "/results",
			dataType: 'json',
			type:'GET',
			data: bizid,
			cache: false,
			success: function (data) {
				this.setState({restaurant: this.props.data});
				this.setState({commentResults: data.comments});
				this.setState({dbVenue: data.venue});
			}.bind(this),
			error: function (xhr, status, err) {
				console.log(status, err.toString());
			}.bind(this)
		});
	}
});

var CommentForm = React.createClass({
	getInitialState: function() {
		return {name: '', message: ''};
	},

	handleNameChange: function(e) {
		this.setState({name: e.target.value});
	},

	handleMessageChange: function(e) {
		this.setState({message: e.target.value});
	},

	handleCommentSubmit: function (e) {
		e.preventDefault();
		var name = this.state.name.trim();
		var message = this.state.message.trim();

		// if either field is empty, nothing
		if(!name || !message) {
			return;
		}

		var query = {name: name, message: message};

		// pass along query to ._handleCommentSubmit function in RestaurantBox
		this.props.onCommentSubmit(query);
		// clear out comment form
		 this.setState({name: '', message: ''});
	},

	render: function() {
		return (
			<form className="commentForm" onSubmit={this.handleCommentSubmit}>
			<input type="text" placeholder="Name" value={this.state.name} onChange={this.handleNameChange} />
			<input type="text" placeholder="Message" value={this.state.message} onChange={this.handleMessageChange} />
			<input type="submit" value="Post Comment" />
			</form>
		);
	}
})

var SearchForm = React.createClass({
	getInitialState: function() {
		return {venue: '', zipcode: ''};
	},

	handleVenueChange: function (e) {
		this.setState({venue: e.target.value});
	},

	handleZipChange: function (e) {
		this.setState({zipcode: e.target.value});
	},

	handleSubmit: function (e) {
		e.preventDefault();
		var venue = this.state.venue.trim();
		var zipcode = this.state.zipcode.trim();

		if(!venue || !zipcode) {
			return;
		}

		var query = {venue: venue, zipcode: zipcode};
		// pass along query to ._handleSubmit function in ResultBox
		this.props.onSearchSubmit(query);
		// clear out search form
		this.setState({venue: '', zipcode: ''});
	},

	render: function() {
		return (
			<form className="searchForm" onSubmit={this.handleSubmit}>
			<input type="text" placeholder="Venue" value={this.state.venue} onChange={this.handleVenueChange} />
			<input type="text" placeholder="Zip Code" value={this.state.zipcode} onChange={this.handleZipChange} />
			<input type="submit" value="Search" />
			</form>
			);
	}
});


ReactDOM.render(<ResultBox />, document.getElementById('everything'))