import React from 'react';
import logo from './logo.svg';
import ExampleComponent from './ExampleComponent.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      	<ExampleComponent />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and become sad.
        </p>
        <p>
        	yuer
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
