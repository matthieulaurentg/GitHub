import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';
// THREE is imported from main.mjs and available as a module
export function setupPlayer(camera, maze) {
    let health = 100;
    const speed = 0.09;
    let yaw = 0, pitch = 0;
    let moveF = false, moveB = false, moveL = false, moveR = false;
    let pointerLocked = false;
    // Start at entrance
    let basePos = new THREE.Vector3(1, 1.6, 1);
    camera.position.copy(basePos);
    // Find first open direction from (1,1)
    const dirs = [
        {dx: 0, dz: 1, yaw: 0}, // forward (down z)
        {dx: 1, dz: 0, yaw: -Math.PI/2}, // right (down x)
        {dx: 0, dz: -1, yaw: Math.PI}, // back (up z)
        {dx: -1, dz: 0, yaw: Math.PI/2}, // left (up x)
    ];
    for (const d of dirs) {
        const nx = 1 + d.dx, nz = 1 + d.dz;
        if (maze[nz] && maze[nz][nx] === 0) {
            yaw = d.yaw;
            break;
        }
    }
    camera.rotation.set(0, yaw, 0);
    // Pointer lock
    window.addEventListener('click', () => {
        if (!pointerLocked) {
            document.body.requestPointerLock();
        }
    });
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === document.body;
    });
    // Mouse look
    document.addEventListener('mousemove', (e) => {
        if (!pointerLocked) return;
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
        camera.rotation.set(pitch, yaw, 0);
    });
    // WASD
    document.addEventListener('keydown', e => {
        if (e.code === 'KeyW') moveF = true;
        if (e.code === 'KeyS') moveB = true;
        if (e.code === 'KeyA') moveL = true;
        if (e.code === 'KeyD') moveR = true;
    });
    document.addEventListener('keyup', e => {
        if (e.code === 'KeyW') moveF = false;
        if (e.code === 'KeyS') moveB = false;
        if (e.code === 'KeyA') moveL = false;
        if (e.code === 'KeyD') moveR = false;
    });
    function collide(nx, nz) {
        const x = Math.round(nx);
        const z = Math.round(nz);
        return maze[z] && maze[z][x] === 1;
    }
    let step = 0;
    function update() {
        let dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0; dir.normalize();
        let right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();
        let move = new THREE.Vector3();
        if (moveF) move.add(dir);
        if (moveB) move.addScaledVector(dir, -1);
        if (moveL) move.addScaledVector(right, -1);
        if (moveR) move.add(right);
        if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed);
        let nx = basePos.x + move.x;
        let nz = basePos.z + move.z;
        if (!collide(nx, basePos.z)) basePos.x = nx;
        if (!collide(basePos.x, nz)) basePos.z = nz;
        // Head bob effect (left/right relative to view)
        step += move.length();
        const bobOffset = (move.lengthSq() > 0 ? Math.sin(step * 10) * 0.04 : 0);
        camera.position.copy(basePos).addScaledVector(right, bobOffset);
        camera.position.y = 1.6;
    }
    return { update, get health() { return health; }, set health(h) { health = h; }, camera };
} 