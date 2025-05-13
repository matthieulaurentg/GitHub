export function updateUI(health, score, highScore) {
    const healthEl = document.getElementById('health-value');
    if (healthEl) healthEl.textContent = health;
    let scoreEl = document.getElementById('score-value');
    if (!scoreEl) {
        // Add score to UI if not present
        const ui = document.getElementById('ui-overlay');
        scoreEl = document.createElement('div');
        scoreEl.id = 'score-value';
        scoreEl.style.marginTop = '10px';
        scoreEl.style.fontWeight = 'bold';
        ui.appendChild(scoreEl);
    }
    scoreEl.textContent = `Score: ${score}`;
    let highScoreEl = document.getElementById('high-score-value');
    if (!highScoreEl) {
        const ui = document.getElementById('ui-overlay');
        highScoreEl = document.createElement('div');
        highScoreEl.id = 'high-score-value';
        highScoreEl.style.fontWeight = 'bold';
        highScoreEl.style.color = '#FFD700';
        ui.appendChild(highScoreEl);
    }
    highScoreEl.textContent = `High Score: ${highScore}`;
} 