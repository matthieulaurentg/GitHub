export function startGameLoop(myPlayer, opponentPlayer, isHost) {
    // Controls
    const left = isHost ? 'a' : 'arrowleft';
    const right = isHost ? 'd' : 'arrowright';
    const jump = isHost ? 'w' : 'arrowup';
    const punch = isHost ? ' ' : 'enter';

    let isPunching = false;
    let punchCooldown = 0;
    let vy = 0;
    let onGround = true;

    action(() => {
        // Movement
        if (keyIsDown(left)) {
            myPlayer.x -= 4;
            myPlayer.direction = -1;
        }
        if (keyIsDown(right)) {
            myPlayer.x += 4;
            myPlayer.direction = 1;
        }
        // Jump
        if (keyIsDown(jump) && onGround) {
            vy = -10;
            onGround = false;
        }
        // Gravity
        if (!onGround) {
            myPlayer.y += vy;
            vy += 0.5;
            if (myPlayer.y >= 300) {
                myPlayer.y = 300;
                vy = 0;
                onGround = true;
            }
        }
        // Punch
        if (keyIsDown(punch) && !isPunching && punchCooldown <= 0) {
            isPunching = true;
            punchCooldown = 30;
            // Check hit
            if (Math.abs(myPlayer.x - opponentPlayer.x) < 80 && Math.abs(myPlayer.y - opponentPlayer.y) < 60) {
                opponentPlayer.health -= 10;
                if (opponentPlayer.health < 0) opponentPlayer.health = 0;
            }
        }
        if (!keyIsDown(punch)) {
            isPunching = false;
        }
        if (punchCooldown > 0) punchCooldown--;
        // Update kaboom object
        myPlayer.kaboomObj.pos = vec2(myPlayer.x, myPlayer.y);
        // Send update
        window.network.sendUpdate({
            x: myPlayer.x,
            y: myPlayer.y,
            health: myPlayer.health,
            direction: myPlayer.direction
        });
    });

    // Health bars
    add([
        rect(160, 16),
        pos(200, 40),
        color(0, 255, 0),
        z(20),
        {
            update() {
                this.width = 1.6 * myPlayer.health;
            }
        }
    ]);
    add([
        rect(160, 16),
        pos(600, 40),
        color(255, 0, 0),
        z(20),
        {
            update() {
                this.width = 1.6 * opponentPlayer.health;
            }
        }
    ]);
} 