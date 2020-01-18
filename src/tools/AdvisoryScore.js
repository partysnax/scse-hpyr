const Countries = require('../db/Countries');
const axios = require('axios');

async function advisoryScore (location) {
	let targetCountry = Countries.find((value) => {
		return value.CountryId === location.CountryId;
	})

	let res = await axios.get(`https://www.travel-advisory.info/api?countrycode=${targetCountry.CountryCode}`)
	let advisory = res.data.data[targetCountry.CountryCode].advisory.score;
	let score = Math.round(Math.min(1, (1/9)*(advisory-5)**2)*1000)/1000;
	return Promise.resolve(score);
}

export default advisoryScore;