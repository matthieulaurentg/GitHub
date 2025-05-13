import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

// THREE is imported from main.mjs and available as a module
export function addBoulder(scene, maze, player) {
    // Boulder path: row 1, columns 1-6
    let pos = { x: 1, z: 1 };
    let dir = 1;
    const mesh = createBoulderMesh();
    mesh.position.set(pos.x, 1, pos.z);
    scene.add(mesh);
    function createBoulderMesh() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = '100px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪨', 64, 64);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({ map: tex });
        return new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), mat);
    }
    function update() {
        // Move boulder left/right in row 1
        pos.x += dir * 0.05;
        if (pos.x > 6) { dir = -1; pos.x = 6; }
        if (pos.x < 1) { dir = 1; pos.x = 1; }
        mesh.position.set(pos.x, 1, pos.z);
        // Collision with player
        const dx = mesh.position.x - player.camera.position.x;
        const dz = mesh.position.z - player.camera.position.z;
        if (Math.abs(dx) < 0.5 && Math.abs(dz) < 0.5) {
            player.health = Math.max(0, player.health - 1);
        }
    }
    return { update };
} 