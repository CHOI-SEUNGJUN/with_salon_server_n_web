import React from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
// import Entrance from './components/Entrance/Entrance'
import { Entrance, Salon } from './components';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Route exact path="/" component={Entrance}></Route>
        <Route path="/room" component={Salon}></Route>
        {/* <Entrance></Entrance> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
