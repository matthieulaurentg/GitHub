import { setupScene } from './scene/setupScene.mjs';
import { setupPlayer } from './player/setupPlayer.mjs';
import { generateMaze } from './maze/generateMaze.mjs';
import { addBoulder } from './objects/addBoulder.mjs';
import { addMonster } from './objects/addMonster.mjs';
import { updateUI } from './ui/updateUI.mjs';

// Scene, camera, renderer
const { scene, camera, renderer } = setupScene();

document.getElementById('game-container').appendChild(renderer.domElement);

// Maze
const mazeObj = generateMaze(scene, 17, 17); // bigger maze
const mazeData = mazeObj.maze;

// Player
const player = setupPlayer(camera, mazeData);

// Boulder
const boulder = addBoulder(scene, mazeData, player);

// Procedurally generate fewer monsters
const monsters = [];
const monsterCount = 1; // less frequent
function randomEmptyCell() {
    let x, z;
    do {
        x = Math.floor(Math.random() * mazeObj.width);
        z = Math.floor(Math.random() * mazeObj.height);
    } while (mazeData[z][x] !== 0 || (x === 1 && z === 1));
    return { x, z };
}
for (let i = 0; i < monsterCount; i++) {
    const { x, z } = randomEmptyCell();
    monsters.push(addMonster(scene, mazeData, player, x, z));
}

// Score system: score = health
let score = player.health;
let highScore = Number(localStorage.getItem('maze_high_score') || 0);

// UI
updateUI(player.health, score, highScore);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    player.update();
    boulder.update();
    monsters.forEach(m => m.update());
    // Score is always current health
    score = player.health;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('maze_high_score', highScore);
    }
    updateUI(player.health, score, highScore);
    renderer.render(scene, camera);
}
animate(); 