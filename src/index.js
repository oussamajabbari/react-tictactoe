import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  let classNames;
  if (props.isWinningSquare) {
    classNames = "square winning-square"
  } else {
    classNames = "square"
  }
  return (
    <button className={classNames} onClick={props.onClick}>
      {props.value}
      {props.isWinningSquare}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let isWinningSquare = false;
    if (this.props.winningLine && this.props.winningLine.includes(i)) {
      isWinningSquare = true;
    }
    return (
      <Square key={i}
        value={this.props.squares[i]}
        isWinningSquare={isWinningSquare}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        {[0, 1, 2].map(i => (
          <div key={i} className="board-row">
            {[0, 1, 2].map(j => (
              this.renderSquare(i * 3 + j)
            ))}
          </div>
        ))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          winner: null,
          winningLine: [],
          lastMove: [null, null]
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (current.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";

    const result = calculateWinner(squares);
    let winner = null;
    let winningLine = null;
    if (result) {
      winner = result.winner;
      winningLine = result.winningLine;
    }

    this.setState({
      history: history.concat([
        {
          squares: squares,
          winner: winner,
          winningLine: winningLine,
          lastMove: [Math.floor(i / 3), i % 3]
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  setSortAscending(isAscending) {
    this.setState({
      isAscending: isAscending
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    let winner = current.winner;

    let moves = history.map((step, move) => {
      let desc = move ?
        'Go to move #' + move + ' (' + step.lastMove + ')' :
        'Go to game start';
      if (move === this.state.stepNumber) {
        desc = <b>{desc}</b>
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.isAscending) {
      moves = moves.reverse();
    }

    let status;
    if (history.length === 10 && this.state.stepNumber === 9 && !winner) {
      status = "Draw !"
    } else if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningLine={current.winningLine}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <div>
              <button onClick={() => this.setSortAscending(true)}>Ascending</button>
              <button onClick={() => this.setSortAscending(false)}>Descending</button>
            </div>
            <ol className="game-moves">
              {moves}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: lines[i]
      };
    }
  }
  return null;
}
