const colors = ['red', 'green', 'blue', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
const wildCards = ['Wild', 'Wild Draw Four'];

// AI personalities
const aiPlayers = [
    { name: "Diablo", emoji: "👺", style: "aggressive", color: "#e74c3c" },
    { name: "Alien", emoji: "👽", style: "strategic", color: "#3498db" },
    { name: "Robot", emoji: "🤖", style: "calculated", color: "#2ecc71" }
];

let deck = [];
let discardPile = [];
let playerHand = [];
let aiHands = [];
let currentPlayer = 0; // 0 for player, 1-3 for AI
let gameDirection = 1; // 1 for clockwise, -1 for counter-clockwise
let drawingEnabled = true;

// Get DOM elements
const playerHandElement = document.getElementById('player-hand');
const discardPileElement = document.getElementById('discard-pile');
const drawCardButton = document.getElementById('draw-card');
const statusMessage = document.getElementById('status-message');

function createDeck() {
    deck = [];
    
    // Regular cards
    for (const color of colors) {
        // Add one '0' card for each color
        deck.push({ color, value: '0' });
        
        // Add two of each 1-9, Skip, Reverse, Draw Two
        for (let i = 0; i < 2; i++) {
            for (let j = 1; j <= 9; j++) {
                deck.push({ color, value: j.toString() });
            }
            deck.push({ color, value: 'Skip' });
            deck.push({ color, value: 'Reverse' });
            deck.push({ color, value: 'Draw Two' });
        }
    }
    
    // Wild cards
    for (const wildCard of wildCards) {
        for (let i = 0; i < 4; i++) {
            deck.push({ color: 'wild', value: wildCard });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    playerHand = deck.splice(0, 7);
    aiHands = [
        deck.splice(0, 7),
        deck.splice(0, 7),
        deck.splice(0, 7)
    ];
    
    // Place one card from deck to start discard pile,
    // but make sure it's not a special card
    let initialCard;
    do {
        initialCard = deck.pop();
        // If it's a wild or special card, put it back and try again
        if (initialCard.color === 'wild' || 
            initialCard.value === 'Skip' || 
            initialCard.value === 'Reverse' || 
            initialCard.value === 'Draw Two') {
            deck.unshift(initialCard);
            shuffleDeck();
        } else {
            break;
        }
    } while (true);
    
    discardPile.push(initialCard);
}

function renderCard(card, container, isDraggable = false) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.style.backgroundColor = card.color;
    cardElement.textContent = card.value;
    cardElement.draggable = isDraggable;
    
    if (isDraggable) {
        cardElement.addEventListener('dragstart', (event) => {
            if (currentPlayer !== 0) {
                event.preventDefault();
                return false;
            }
            event.dataTransfer.setData('text', JSON.stringify(card));
            cardElement.classList.add('moving');
        });
        
        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('moving');
        });
        
        // Also add click to play functionality for mobile
        cardElement.addEventListener('click', () => {
            if (currentPlayer === 0) {
                const cardIndex = playerHand.findIndex(c => 
                    c.color === card.color && c.value === card.value);
                
                if (cardIndex > -1 && canPlay(card)) {
                    playCard(playerHand[cardIndex], playerHand, cardIndex);
                } else if (!canPlay(card)) {
                    statusMessage.textContent = "You can't play that card! Try another or draw.";
                }
            }
        });
    }
    
    container.appendChild(cardElement);
    return cardElement;
}

function renderPlayerHand() {
    playerHandElement.innerHTML = '';
    playerHand.forEach(card => {
        const cardEl = renderCard(card, playerHandElement, true);
        // Visual hint for playable cards
        if (canPlay(card) && currentPlayer === 0) {
            cardEl.style.boxShadow = '0 0 10px yellow';
        }
    });
}

function renderDiscardPile() {
    discardPileElement.innerHTML = '';
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        renderCard(topCard, discardPileElement);
    }
}

function renderAIHands() {
    const aiPlayersElement = document.getElementById('ai-players');
    aiPlayersElement.innerHTML = '';
    
    aiHands.forEach((hand, index) => {
        const aiElement = document.createElement('div');
        aiElement.classList.add('ai-player');
        if (currentPlayer === index + 1) {
            aiElement.classList.add('active-player');
        }
        
        const aiInfo = aiPlayers[index];
        aiElement.innerHTML = `
            <div class="ai-name">
                <span class="ai-emoji">${aiInfo.emoji}</span>
                ${aiInfo.name} (${hand.length} cards)
            </div>
        `;
        
        const aiHandElement = document.createElement('div');
        aiHandElement.classList.add('ai-hand');
        
        hand.forEach(() => {
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            aiHandElement.appendChild(cardBack);
        });
        
        aiElement.appendChild(aiHandElement);
        aiPlayersElement.appendChild(aiElement);
    });
    
    // Add active class to player area if it's their turn
    const playerArea = document.querySelector('.player-area');
    if (playerArea) {
        if (currentPlayer === 0) {
            playerArea.classList.add('active-player');
        } else {
            playerArea.classList.remove('active-player');
        }
    }
}

function updateStatusMessage() {
    if (currentPlayer === 0) {
        statusMessage.textContent = 'Your turn! Play a card or draw from the deck.';
    } else {
        const ai = aiPlayers[currentPlayer - 1];
        statusMessage.textContent = `${ai.emoji} ${ai.name}'s turn...`;
    }
}

function canPlay(card) {
    if (discardPile.length === 0) return true;
    
    const topCard = discardPile[discardPile.length - 1];
    return (
        card.color === 'wild' || 
        topCard.color === card.color || 
        topCard.value === card.value
    );
}

function playCard(card, hand, index) {
    if (!canPlay(card)) {
        statusMessage.textContent = "You can't play that card! Try another or draw.";
        return false;
    }
    
    hand.splice(index, 1);
    discardPile.push(card);
    
    // Add card play animation
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.style.backgroundColor = card.color;
    cardElement.textContent = card.value;
    cardElement.style.position = 'absolute';
    cardElement.style.zIndex = '10';
    
    // Different animations based on player
    if (hand === playerHand) {
        cardElement.style.bottom = '100px';
    } else {
        const aiIndex = aiHands.indexOf(hand);
        if (aiIndex === 0) {
            cardElement.style.top = '100px';
        } else if (aiIndex === 1) {
            cardElement.style.right = '100px';
        } else if (aiIndex === 2) {
            cardElement.style.left = '100px';
        }
    }
    
    document.getElementById('game-table').appendChild(cardElement);
    
    setTimeout(() => {
        cardElement.style.transition = 'all 0.5s ease';
        cardElement.style.top = '50%';
        cardElement.style.left = '50%';
        cardElement.style.transform = 'translate(-50%, -50%)';
    }, 50);
    
    setTimeout(() => {
        cardElement.remove();
        renderDiscardPile();
    }, 600);
    
    // Check for win condition
    if (hand.length === 0) {
        if (hand === playerHand) {
            statusMessage.textContent = 'You win!';
            setTimeout(() => {
                alert('You win!');
                initializeGame();
            }, 500);
        } else {
            const aiIndex = aiHands.indexOf(hand);
            const ai = aiPlayers[aiIndex];
            statusMessage.textContent = `${ai.emoji} ${ai.name} wins!`;
            setTimeout(() => {
                alert(`${ai.name} wins!`);
                initializeGame();
            }, 500);
        }
        return true;
    }
    
    // Handle special cards
    handleSpecialCard(card);
    
    renderPlayerHand();
    renderDiscardPile();
    renderAIHands();
    updateStatusMessage();
    
    // Move to next player's turn if the current player is the human player
    if (hand === playerHand) {
        setTimeout(playAITurn, 1000);
    }
    
    return true;
}

function handleSpecialCard(card) {
    switch (card.value) {
        case 'Skip':
            advancePlayer();
            const skippedPlayer = currentPlayer;
            const skippedName = skippedPlayer === 0 ? "You" : `${aiPlayers[skippedPlayer - 1].emoji} ${aiPlayers[skippedPlayer - 1].name}`;
            statusMessage.textContent = `${skippedName} were skipped!`;
            break;
        case 'Reverse':
            gameDirection *= -1;
            statusMessage.textContent = 'Direction reversed!';
            break;
        case 'Draw Two':
            const nextPlayer = (currentPlayer + gameDirection + 4) % 4;
            if (nextPlayer === 0) {
                playerHand.push(...deck.splice(0, 2));
                statusMessage.textContent = 'You drew 2 cards!';
            } else {
                aiHands[nextPlayer - 1].push(...deck.splice(0, 2));
                const ai = aiPlayers[nextPlayer - 1];
                statusMessage.textContent = `${ai.emoji} ${ai.name} drew 2 cards!`;
            }
            break;
        case 'Wild Draw Four':
            const wildDrawPlayer = (currentPlayer + gameDirection + 4) % 4;
            if (wildDrawPlayer === 0) {
                playerHand.push(...deck.splice(0, 4));
                statusMessage.textContent = 'You drew 4 cards!';
            } else {
                aiHands[wildDrawPlayer - 1].push(...deck.splice(0, 4));
                const ai = aiPlayers[wildDrawPlayer - 1];
                statusMessage.textContent = `${ai.emoji} ${ai.name} drew 4 cards!`;
            }
            // For AI, randomly choose color
            card.color = colors[Math.floor(Math.random() * colors.length)];
            statusMessage.textContent += ` Color changed to ${card.color}!`;
            break;
        case 'Wild':
            // For AI, randomly choose color
            card.color = colors[Math.floor(Math.random() * colors.length)];
            statusMessage.textContent = `Color changed to ${card.color}!`;
            break;
    }
    
    advancePlayer();
}

function advancePlayer() {
    currentPlayer = (currentPlayer + gameDirection + 4) % 4;
}

function playAITurn() {
    if (currentPlayer === 0) return;
    
    const aiIndex = currentPlayer - 1;
    const aiHand = aiHands[aiIndex];
    const ai = aiPlayers[aiIndex];
    
    // Short delay to make AI moves more natural
    setTimeout(() => {
        statusMessage.textContent = `${ai.emoji} ${ai.name} is thinking...`;
        
        // AI logic varies based on personality
        let playIndex = -1;
        let playableCards = [];
        
        // Find all playable cards
        for (let i = 0; i < aiHand.length; i++) {
            if (canPlay(aiHand[i])) {
                playableCards.push({ index: i, card: aiHand[i] });
            }
        }
        
        if (playableCards.length > 0) {
            // Different AI styles make different choices
            if (ai.style === 'aggressive') {
                // Aggressive AI prioritizes special cards, especially Draw Two and Wild Draw Four
                const specialCards = playableCards.filter(c => 
                    c.card.value === 'Skip' || 
                    c.card.value === 'Reverse' || 
                    c.card.value === 'Draw Two' || 
                    c.card.value === 'Wild Draw Four');
                
                if (specialCards.length > 0) {
                    const chosen = specialCards[Math.floor(Math.random() * specialCards.length)];
                    playIndex = chosen.index;
                } else {
                    const chosen = playableCards[Math.floor(Math.random() * playableCards.length)];
                    playIndex = chosen.index;
                }
            } else if (ai.style === 'strategic') {
                // Strategic AI tries to play cards of the same color to save wild cards
                const topCard = discardPile[discardPile.length - 1];
                const sameColorCards = playableCards.filter(c => c.card.color === topCard.color);
                
                if (sameColorCards.length > 0) {
                    const chosen = sameColorCards[Math.floor(Math.random() * sameColorCards.length)];
                    playIndex = chosen.index;
                } else {
                    const chosen = playableCards[Math.floor(Math.random() * playableCards.length)];
                    playIndex = chosen.index;
                }
            } else {
                // Calculated AI plays lowest value cards first, saves special cards
                const normalCards = playableCards.filter(c => !isNaN(c.card.value));
                
                if (normalCards.length > 0) {
                    normalCards.sort((a, b) => parseInt(a.card.value) - parseInt(b.card.value));
                    playIndex = normalCards[0].index;
                } else {
                    const chosen = playableCards[Math.floor(Math.random() * playableCards.length)];
                    playIndex = chosen.index;
                }
            }
        }
        
        // If found a card to play
        if (playIndex !== -1) {
            const cardToPlay = aiHand[playIndex];
            statusMessage.textContent = `${ai.emoji} ${ai.name} plays ${cardToPlay.color} ${cardToPlay.value}`;
            playCard(cardToPlay, aiHand, playIndex);
        } else {
            // Draw a card
            if (deck.length > 0) {
                const drawnCard = deck.pop();
                aiHand.push(drawnCard);
                statusMessage.textContent = `${ai.emoji} ${ai.name} draws a card`;
                
                // Check if drawn card can be played
                if (canPlay(drawnCard)) {
                    setTimeout(() => {
                        statusMessage.textContent = `${ai.emoji} ${ai.name} plays drawn card: ${drawnCard.color} ${drawnCard.value}`;
                        playCard(drawnCard, aiHand, aiHand.length - 1);
                    }, 1000);
                } else {
                    advancePlayer();
                    updateStatusMessage();
                    setTimeout(playAITurn, 1000);
                }
            } else {
                // If deck is empty and no playable cards, just skip turn
                statusMessage.textContent = `${ai.emoji} ${ai.name} has no playable cards and deck is empty`;
                advancePlayer();
                updateStatusMessage();
                setTimeout(playAITurn, 1000);
            }
        }
        
        renderPlayerHand();
        renderDiscardPile();
        renderAIHands();
    }, 1500);
}

function checkDrawPileEmpty() {
    // Check if draw pile is almost empty, if so, shuffle the discard pile except the top card
    if (deck.length < 5 && discardPile.length > 1) {
        const topCard = discardPile.pop();
        deck = [...discardPile, ...deck];
        discardPile = [topCard];
        shuffleDeck();
        statusMessage.textContent = "Draw pile was running low. Reshuffled discard pile.";
    }
}

function initializeGame() {
    // Reset game state
    deck = [];
    discardPile = [];
    playerHand = [];
    aiHands = [];
    currentPlayer = 0;
    gameDirection = 1;
    drawingEnabled = true;
    
    // Set up game
    createDeck();
    shuffleDeck();
    dealCards();
    
    // Render initial state
    renderPlayerHand();
    renderDiscardPile();
    renderAIHands();
    updateStatusMessage();
}

// Event listeners
discardPileElement.addEventListener('dragover', (event) => {
    event.preventDefault();
});

discardPileElement.addEventListener('drop', (event) => {
    event.preventDefault();
    try {
        if (currentPlayer !== 0) return;
        
        const cardData = JSON.parse(event.dataTransfer.getData('text'));
        const cardIndex = playerHand.findIndex(card => 
            card.color === cardData.color && card.value === cardData.value);
        
        if (cardIndex > -1) {
            playCard(playerHand[cardIndex], playerHand, cardIndex);
        }
    } catch (e) {
        console.error("Error processing card drop:", e);
    }
});

drawCardButton.addEventListener('click', () => {
    if (currentPlayer !== 0 || !drawingEnabled) return;
    
    if (deck.length > 0) {
        // Temporarily disable drawing to prevent multi-clicks
        drawingEnabled = false;
        
        // Visual feedback
        drawCardButton.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            drawCardButton.style.transform = 'translateY(-50%) scale(1)';
        }, 200);
        
        // Draw the card with an animation
        setTimeout(() => {
            const drawnCard = deck.pop();
            
            // Create a visual card for animation
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.style.backgroundColor = drawnCard.color;
            cardElement.textContent = drawnCard.value;
            cardElement.style.position = 'absolute';
            cardElement.style.zIndex = '10';
            cardElement.style.left = 'calc(50% - 120px)';
            cardElement.style.top = '50%';
            cardElement.style.transform = 'translateY(-50%)';
            
            document.getElementById('game-table').appendChild(cardElement);
            
            setTimeout(() => {
                cardElement.style.transition = 'all 0.5s ease';
                cardElement.style.bottom = '100px';
                cardElement.style.left = '50%';
                cardElement.style.top = 'auto';
                cardElement.style.transform = 'translateX(-50%)';
            }, 50);
            
            setTimeout(() => {
                cardElement.remove();
                playerHand.push(drawnCard);
                renderPlayerHand();
                
                statusMessage.textContent = `You drew a ${drawnCard.color} ${drawnCard.value}`;
                
                if (canPlay(drawnCard)) {
                    // Player can play the drawn card if they want
                    statusMessage.textContent += ". You can play this card if you want.";
                    drawingEnabled = true;
                } else {
                    statusMessage.textContent += ". You can't play this card.";
                    
                    // After a short delay, move to the next player
                    setTimeout(() => {
                        advancePlayer();
                        updateStatusMessage();
                        renderAIHands();
                        drawingEnabled = true;
                        setTimeout(playAITurn, 1000);
                    }, 1000);
                }
                
                // Check if draw pile needs to be reshuffled
                checkDrawPileEmpty();
            }, 600);
        }, 300);
    } else {
        // Try to reshuffle if possible
        if (discardPile.length > 1) {
            const topCard = discardPile.pop();
            deck = [...discardPile];
            discardPile = [topCard];
            shuffleDeck();
            statusMessage.textContent = "Draw pile empty. Reshuffled discard pile. Try drawing again.";
        } else {
            statusMessage.textContent = "Deck is empty!";
            advancePlayer();
            updateStatusMessage();
            renderAIHands();
            setTimeout(playAITurn, 1000);
        }
    }
});

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initializeGame);
