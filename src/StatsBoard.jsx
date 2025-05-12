import './GameBoard.css'

function StatsAndMenus({steps, endGame, regrets, goBack, restart, keyboard}) {
  return (
      <>
          <div>
              Steps : {steps}
          </div>
          <div className={endGame? 'result':'result noShow'}>
              You Win!
          </div>
          <hr />
          <p>
          <button id="goBack" onClick={(e)=>goBack(e) } disabled={endGame}>Go Back : {regrets} times left</button>
          </p>
          <p>
          <button id="restart" onClick={(e)=>restart(e)}> Restart </button>
          </p>
          <p>
          <button id="keyboard" onClick={(e)=>keyboard(e)}> Keyboard Instruction</button>
          </p>
      </>
  )
}

export default StatsAndMenus
