import { useState, useEffect, useContext } from 'react'
import { Object} from './Classes.jsx'
import StatsAndMenus from './StatsBoard.jsx'
import { RecordsContext } from './App.jsx'
import './GameBoard.css'

function Square (id, className, code) {
    this.id = id;
    this.className = className;
    this.code = code;
}

// JSX Componet for playing the game
function Board({stageName}) {

  /******************************************
   * Part 1 Variables
   */
  // global variable to store records
  const [records, setRecords] = useContext(RecordsContext);

  // variables to store the state of the game.
  const [steps, setSteps] = useState(0);
  const [regrets, setRegrets] = useState(0);
  const [endGame, setEndGame] = useState(false);

  // variables for map information
  const [warehouseMap, setWarehouseMap] = useState(null);

  // variables for objects
  const [squares, setSquares] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [crates, setCrates] = useState([]);

  /************************************
   * Part 2 useEffects
   */
  // Load map from URL 
  useEffect(() => {
    getWarehouseMap(stageName)
      .then(map => {
        setWarehouseMap(map);

        setSquares(createSquares(map));
        setEmployee(createEmployee(map));
        setCrates(createCrates(map));
      })
      .catch(console.error);
  }, []);

  // register keyboard handler
  useEffect(()=>{
    if (!warehouseMap) {
        return;
    }
    const handleKeyDown = e => {
        if (endGame) 
            return;
        let shift = 0;
        switch (e.key) {
          case 'ArrowUp':
            shift-=employee.columns;
            break;
          case 'ArrowDown':
            shift+=employee.columns;
            break;
          case 'ArrowLeft':
            shift-=1;
            break;
          case 'ArrowRight':
            shift+=1;
            break;
          case 'Backspace':
            goBack();
            break;
          default: return;
        }
        if (shift!=0) {

            let oneStepID = getNextID(shift);
            let twoStepsID = getNextID(shift*2);            
            if (oneStepID && isFloorOrPoint(oneStepID) && !hasCrate(oneStepID)) {
                employee.moveToID(oneStepID);
                crates.forEach(crate=>{crate.stayPut()});
                setSteps(prev => prev + 1);
                setRegrets(prev => Math.min(prev+1, 3));
            } else if (oneStepID && hasCrate(oneStepID) && twoStepsID && isFloorOrPoint(twoStepsID) && !hasCrate(twoStepsID)) {
                employee.moveToID(oneStepID);
                crates.forEach(crate=>{
                    if (crate.curPos.getID()==oneStepID) {
                        crate.moveToID(twoStepsID);
                    } else {
                        crate.stayPut();
                    }
                });
                setSteps(prev => prev + 1);
                setRegrets(prev => Math.min(prev+1, 3));
            }
        }
        e.preventDefault();
    };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
  }, [endGame, regrets, employee]);

  // refresh the board, and verify if the game is over.
  useEffect(()=>{
    if (!warehouseMap) {
        return;
    }
    renderEmployee();
    renderCrates();
    verifyResult();
  }, [steps, employee]);

  if (!warehouseMap) {
    return <div>Loading…</div>;
  }

  /***************************************
   * Part 3 Helper functions.
   */

  // refresh the employee on the map.
  function renderEmployee()
  {
    if (employee.prevPos) {
        removeCode(employee);
    }
    addCode(employee);
  }

  // refresh the crates on the map
  function renderCrates()
  {
    crates.forEach(crate=>{
        if (crate.prevPos) {
            removeCode(crate);
        }
        addCode(crate);
    });
  }

  // verify if the game is over.
  function verifyResult()
  {
    if (!endGame) {
        var gameOver = false;
        const correct_num = crates.reduce((acc, crate)=> acc+(squares[crate.curPos.getID()].code=='p'?1:0), 0);
        if (correct_num == crates.length) {
            gameOver = true;
            let record = records[getStageID()];
            if (record=='-' || record>steps) {
                setRecords(prev=>{
                    let begin = prev.slice(0, getStageID());
                    let end = prev.slice(getStageID()+1);
                    return ([...begin, steps, ...end]);
                });
            }
        }
        setEndGame(prev=>gameOver);
    }
  }

  // retrieve the map from URL.
  async function getWarehouseMap(stageName) 
  {
      const baseLink = "https://raw.githubusercontent.com/JohnnyBean181/assignments_dgmd_e28/main/final/";
      const ext = ".json";
      const url = baseLink+stageName+ext;

      const request = new Request(url);
      try {
          const response = await fetch(request);
          const json = await response.json();
          if (response.status == 200) {
              return json;
          } else {
              console.log('Server Error', words);
          }
      } catch(error) {
          console.log('Fetch Error', error);
      }
  }

  // remove a tag from a div's class attribute.
  function removeCode(object)
  {
    if (object.prevPos) {
        let id = object.prevPos.getID();
        setSquares(prev =>{
            // make a shallow copy of the array
            const next = prev.slice();

            // grab the old Square
            const oldSq = next[id];

            // split, filter, and rejoin its className
            const newClassName = oldSq.className
                .split(' ')
                .filter(c => c !== object.code)
                .join(' ');

            // replace that index
            next[id] = new Square(oldSq.id, newClassName, oldSq.code);

            return next;
        });
    }
  }

  // verify if a square on the board is 'floor' or 'point'
  function isFloorOrPoint(ID) {
    return (squares[ID].code=='f' || squares[ID].code=='p')?true:false;
  }

  // verify if a square with ID has crate on it.
  function hasCrate(ID) {
    for(const crate of crates) {
        if (crate.curPos.getID()==ID) {
            return true;
        }
    }
    return false;
  }

  // get the id of the square where the object will go.
  function getNextID(shift)
  {
    let new_id = employee.curPos.getID() + shift;
    let size = employee.rows * employee.columns;
    return (new_id>=0 && new_id<size)?new_id:-1;
  }

  // add a tag to a div's class attribute.
  function addCode(object)
  {
    let id = object.curPos.getID();
    setSquares(prev => {
        // make a shallow copy of the array
        const next = prev.slice();
      
        // grab the old Square
        const oldSq = next[id];

        const oldClasses = oldSq.className.split(' ');
      
        // get code
        const newClass = object.code;  
      
        if (!oldClasses.includes(newClass)) {
          oldClasses.push(newClass);
        }
      
        const newClassName = oldClasses.join(' ');
      
        // replace that index
        next[id] = new Square(oldSq.id, newClassName, oldSq.code);
      
        return next;
    });
  }


  // "createSquares" : Create and return a list of squares.
  function createSquares(warehouseMap)
  {
    return Array(warehouseMap["size"]).fill(0).map((_,i)=>new Square('sq'+i, `square ${warehouseMap["details"][i]}`, warehouseMap["details"][i]));
  }

  // create employee object
  function createEmployee(warehouseMap)
  {
    return new Object(warehouseMap.employee, warehouseMap.shape, "e");
  }

  // Create and return a list of crates.
  function createCrates(warehouseMap)
  {
    return warehouseMap["crates"].map((c,i)=>
        new Object(c["coords"], warehouseMap["shape"], "c")
    );
  }

  // handle go back operation.
  function goBackHandler(e) {
    e.preventDefault();
    goBack();
  }

  // real action goes here
  function goBack() {
    if (regrets>0){
        employee.moveBack();
        crates.forEach(crate=>{
          crate.moveBack();
        });
        setRegrets(prev=>prev-1);
        setSteps(prev=>prev-1);
    }
  }

  // handle restart operation
  function restartHandler(e) {
    if (warehouseMap) {
        setSquares(prev=>createSquares(warehouseMap));
        setEmployee(prev=>createEmployee(warehouseMap));
        setCrates(prev=>createCrates(warehouseMap));
        setEndGame(prev=>false);
        setRegrets(prev=>0);
        setSteps(prev=>0);
    }
  }

  // handle show instruction operation.
  function keyboardInstructionHandler(e) {
    alert("Use 'Up', 'Down', 'Left', 'Right' to move the employee, " +
     "and Use 'Backspace' to go back.");
  }

  // get the rows num of the map.
  function getRows() 
  {
    return warehouseMap?warehouseMap.shape[0]:9;
  }

  // get the columns num of the map.
  function getColumns()
  {
    return warehouseMap?warehouseMap.shape[1]:9;
  }

  // get which stage is being played.
  function getStageID()
  {
    return (stageName.slice(5)-1);
  }

  // define a style to be used by the 'gameboard'
  const style= {
    gridTemplateColumns: `repeat(${getColumns()}, 36px)`,
    gridTemplateRows: `repeat(${getRows()}, 36px)`,
    width: `${getColumns()*36}px`
  };


  return (
    <>
    {stageName}
    <div className="wrapper">
        <div id='gameboard' className='gameboard' style={style}>
            {
                squares.map((square, i)=>
                    <div key={i} id={square.id} className={square.className}/>
                )
            }
        </div>
        <div className='stats'>
            <StatsAndMenus  steps={steps} 
                            endGame={endGame} 
                            regrets={regrets} 
                            goBack={goBackHandler}
                            restart={restartHandler}
                            keyboard={keyboardInstructionHandler}/>
        </div>
    </div>
    </>
  )
}

export function GameBoard({stageName})
{
    return <Board stageName={stageName}/>
}
