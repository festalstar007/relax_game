import type { CSSProperties } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function Lobby() {
  const games = [
    {
      id: 'sudoku',
      name: '数独',
      description: '经典逻辑填数字游戏',
      path: '/sudoku/',
      icon: '🧩',
      tag: '逻辑推理',
      accent: '#2f80ed',
    },
    {
      id: 'minesweeper',
      name: '扫雷',
      description: '翻开方格、标记地雷，挑战逻辑与运气',
      path: '/minesweeper/',
      icon: '💣',
      tag: '经典怀旧',
      accent: '#ef4444',
    },
    {
      id: 'bulls-and-cows',
      name: '猜数字',
      description: '根据 1A2B 反馈逐步推理，猜中 4 位不重复数字',
      path: '/bulls-and-cows/',
      icon: '🐂',
      tag: '策略演算',
      accent: '#f59e0b',
    }
  ];

  return (
    <div className="lobby-shell">
      <header className="lobby-bar">
        <p>游戏大厅</p>
        <span>{games.length} 款游戏</span>
      </header>

      <div className="game-grid">
        {games.map(game => (
          <article
            key={game.id}
            className="game-card"
            style={{ '--card-accent': game.accent } as CSSProperties}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-info">
              <div className="game-head">
                <h2>{game.name}</h2>
                <span className="game-tag">{game.tag}</span>
              </div>
              <p>{game.description}</p>
            </div>
            <a href={game.path} className="play-button">进入游戏</a>
          </article>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
      </Routes>
    </Router>
  );
}

export default App;
