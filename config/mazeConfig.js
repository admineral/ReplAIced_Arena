// Configuration file for the maze game
// Contains all the static data and settings for the maze

export const mazeConfig = {
    map: [
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
        ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']
    ],
    topRanks: [
        { name: "Player1", score: 1000 },
        { name: "Player2", score: 950 },
        { name: "Player3", score: 900 },
        { name: "Player4", score: 850 },
        { name: "Player5", score: 800 },
    ],
    cellSize: 40,
    mazeWidth: 422,
    mazeHeight: 380,
    cellGap: 1,
    allowedCellColor: 'bg-green-700',
    disallowedCellColor: 'bg-red-700',
    bubbleColor: 'bg-blue-500',
    replacedDate: "2024-07-27"
};