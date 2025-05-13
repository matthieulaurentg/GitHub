import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

function generateMazeArray(width, height) {
    // Odd dimensions only
    width = width | 1;
    height = height | 1;
    const maze = Array.from({ length: height }, () => Array(width).fill(1));
    function carve(x, y) {
        const dirs = [ [0,2], [0,-2], [2,0], [-2,0] ];
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < height && nx > 0 && nx < width && maze[ny][nx] === 1) {
                maze[y + dy/2][x + dx/2] = 0;
                maze[ny][nx] = 0;
                carve(nx, ny);
            }
        }
    }
    maze[1][1] = 0;
    carve(1, 1);
    return maze;
}

export function generateMaze(scene, width = 15, height = 15) {
    const maze = generateMazeArray(width, height);
    const wallGeo = new THREE.BoxGeometry(1, 2, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B5E3C });
    for (let z = 0; z < maze.length; z++) {
        for (let x = 0; x < maze[z].length; x++) {
            if (maze[z][x] === 1) {
                const wall = new THREE.Mesh(wallGeo, wallMat);
                wall.position.set(x, 1, z);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
            }
        }
    }
    // Floor
    const floorGeo = new THREE.PlaneGeometry(maze[0].length, maze.length);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.set(maze[0].length/2-0.5, 0, maze.length/2-0.5);
    floor.receiveShadow = true;
    scene.add(floor);
    return { maze, width: maze[0].length, height: maze.length };
} 