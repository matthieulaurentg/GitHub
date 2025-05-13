import { GAME_STATE, TEA_CONFIG, saveGameState } from '../config/gameConfig.mjs';

export function updateTeaInventory() {
    const teaInventory = document.getElementById("tea-inventory");
    let html = `
        <div class="tea-item">
            <div class="tea-counter">
                <span>Tea Leaves</span>
                <div class="instant-grow-tooltip">
                    <button class="instant-grow-btn" onclick="window.instantGrowAll()">⚡ Instant Grow</button>
                    <span class="tooltip-text">Magic!</span>
                </div>
            </div>
            <span>🍵 ${GAME_STATE.teaLeaves}</span>
        </div>
    `;

    // Add special leaves
    for (const [type, count] of Object.entries(GAME_STATE.specialLeaves)) {
        if (count > 0) {
            const config = TEA_CONFIG.specialLeaves[type];
            html += `
                <div class="tea-item special">
                    <span>${type.charAt(0).toUpperCase() + type.slice(1)} Leaf</span>
                    <span>${config.emoji} ${count}</span>
                </div>
            `;
        }
    }

    // Add upgrades section
    html += `<h4>Upgrades</h4>`;
    for (const [type, config] of Object.entries(TEA_CONFIG.upgrades)) {
        const count = GAME_STATE.upgrades[type];
        const canAfford = GAME_STATE.teaLeaves >= config.cost;
        html += `
            <div class="tea-item upgrade ${canAfford ? 'can-afford' : ''}" onclick="window.buyUpgrade('${type}')">
                <div>
                    <div>${config.emoji} ${config.name} (${count})</div>
                    <div class="upgrade-desc">${config.description}</div>
                </div>
                <span>🍵 ${config.cost}</span>
            </div>
        `;
    }

    teaInventory.innerHTML = html;
}

// Add the buyUpgrade function to the window object
window.buyUpgrade = function(type) {
    const config = TEA_CONFIG.upgrades[type];
    if (GAME_STATE.teaLeaves >= config.cost) {
        GAME_STATE.teaLeaves -= config.cost;
        GAME_STATE.upgrades[type]++;
        saveGameState();
        updateTeaInventory();
    }
};

// Add the instant grow function to the window object
window.instantGrowAll = function() {
    const growingSpots = GAME_STATE.growthSpots.filter(spot => spot.growing);
    growingSpots.forEach(spot => {
        if (spot.instantGrow) spot.instantGrow();
    });
}; 