import DarkSkyApi from 'dark-sky-api';
DarkSkyApi.apiKey = '29f3d8764adeaf07d2d768d3c26c69cf';
DarkSkyApi.units = 'ca';

function scorePerTemp (temp) {
	if (temp <= -10) {
		return 0;
	}
	else if (temp <= 10) {
		return (temp+10)*0.03;
	}
	else if (temp <= 15) {
		return 0.6 + (temp-10)*0.08;
	}
	else if (temp <= 25) {
		return 1;
	}
	else if (temp <= 30) {
		return 0.6 + (30-temp)*0.08;
	}
	else if (temp <= 40) {
		return (40-temp)*0.06;
	}
	else {
		return 0;
	}
}

function scorePerDay (day) {
	let tempHigh = day.temperatureHigh;
	let tempLow = day.temperatureLow;
	let precip = day.precipProbability;
	let tempScore = 0.8*scorePerTemp(tempHigh) + 0.2*scorePerTemp(tempLow);
	tempScore = Math.round(tempScore*1000)/1000;
	let precipScore = 2/(precip+1) - 1;
	precipScore = Math.round(precipScore*1000)/1000;
	return {tempScore: tempScore, precipScore: precipScore};
}

async function weatherScore (location) { //location object has CountryID, LocationName, Latitude, Longitude
	let coords = {
		latitude: location.Latitude,
		longitude: location.Longitude
	};
	let result = await DarkSkyApi.loadForecast(coords);
	let dayList = result.daily.data;
	//console.log(dayList);
	let dayScores = dayList.map(day => {return scorePerDay(day)});
	//console.log(dayScores);
	return Promise.resolve(dayScores);
}

export default weatherScore;