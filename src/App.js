import React from 'react';
import fetch from 'isomorphic-unfetch';
import './App.css';
import weatherScore from './tools/WeatherScore.js';
import advisoryScore from './tools/AdvisoryScore.js';
const geolocator = require('geolocation');
const geolib = require('geolib');

//WORKAROUND AS DATABASES CAN'T SEEM TO WORK
const Countries = require('./db/Countries');
const Locations = require('./db/Locations');

const LOCATIONIQ_PRIVATE_TOKEN = 'pk.39b2a6066afe90744c8084ecd7ba931d';

class WeatherBox extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			showTooltip: false
		}
	}

	listHigh = () => {
		return (
			<tr>
				<td>
					HI
				</td>
				{this.props.location.weather.map((day) => {
					return (
						<td>
							{day.data.high}
						</td>
					);
				})};
			</tr>
		);
	}

	listLow = () => {
		return (
			<tr>
				<td>
					LO
				</td>
				{this.props.location.weather.map((day) => {
					return (
						<td>
							{day.data.low}
						</td>
					);
				})};
			</tr>
		);
	}

	listPrecip = () => {
		return (
			<tr>
				<td>
					PR
				</td>
				{this.props.location.weather.map((day) => {
					return (
						<td>
							{day.data.precip}
						</td>
					);
				})};
			</tr>
		);
	}


	ping = () => {
		console.log(this.props.location)
		this.setState({
			showTooltip: true
		})
	}

	pong = () => {
		this.setState({
			showTooltip: false
		})
	}

	weatherTooltip = (weather) => {
		if (this.state.showTooltip) {
			return (
				<span className="weather-tooltip" style={{ //Add all these style attributes under .weather-tooltip in the css please
					position: 'absolute', 
					width: '200px', 
					zIndex: 1, 
					bottom: '100%', 
					left: '50%', 
					marginLeft: '-100px',
					backgroundColor: 'white',
					border: '1px solid black',
					borderRadius: '5px'
					}}>
					<table>
						<tbody>
							{this.listHigh()}
							{this.listLow()}
							{this.listPrecip()}
						</tbody>
					</table>
				</span>
			);
		}
		else return null;
	}

	render () {
		return (
			<td onMouseEnter={this.ping} onMouseLeave={this.pong}>
				<div style={{position: 'relative'}}>
					{Math.round(this.props.location.weatherScore*100)}
					{this.weatherTooltip(this.props.location.weather)}
				</div>
			</td>
		);
	}
}

class Results extends React.Component {
	/*constructor (props) {
		super(props);
		this.state = {
			showTooltip: false
		}
	}*/

	row = (location, index) => {
		let imgUrl = `https://www.countryflags.io/${location.countryCode}/shiny/64.png`;
		return (
			<tr key={location.LocationId}>
				<td>{index+1}</td>
				<td><img src={imgUrl} alt={location.countryCode}/></td>
				<td>{location.LocationName}</td>
				<WeatherBox location={location} />
				<td>{Math.round(location.advisoryScore*100)}</td>
				<td>{Math.round(location.totalScore*100)}</td>
			</tr>
		);
	}

	render () {
		if (this.props.locationData.length > 0) { //IF NOT EMPTY
			//TODO: Implement a sorting system
			return (
				<div>
					<table id = 'tablee'>
						<thead>
							<tr>
								<th>Rank</th>
								<th>Country</th>
								<th>Location Name</th>
								<th>Weather Score</th>
								<th>Safety Score</th>
								<th id ='important-score'>Total Score</th>
							</tr>
						</thead>
						<tbody>
							{this.props.locationData.map((location, index) => {
								return this.row(location, index);
							})}
						</tbody>
					</table>
				</div>
			);
		}

		else { //IF EMPTY
			return null;
		}
	}
}

class SearchOptionButton extends React.Component {
	handleClick = () => {
		this.props.onClick(this.props.id);
	}

	render() {
		let buttonId = `search-option-${this.props.id}`
		return (
				<button className = 'distancechoices' id={buttonId} onClick={this.handleClick}>
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
		this.props.filterLocations(this.state.option);
	}

	processOption = (option) => {
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
				<div className='Error'>
					<p>
						Location not found!
					</p>
					</div>
			);
		}
		else {
			return (
				<div>
					<div className = "map">
					<iframe id="gmap-canvas" title="Google maps"
		  			src={`https://maps.google.com/maps?q=${this.props.lat}%2C%20${this.props.long}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
		  			frameBorder="0" height='100%' width = '100%'
		  		/>
		  				</div>
					<div className = 'question'>Where would you like to search?</div>
					<div className = 'container'>
						{(this.props.countryCode) ? (<SearchOptionButton onClick={this.processOption} id={0} text="Within my country"/>) : null}
						<SearchOptionButton onClick={this.processOption} id={1} text="Within 200 km (3 hour drive)"/>
						<SearchOptionButton onClick={this.processOption} id={2} text="Within 3000 km (4 hour flight)"/>
						<SearchOptionButton onClick={this.processOption} id={3} text="Anywhere!"/>
					</div>
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
			locationList: [],
			locationData: [],
  	}
  }

	////////////////////////////////////////////////
	// Calculate and prepare data
	////////////////////////////////////////////////
	
	compileData = (locationData) => {
		let locationDataNew = locationData.map((location) => {
			//COUNTRY CODE
			let targetCountry = Countries.find((value) => {
				return value.CountryId === location.CountryId;
			});
			let countryCode = targetCountry.CountryCode;

			//WEATHER SCORE
			let weatherScorePerDay = location.weather.map((day) => {
				let tempScore = day.score.tempScore;
				let precipScore = day.score.precipScore;
				return (2*tempScore + precipScore)/3;
			});
			let weatherScoreSum = 0;
			for (let i=0; i<weatherScorePerDay.length; i++) {
				weatherScoreSum += weatherScorePerDay[i];
			}
			let weatherScore = Math.round(1000*weatherScoreSum/(weatherScorePerDay.length))/1000;

			//TOTAL SCORE
			let totalScore = location.advisoryScore * weatherScore;

			return { ...location,
				countryCode: countryCode,
				weatherScore: weatherScore,
				totalScore: totalScore,
			}
		})
		locationDataNew.sort((a, b) => {
			return (b.totalScore - a.totalScore) //Arrange from large to small
		})
		locationDataNew = locationDataNew.slice(0,Math.min(20,locationDataNew.length));
		return locationDataNew;
	}

  calculateScores = async () => {
  	//TODO: Run async functions in parallel
		const weatherScores = await this.calculateWeatherScore();
		const advisoryScore = await this.calculateAdvisoryScore();
		let locationData = this.state.locationList.map((location, index) => {
			return {...location,
				weather: weatherScores[index],
				advisoryScore: advisoryScore[index]
			}
		})
		console.log(locationData)
		locationData = this.compileData(locationData);
		console.log(locationData);
		this.setState({
			locationData: locationData
		})
	}

	calculateAdvisoryScore = async () => {
		return Promise.all(this.state.locationList.map((location) => {
			return advisoryScore(location);
		}));
	}

	calculateWeatherScore = async () => {
		return Promise.all(this.state.locationList.map((location) => {
			return weatherScore(location);
		}));
	}

	////////////////////////////////////////////////
	// Filter locations
	////////////////////////////////////////////////
	
	filterLocations = (option) => {
		switch (option) {
			case 0:
				this.filterLocationsByCountry();
				break;
			case 1:
				this.filterLocationsByDistance(200000);
				break;
			case 2:
				this.filterLocationsByDistance(3000000);
				break;
			case 3:
				this.filterLocationsByDistance(99999999999);
				break;
			default:
				break;
		}
	}

	filterLocationsByCountry = () => {
		let locationList = [];
		let targetCountry = Countries.find((value) => {
			return value.CountryCode === this.state.locationCountry;
		});
		if (targetCountry) {
			let targetCountryId = targetCountry.CountryId;
			locationList = Locations.filter((value) => {
				return value.CountryId === targetCountryId;
			});
		}

		console.log(locationList);
		this.setState({
			locationList: locationList
		}, this.calculateScores);

	}

	filterLocationsByDistance = (maxDistance) => {
		let locationList = [];
		let targetLocation = {
			latitude: this.state.locationLat,
			longitude: this.state.locationLong,
		}
		locationList = Locations.filter((value) => {
			let valueCoords = {
				latitude: value.Latitude,
				longitude: value.Longitude,
			};
			let distance = geolib.getDistance(targetLocation, valueCoords);
			return distance <= maxDistance && distance >= 10000;
		})

		console.log(locationList);
		this.setState({
			locationList: locationList
		}, this.calculateScores);
	}
	
	////////////////////////////////////////////////
	// Get target locations
	////////////////////////////////////////////////

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
				.then(countryCode => this.submitCoordinates(lat, long, countryCode));
			}
		}

		geolocator.getCurrentPosition(getPosition);
	}

	locationLookup = () => {
		console.log("Looking up location...");

		fetch(`https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_PRIVATE_TOKEN}&q=${this.state.location}&format=json&addressdetails=1`)
		.then(res => res.json())
		.then(res => {
			console.log(res);
			if (res.length >= 1) {
				const location = res[0];
				const countryCode = (location.address.country_code) ? location.address.country_code.toUpperCase() : null;
				this.submitCoordinates(location.lat, location.lon, countryCode);
			}
			else {
				this.setState({
					locationLat: 'err',
					locationLong: ''
				})
			}
		})
	}

	submitCoordinates = (lat, long, countryCode) => {
		this.setState({
			locationLat: lat,
			locationLong: long,
			locationCountry: countryCode
		})
	}

	////////////////////////////////////////////////
	// Handle Inputs
	////////////////////////////////////////////////

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


	render() {
	  	return (
		    <div className="App">
				<div className="AppBanner" >
		        	<h1 className="header">Should I Travel There?{"\n"}</h1>
		        	<div className="text-muted">
		        		<h4 className="subheader">real time travel recommendations!</h4>
					</div>		        	
		        </div>
		        <div className="AppNonBanner">
			    	<input className = "Input" type="text" Placeholder="Where do you plan to go?" value={this.state.inputLocation} onChange={this.handleInputChange} />
					<div className = "buttonholder">
						<button className = "button1" onClick={this.handleInput}> Submit </button>
						<button className = "button1" onClick={this.getCurrentLocation}> Somewhere Nearby </button>
					</div>
					<UserConfig lat={this.state.locationLat} long={this.state.locationLong} countryCode={this.state.locationCountry} filterLocations={this.filterLocations}/>
					<Results locationData={this.state.locationData}/>		        	
		        </div>		       
	        </div>
	    );
   }
}

export default App;
