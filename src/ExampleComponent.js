import React, { Component } from 'react'; //Needed for every component

class ExampleComponent extends Component {
	render() { //Render function is what is actually displayed
		return (
			<div style={{width: '100%', backgroundColor: '#000066', fontFamily: 'Comic Sans MS, sans-serif'}}>
				Hello I'm an example!
			</div>
		);
	}
}

export default ExampleComponent; //Needed too