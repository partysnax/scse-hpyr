import React from 'react';
import fetch from 'isomorphic-unfetch';
import './App.css';
const geolocator = require('geolocation');
const geolib = require('geolib');

//WORKAROUND AS DATABASES CAN'T SEEM TO WORK
const Countries = require('./db/Countries');
const Locations = require('./db/Locations');

const LOCATIONIQ_PRIVATE_TOKEN = 'pk.39b2a6066afe90744c8084ecd7ba931d';

class SearchOptionButton extends React.Component {
	handleClick = () => {
		this.props.onClick(this.props.id);
	}

	render() {
		return (
			<button onClick={this.handleClick} style={{display: 'block', margin: 'auto'}}>
				{this.props.text}
			</button>
		);
	}
}

class UserConfig extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option: null,
		}
	}

	filterLocations = () => {
		if (this.state.option === 0) {
			console.log('I am here')
		}
	}

	processOption = (option) => {
		console.log(`Option: ${option}`);
		this.setState({
			option: option,
		}, this.filterLocations);
	}

	render() {
		if (this.props.lat === '') {
			return null
		}
		else if (this.props.lat === 'err') {
			return (
				<p>Location not found!</p>
			);
		}
		else {
			const country_code = (this.props.country_code) ? this.props.country_code : 'None';
			return (
				<div>
					<p>Location: {this.props.lat}, {this.props.long} ({country_code})</p>
					<h3>Where would you like to search?</h3>
					{(this.props.country_code) ? (<SearchOptionButton onClick={this.processOption} id={0} text="Within my country"/>) : null}
					<SearchOptionButton onClick={this.processOption} id={1} text="Within 100 km (2 hour drive)"/>
					<SearchOptionButton onClick={this.processOption} id={2} text="Within 3000 km (4 hour flight)"/>
					<SearchOptionButton onClick={this.processOption} id={3} text="Anywhere!"/>
				</div>
			);
		}
	}
}

class App extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  		inputLocation: '',
  		location: '',
  		locationLat: '',
			locationLong: '',
			locationCountry: '',
  	}
  }

  componentDidMount () {
  	console.log(Countries);
  	console.log(Locations);
  }

	getCurrentLocation = () => {
		console.log('Getting current location...');

		const getPosition = (err, position) => {
			if (err) {
				this.setState({
					locationLat: 'err',
					locationLong: ''
				})
			}
			else {
				const lat = position.coords.latitude;
				const long = position.coords.longitude;
				fetch(`https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_PRIVATE_TOKEN}&lat=${lat}&lon=${long}&format=json&addressdetails=1`)
				.then(res => res.json())
				.then(res => {
					console.log(res);
					if (res.hasOwnProperty('address') && res.address.hasOwnProperty('country_code')) {
						return res.address.country_code.toUpperCase();
					}
					else return null;
				})
				.then(country_code => this.submitCoordinates(lat, long, country_code));
			}
		}

		geolocator.getCurrentPosition(getPosition);
	}

	handleInputChange = (e) => {
		this.setState({
			inputLocation: e.target.value,
		})
	}

	handleInput = (e) => {
		let inputLocation = this.state.inputLocation;
		this.setState({
			location: inputLocation
		}, this.locationLookup)
	}

	locationLookup = () => {
		console.log("Looking up location...");

		fetch(`https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_PRIVATE_TOKEN}&q=${this.state.location}&format=json&addressdetails=1`)
		.then(res => res.json())
		.then(res => {
			console.log(res);
			if (res.length >= 1) {
				const location = res[0];
				const country_code = (location.address.country_code) ? location.address.country_code.toUpperCase() : null;
				this.submitCoordinates(location.lat, location.lon, country_code);
			}
			else {
				this.setState({
					locationLat: 'err',
					locationLong: ''
				})
			}
		})
	}

	submitCoordinates = (lat, long, country_code) => {
		this.setState({
			locationLat: lat,
			locationLong: long,
			locationCountry: country_code
		})
	}

  render() {
  	return (
	    <div className="App">
	      <h1>Should I Travel There</h1>
	      <input type="text" value={this.state.inputLocation} onChange={this.handleInputChange} />
				<button onClick={this.handleInput}> Submit </button>
				<button onClick={this.getCurrentLocation}> Get Location </button>
				<UserConfig lat={this.state.locationLat} long={this.state.locationLong} country_code={this.state.locationCountry}/>
	    </div>
	  );
  }
}

export default App;
