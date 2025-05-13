export function showFloatingText(scene, text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText(text, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(position.x, position.y + 1, position.z);
    sprite.scale.set(2, 0.5, 1);
    scene.add(sprite);

    let progress = 0;
    function animateText() {
        progress += 0.02;
        if (progress <= 1) {
            sprite.position.y += 0.03;
            sprite.material.opacity = 1 - progress;
            requestAnimationFrame(animateText);
        } else {
            scene.remove(sprite);
        }
    }
    animateText();
} 