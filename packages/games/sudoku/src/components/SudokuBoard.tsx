import React, { useState, useEffect } from 'react';
import { SudokuEngine, CONFIGS, type SudokuSize, type Grid } from '../logic/sudoku';

export const SudokuBoard: React.FC = () => {
  const [size, setSize] = useState<SudokuSize>(6);
  const [grid, setGrid] = useState<Grid>([]);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<'playing' | 'won'>('playing');
  const [uncertainCells, setUncertainCells] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<number>(0.4); // 默认中等
  const [history, setHistory] = useState<{grid: Grid, uncertain: Set<string>}[]>([]);
  const [future, setFuture] = useState<{grid: Grid, uncertain: Set<string>}[]>([]);

  const startNewGame = (newSize: SudokuSize = size, newDifficulty: number = difficulty) => {
    const newEngine = new SudokuEngine(newSize);
    const { puzzle } = newEngine.generatePuzzle(newDifficulty);
    setGrid(puzzle);
    setInitialGrid(puzzle.map(row => [...row]));
    setSize(newSize);
    setDifficulty(newDifficulty);
    setSelectedCell(null);
    setStatus('playing');
    setUncertainCells(new Set());
    setHistory([]);
    setFuture([]);
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev, { grid: grid.map(r => [...r]), uncertain: new Set(uncertainCells) }]);
    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setFuture(prev => [{ grid: grid.map(r => [...r]), uncertain: new Set(uncertainCells) }, ...prev]);
    setGrid(last.grid);
    setUncertainCells(last.uncertain);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, { grid: grid.map(r => [...r]), uncertain: new Set(uncertainCells) }]);
    setGrid(next.grid);
    setUncertainCells(next.uncertain);
    setFuture(prev => prev.slice(1));
  };

  useEffect(() => {
    startNewGame(6);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (status === 'won') return;
    setSelectedCell([row, col]);
  };

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (status === 'won' || initialGrid[row][col] !== null || grid[row][col] === null) return;

    saveToHistory();
    const cellKey = `${row}-${col}`;
    const newUncertain = new Set(uncertainCells);
    if (newUncertain.has(cellKey)) {
      newUncertain.delete(cellKey);
    } else {
      newUncertain.add(cellKey);
    }
    setUncertainCells(newUncertain);
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell || status === 'won') return;
    const [row, col] = selectedCell;

    // 初始格子的数字不能修改
    if (initialGrid[row][col] !== null) return;
    // 如果数字没变，不记录历史
    if (grid[row][col] === num) return;

    saveToHistory();
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // 当填入数字（无论是否为 null）时，移除该格子的存疑标记
    const cellKey = `${row}-${col}`;
    if (uncertainCells.has(cellKey)) {
      const newUncertain = new Set(uncertainCells);
      newUncertain.delete(cellKey);
      setUncertainCells(newUncertain);
    }

    const winEngine = new SudokuEngine(size);
    if (winEngine.checkWin(newGrid)) {
      setStatus('won');
    }
  };

  const isConflict = (row: number, col: number, value: number | null) => {
    if (value === null || !grid[row]) return false;
    // 简单检查同列同行同宫是否有重复
    let count = 0;
    const config = CONFIGS[size];
    
    // 行
    for (let i = 0; i < size; i++) {
      if (grid[row] && grid[row][i] === value) count++;
    }
    // 列
    for (let i = 0; i < size; i++) {
      if (grid[i] && grid[i][col] === value) count++;
    }
    // 宫
    const startRow = Math.floor(row / config.boxRows) * config.boxRows;
    const startCol = Math.floor(col / config.boxCols) * config.boxCols;
    for (let i = 0; i < config.boxRows; i++) {
      for (let j = 0; j < config.boxCols; j++) {
        const r = startRow + i;
        const c = startCol + j;
        if (grid[r] && grid[r][c] === value) count++;
      }
    }
    
    return count > 3; // 自身被数了3次（行、列、宫）
  };

  if (grid.length === 0) return <div>Loading...</div>;

  const config = CONFIGS[size];

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-800">{size}阶数独</h1>
        <div className="group relative">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 cursor-help font-bold text-sm">
            ?
          </div>
          <div className="absolute left-full ml-2 top-0 w-64 p-3 bg-white border border-gray-200 shadow-xl rounded-lg text-sm text-gray-600 hidden group-hover:block z-10 leading-relaxed">
            <p className="font-bold text-gray-800 mb-1">游戏指南：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="font-semibold text-blue-600">填数</span>：左键选中格子，点击下方面板数字。</li>
              <li><span className="font-semibold text-orange-500 italic">存疑</span>：在已填格子上<span className="underline">右键点击</span>可切换存疑标记。</li>
              <li><span className="font-semibold text-red-500">冲突</span>：红色背景表示行、列或宫内有重复。</li>
              <li><span className="font-semibold">清除</span>：填入新数或点击清除按钮会同步移除存疑标记。</li>
              <li><span className="font-semibold text-gray-900">锁定</span>：灰底数字为初始题目，不可修改。</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">阶数:</span>
          <div className="flex gap-2">
            {[4, 6, 8, 9].map((s) => (
              <button
                key={s}
                onClick={() => startNewGame(s as SudokuSize, difficulty)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  size === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'
                }`}
              >
                {s}阶
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">难度:</span>
          <div className="flex gap-2">
            {[
              { label: '简单', val: 0.2 },
              { label: '中等', val: 0.4 },
              { label: '困难', val: 0.6 }
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => startNewGame(size, d.val)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  difficulty === d.val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="grid bg-gray-400 gap-px border-2 border-gray-800 shadow-xl"
        style={{ 
          gridTemplateColumns: `repeat(${size}, minmax(40px, 60px))`,
          gridTemplateRows: `repeat(${size}, minmax(40px, 60px))`
        }}
      >
        {grid.map((row, rIdx) => 
          row.map((cell, cIdx) => {
            const isInitial = initialGrid[rIdx][cIdx] !== null;
            const isSelected = selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx;
            const hasConflict = cell !== null && isConflict(rIdx, cIdx, cell);
            const isUncertain = uncertainCells.has(`${rIdx}-${cIdx}`);

            // 计算高亮逻辑
            const selectedVal = selectedCell ? grid[selectedCell[0]][selectedCell[1]] : null;
            const isSameNumber = selectedVal !== null && cell === selectedVal;
            
            const isInSameRow = selectedCell?.[0] === rIdx;
            const isInSameCol = selectedCell?.[1] === cIdx;
            const isInSameBox = selectedCell ? (
              Math.floor(rIdx / config.boxRows) === Math.floor(selectedCell[0] / config.boxRows) &&
              Math.floor(cIdx / config.boxCols) === Math.floor(selectedCell[1] / config.boxCols)
            ) : false;
            const isInCrosshair = isInSameRow || isInSameCol || isInSameBox;
            
            // 计算边框加粗
            const borderRight = (cIdx + 1) % config.boxCols === 0 && (cIdx + 1) !== size ? 'border-r-4 border-gray-800' : '';
            const borderBottom = (rIdx + 1) % config.boxRows === 0 && (rIdx + 1) !== size ? 'border-b-4 border-gray-800' : '';

            let textColor = 'text-blue-600';
            if (isInitial) textColor = 'text-gray-900';
            else if (isUncertain) textColor = 'text-orange-500 italic';

            // 背景颜色优先级逻辑
            let bgColor = isInitial ? 'bg-gray-200' : 'bg-white';
            if (isInCrosshair) bgColor = 'bg-blue-100';
            if (isSameNumber) bgColor = 'bg-blue-300';
            if (hasConflict) bgColor = 'bg-red-300';
            if (isSelected) bgColor = 'bg-yellow-300';

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => handleCellClick(rIdx, cIdx)}
                onContextMenu={(e) => handleContextMenu(e, rIdx, cIdx)}
                className={`
                  flex items-center justify-center text-xl font-bold cursor-pointer transition-colors
                  ${bgColor}
                  ${textColor}
                  ${borderRight} ${borderBottom}
                  hover:bg-blue-200
                `}
              >
                {cell || ''}
              </div>
            );
          })
        )}
      </div>

      {status === 'won' && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">
          恭喜你，挑战成功！
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: size }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-12 h-12 bg-white border-2 border-blue-500 text-blue-500 rounded-lg text-xl font-bold hover:bg-blue-500 hover:text-white transition"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(null)}
          className="col-span-3 sm:col-span-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition mt-2"
        >
          清除
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className={`px-6 py-2 rounded-full font-bold shadow-lg transition ${
            history.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          撤销
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className={`px-6 py-2 rounded-full font-bold shadow-lg transition ${
            future.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          重做
        </button>
        <button
          onClick={() => startNewGame()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
        >
          换一局
        </button>
        <button
          onClick={() => {
            saveToHistory();
            setGrid(initialGrid.map(row => [...row]));
            setStatus('playing');
            setSelectedCell(null);
            setUncertainCells(new Set());
          }}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 transition"
        >
          重置
        </button>
      </div>
    </div>
  );
};
