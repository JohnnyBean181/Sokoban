import { useState, createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { GameBoard } from './GameBoard.jsx'
import { BrowserRouter as Router,
  Routes,
  Route,
  Link} from "react-router-dom";
import './App.css'
export const RecordsContext = createContext();

// defines the pages, as well as the records variable.
function MyRouteApp() {
  var initRecords = Array(10).fill('-');
  const [records, setRecords] = useState(initRecords);

  return (
    <>
      <RecordsContext.Provider value = {[records, setRecords]}>
        <Routes>
          <Route path="/Sokoban/" element={
              <Home />} />
          <Route path="/Sokoban/Game/:stageName" element={
              <Game />} />
          <Route path="/Sokoban/Records" element={
              <Records />} />
          <Route path="/Sokoban/About" element={
              <About />} />
          <Route path="*" element={<My404 />} />
        </Routes>
      </RecordsContext.Provider>
    </>
  );
}

// Navigation Bar
function NavBar() {
  return (
    <>
      <div className="links">
        <Link to="/Sokoban/">Home</Link>
        <Link to="/Sokoban/Records">Records</Link>
        <Link to="/Sokoban/About">About</Link>
      </div>
      <hr />
    </>
  );
}

// The homepage, used to select stages.
function Home() {
  return (
  <>
    <div className="homeWrapper">
        <NavBar />
        <div id='menu' className='menu'>
            {
                Array(10).fill(0).map((_, i)=>
                    <div key={i} id={'stage'+(i+1)} className="stage">
                      <Link to={`/Sokoban/Game/${'stage'+(i+1)}`}>
                        {'Stage '+(i+1)}
                      </Link>
                    </div>
                )
            }  
        </div>
    </div>
  </>
  );
}

// The component to play games.
function Game() {

  const { stageName } = useParams()

  if(!stageName) {
    return <p>No stage selected.</p>
  }

  return (
  <>
    <NavBar />
    <GameBoard stageName={stageName}/>
  </>
  );
}

// The component to display records
function Records() {
  const [records, setRecords] = useContext(RecordsContext);

  return (
  <>
    <NavBar />
      {
        records.map((record, i)=>
        <div key={i}>
          Stage {++i} -------- {(record=='-')?'No Record':(record+' steps')} 
        </div>)
      }
  </>
  );
}

// the component to introduce the game.
function About() {
  return (
    <>
      <NavBar />
      <p/>
      Sokoban is japanese for 'warehouse keeper'.
      <p/>
      This puzzle game was originally invented in Japan in the early 80's.
      <p/>
      You have to push crates to their proper locations with a minimum number of moves.
      <p/>
      Have fun, good luck!
    </>
  )
}

// any unknown pages go here.
function My404() {
  return (
    <>
      <NavBar />
      <h2>Page not found!</h2>
    </>
  )
}

function App() {

  return (
    <>
      <div className="container">
        <header>
            <h2>Sokoban</h2>
        </header>
        <Router>
          <MyRouteApp />
        </Router>
      </div>
    </>
  )
}

export default App
