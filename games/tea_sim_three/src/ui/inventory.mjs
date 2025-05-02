import { GAME_STATE, TEA_CONFIG, saveGameState } from '../config/gameConfig.mjs';

export function updateTeaInventory() {
    const teaInventory = document.getElementById("tea-inventory");
    let html = `
        <div class="magic-section">
            <button class="magic-button" onclick="window.instantGrowAll()">
                <span class="magic-icon">⚡</span>
                <span class="magic-text">Magic Growth</span>
            </button>
        </div>
        <div class="inventory-section">
            <div class="tea-item main-counter">
                <div class="tea-label">Tea Leaves</div>
                <div class="tea-value">🍵 ${GAME_STATE.teaLeaves}</div>
            </div>

            <div class="special-leaves">
                ${Object.entries(GAME_STATE.specialLeaves)
                    .filter(([_, count]) => count > 0)
                    .map(([type, count]) => {
                        const config = TEA_CONFIG.specialLeaves[type];
                        return `
                            <div class="tea-item special">
                                <div class="tea-label">${type.charAt(0).toUpperCase() + type.slice(1)} Leaf</div>
                                <div class="tea-value">${config.emoji} ${count}</div>
                            </div>
                        `;
                    }).join('')}
            </div>
        </div>

        <div class="upgrades-section">
            <h4>Garden Upgrades</h4>
            ${Object.entries(TEA_CONFIG.upgrades).map(([type, config]) => {
                const count = GAME_STATE.upgrades[type];
                const canAfford = GAME_STATE.teaLeaves >= config.cost;
                return `
                    <div class="tea-item upgrade ${canAfford ? 'can-afford' : ''}" onclick="window.buyUpgrade('${type}')">
                        <div class="upgrade-info">
                            <div class="upgrade-title">${config.emoji} ${config.name} <span class="upgrade-count">×${count}</span></div>
                            <div class="upgrade-desc">${config.description}</div>
                        </div>
                        <div class="upgrade-cost">
                            <span class="cost-value">🍵 ${config.cost}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

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
    if (growingSpots.length > 0) {
        growingSpots.forEach(spot => {
            if (spot.instantGrow) spot.instantGrow();
        });
        // Add magical effect when button is clicked
        document.querySelector('.magic-button').classList.add('magic-active');
        setTimeout(() => {
            document.querySelector('.magic-button').classList.remove('magic-active');
        }, 1000);
    }
}; 