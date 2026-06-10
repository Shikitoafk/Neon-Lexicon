// 0 = Floor
// 1 = Neon Wall
// 2 = Bush (Hide out)
// 3 = Player Spawn Point

const mapDesign = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 2, 2, 0, 0, 3, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 2, 0, 0, 1, 1, 0, 0, 2, 1],
    [1, 2, 0, 0, 1, 1, 0, 0, 2, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
    [1, 3, 0, 0, 2, 2, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const mapContainer = document.getElementById('game-map');

// This loops through the numbers above and draws the map!
for (let row = 0; row < mapDesign.length; row++) {
    for (let col = 0; col < mapDesign[row].length; col++) {
        
        const tile = document.createElement('div');
        tile.classList.add('tile'); // Base style

        // Give the tile a color based on the number
        if (mapDesign[row][col] === 0) tile.classList.add('floor');
        if (mapDesign[row][col] === 1) tile.classList.add('wall');
        if (mapDesign[row][col] === 2) tile.classList.add('bush');
        if (mapDesign[row][col] === 3) tile.classList.add('spawn');

        mapContainer.appendChild(tile);
    }
}
