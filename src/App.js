import React from 'react';
import fetch from 'isomorphic-unfetch';
import './App.css';
const geolocator = require('geolocation');
const PRIVATE_TOKEN = 'pk.39b2a6066afe90744c8084ecd7ba931d';

class App extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  		inputLocation: '',
  		locationLat: '',
			locationLong: '',
  	}
  }

	getCurrentLocation = () => {
		console.log('Getting current location...');

		const getPosition = (err, position) => {
			if (err) throw err;
			this.setState({
				locationLat: position.coords.latitude,
				locationLong: position.coords.longitude
			})
		};

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
			location: inputLocation,
		}, this.locationLookup)
	}

	locationLookup = () => {
		fetch(`https://us1.locationiq.com/v1/search.php?key=${PRIVATE_TOKEN}&q=${this.state.location}&format=json`)
		.then(res => res.json())
		.then(res => {
			console.log(res);
			if (res.length >= 1){
				let location = res[0];
				this.setState({
					locationLat: location.lat,
					locationLong: location.lon
				})
			}
			else {
				this.setState({
					locationLat: 'err',
					locationLong: ''
				})
			}
		})
	}

  render() {
  	return (
	    <div className="App">
	      <h1>Should I Travel There (SITT)</h1>
	      <input type="text" value={this.state.inputLocation} onChange={this.handleInputChange} />
				<button onClick={this.handleInput}> Submit </button>
				<button onClick={this.getCurrentLocation}> Get Location </button>
				<p>{(this.state.locationLat !== '') ? ((this.state.locationLat !== 'err') ? `${this.state.locationLat}, ${this.state.locationLong}` : 'Location not found, try again.') : null
					}</p>
	    </div>
	  );
  }
}

export default App;
