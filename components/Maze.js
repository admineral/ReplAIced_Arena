import React, { useState, useEffect, useCallback } from 'react';
import { mazeConfig } from '../config/mazeConfig';

const Maze = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [hoverInfo, setHoverInfo] = useState(null);

    const { map, topRanks, cellSize, mazeWidth, mazeHeight, cellGap, allowedCellColor, disallowedCellColor, bubbleColor, replacedDate } = mazeConfig;

    useEffect(() => {
        generateMaze();
    }, []);

    const generateMaze = useCallback(() => {
        const mazeContainer = document.getElementById('maze');
        if (!mazeContainer) return;

        mazeContainer.innerHTML = '';
        map.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const div = document.createElement('div');
                div.style.width = `${cellSize}px`;
                div.style.height = `${cellSize}px`;
                div.classList.add('cell', 'flex', 'items-center', 'justify-center', 'transition-all', 'duration-300');
                div.dataset.x = colIndex;
                div.dataset.y = rowIndex;
                div.dataset.owner = `Owner ${rowIndex},${colIndex}`;
                div.dataset.level = `Level ${rowIndex + colIndex}`;
                div.dataset.replaced = replacedDate;
                div.dataset.replacer = `User ${rowIndex + colIndex}`;
                if (cell === 'A') {
                    div.classList.add(allowedCellColor, 'allowed', 'hover:bg-green-600');
                } else {
                    div.classList.add(disallowedCellColor, 'disallowed', 'hover:bg-red-600');
                }
                div.addEventListener('mouseenter', () => handleCellHover(div));
                div.addEventListener('mouseleave', () => setHoverInfo(null));
                mazeContainer.appendChild(div);
            });
        });
    }, [map, cellSize, allowedCellColor, disallowedCellColor, replacedDate]);

    const handleCellHover = (cell) => {
        setHoverInfo({
            position: `x: ${cell.dataset.x}, y: ${cell.dataset.y}`,
            owner: cell.dataset.owner,
            level: cell.dataset.level,
            replaced: cell.dataset.replaced,
            replacer: cell.dataset.replacer
        });
    };

    const moveProfileBubble = useCallback(() => {
        const allowedCells = document.querySelectorAll('.cell.allowed');
        if (currentStep > 0) {
            const previousCell = allowedCells[currentStep - 1];
            const bubble = previousCell.querySelector('.bubble');
            if (bubble) {
                bubble.style.transform = 'scale(0)';
                setTimeout(() => bubble.remove(), 300);
            }
        }
        if (currentStep < allowedCells.length) {
            const cell = allowedCells[currentStep];
            const bubble = document.createElement('div');
            bubble.classList.add('bubble', bubbleColor, 'w-6', 'h-6', 'rounded-full', 'absolute', 'transition-all', 'duration-300');
            cell.appendChild(bubble);
            setTimeout(() => {
                bubble.style.transform = 'scale(1)';
            }, 50);
            setCurrentStep(currentStep + 1);
        } else {
            alert("Congratulations! You've completed the maze!");
        }
    }, [currentStep, bubbleColor]);

    return (
        <div className="flex justify-center items-start bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
                <div style={{width: `${mazeWidth}px`, height: `${mazeHeight}px`}} className="flex flex-col justify-center items-center bg-gray-800 border-2 border-green-500 rounded-md overflow-hidden p-[1px]">
                    <div style={{gap: `${cellGap}px`}} className="grid grid-cols-10 grid-rows-9" id="maze">
                        {/* Maze cells will be generated here by JavaScript */}
                    </div>
                </div>
                <button 
                    className="bg-green-600 text-white mt-6 px-6 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors"
                    onClick={moveProfileBubble}
                >
                    Move
                </button>
            </div>
            <div style={{height: `${mazeHeight}px`}} className="ml-6 w-64 bg-gray-800 border-2 border-green-500 rounded-md p-4 overflow-hidden">
                {hoverInfo ? (
                    <div className="transition-opacity duration-300 opacity-100">
                        <h3 className="text-green-500 font-bold mb-2">Box Information</h3>
                        <p><strong>Position:</strong> {hoverInfo.position}</p>
                        <p><strong>Owner:</strong> {hoverInfo.owner}</p>
                        <p><strong>Level:</strong> {hoverInfo.level}</p>
                        <p><strong>Replaced:</strong> {hoverInfo.replaced}</p>
                        <p><strong>Replacer:</strong> {hoverInfo.replacer}</p>
                    </div>
                ) : (
                    <div className="transition-opacity duration-300 opacity-100">
                        <h3 className="text-green-500 font-bold mb-2">Top Rank List</h3>
                        <ul>
                            {topRanks.map((player, index) => (
                                <li key={index} className="flex justify-between items-center mb-2">
                                    <span>{player.name}</span>
                                    <span className="text-yellow-400">{player.score}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Maze;