import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function Lobby() {
  const games = [
    {
      id: 'sudoku',
      name: '数独',
      description: '经典逻辑填数字游戏',
      path: '/sudoku/', // 注意：这里通常跳转到独立部署的路径
      icon: '🧩'
    }
  ];

  return (
    <div className="lobby-container">
      <header>
        <h1>游戏大厅</h1>
        <p>选择一个游戏开始挑战吧！</p>
      </header>
      <div className="game-grid">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h2>{game.name}</h2>
            <p>{game.description}</p>
            {/* 在开发环境下，我们可能需要特殊处理跳转 */}
            <a href={game.path} className="play-button">开始游戏</a>
          </div>
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
