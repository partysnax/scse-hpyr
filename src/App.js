import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  		inputLocation: '',
  		location: '',
  	}
  }
	
	handleInputChange = (e) => {
		this.setState({
			inputLocation: e.target.value,
		})
	}

	handleQuery = (e) => {
		let inputLocation = this.state.inputLocation;
		this.setState({
			location: inputLocation,
		})
	}

  render() {
  	return (
	    <div className="App">
	      <h1>TravelFinder</h1>
	      <input type="text" value={this.state.inputLocation} onChange={this.handleInputChange} />
				<button onClick={this.handleQuery}> Submit </button>
				<p>{this.state.location}</p>
	    </div>
	  );
  }
}

export default App;
