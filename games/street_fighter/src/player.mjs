export function createPlayer(x, y, emoji) {
    const player = {
        x,
        y,
        emoji,
        health: 100,
        direction: 1, // 1: right, -1: left
        kaboomObj: add([
            pos(x, y),
            text(emoji, { size: 64 }),
            anchor("center"),
            z(10),
        ]),
    };
    return player;
}

export function updatePlayer(player, data) {
    if (!player) return;
    player.x = data.x;
    player.y = data.y;
    player.health = data.health;
    player.direction = data.direction;
    player.kaboomObj.pos = vec2(player.x, player.y);
    player.kaboomObj.text = player.emoji;
}

export function drawPlayers(myPlayer, opponentPlayer) {
    // This can be used for custom drawing if needed
} 