import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

// THREE is imported from main.mjs and available as a module
export function addMonster(scene, maze, player, startX = 6, startZ = 6) {
    let pos = { x: startX, z: startZ };
    const mesh = createMonsterMesh();
    mesh.position.set(pos.x, 1, pos.z);
    scene.add(mesh);
    function createMonsterMesh() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = '100px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👹', 64, 64);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({ map: tex });
        return new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), mat);
    }
    function update() {
        // Move towards player
        const dx = player.camera.position.x - pos.x;
        const dz = player.camera.position.z - pos.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > 0.1) {
            let step = 0.025;
            pos.x += step * dx / dist;
            pos.z += step * dz / dist;
            mesh.position.set(pos.x, 1, pos.z);
        }
        // Collision with player
        if (Math.abs(mesh.position.x - player.camera.position.x) < 0.5 && Math.abs(mesh.position.z - player.camera.position.z) < 0.5) {
            player.health = Math.max(0, player.health - 1);
        }
    }
    return { update };
} 