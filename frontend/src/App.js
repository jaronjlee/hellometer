import './App.css';
import React from "react";
import Graph from "./components/graphs/graph"


function App() {

  const sayHello = () => {
    console.log("hello");
  };
  
  return (
    <div>
      <h1 className="hellometer">Hellometer</h1>
      <Graph/>
    </div>
  );
}

export default App;
