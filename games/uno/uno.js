const colors = ['red', 'green', 'blue', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
const wildCards = ['Wild', 'Wild Draw Four'];

let deck = [];
let discardPile = [];
let playerHand = [];
let aiHands = [];
let currentPlayer = 0; // 0 for player, 1-3 for AI
let gameDirection = 1; // 1 for clockwise, -1 for counter-clockwise

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
        if (canPlay(card)) {
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
        aiElement.innerHTML = `<div>AI ${index + 1} (${hand.length} cards)</div>`;
        
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
}

function updateStatusMessage() {
    if (currentPlayer === 0) {
        statusMessage.textContent = 'Your turn! Play a card or draw from the deck.';
    } else {
        statusMessage.textContent = `AI ${currentPlayer}'s turn...`;
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
            statusMessage.textContent = `AI ${aiIndex + 1} wins!`;
            setTimeout(() => {
                alert(`AI ${aiIndex + 1} wins!`);
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
            statusMessage.textContent = `${currentPlayer === 0 ? 'Your' : 'AI ' + currentPlayer + '\'s'} turn was skipped!`;
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
                statusMessage.textContent = `AI ${nextPlayer} drew 2 cards!`;
            }
            break;
        case 'Wild Draw Four':
            const wildDrawPlayer = (currentPlayer + gameDirection + 4) % 4;
            if (wildDrawPlayer === 0) {
                playerHand.push(...deck.splice(0, 4));
                statusMessage.textContent = 'You drew 4 cards!';
            } else {
                aiHands[wildDrawPlayer - 1].push(...deck.splice(0, 4));
                statusMessage.textContent = `AI ${wildDrawPlayer} drew 4 cards!`;
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
    
    // Short delay to make AI moves more natural
    setTimeout(() => {
        statusMessage.textContent = `AI ${currentPlayer} is thinking...`;
        
        // AI logic - prioritize special cards
        let playIndex = -1;
        
        // First look for special cards
        for (let i = 0; i < aiHand.length; i++) {
            const card = aiHand[i];
            if (canPlay(card) && (card.value === 'Skip' || card.value === 'Reverse' || card.value === 'Draw Two' || card.value.includes('Wild'))) {
                playIndex = i;
                break;
            }
        }
        
        // If no special cards, look for any valid card
        if (playIndex === -1) {
            for (let i = 0; i < aiHand.length; i++) {
                const card = aiHand[i];
                if (canPlay(card)) {
                    playIndex = i;
                    break;
                }
            }
        }
        
        // If found a card to play
        if (playIndex !== -1) {
            const cardToPlay = aiHand[playIndex];
            statusMessage.textContent = `AI ${currentPlayer} plays ${cardToPlay.color} ${cardToPlay.value}`;
            playCard(cardToPlay, aiHand, playIndex);
        } else {
            // Draw a card
            if (deck.length > 0) {
                const drawnCard = deck.pop();
                aiHand.push(drawnCard);
                statusMessage.textContent = `AI ${currentPlayer} draws a card`;
                
                // Check if drawn card can be played
                if (canPlay(drawnCard)) {
                    setTimeout(() => {
                        statusMessage.textContent = `AI ${currentPlayer} plays drawn card: ${drawnCard.color} ${drawnCard.value}`;
                        playCard(drawnCard, aiHand, aiHand.length - 1);
                    }, 1000);
                } else {
                    advancePlayer();
                    updateStatusMessage();
                    setTimeout(playAITurn, 1000);
                }
            } else {
                // If deck is empty and no playable cards, just skip turn
                statusMessage.textContent = `AI ${currentPlayer} has no playable cards and deck is empty`;
                advancePlayer();
                updateStatusMessage();
                setTimeout(playAITurn, 1000);
            }
        }
        
        renderPlayerHand();
        renderDiscardPile();
        renderAIHands();
    }, 1000);
}

function initializeGame() {
    // Reset game state
    deck = [];
    discardPile = [];
    playerHand = [];
    aiHands = [];
    currentPlayer = 0;
    gameDirection = 1;
    
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
    if (currentPlayer !== 0) return;
    
    if (deck.length > 0) {
        const drawnCard = deck.pop();
        playerHand.push(drawnCard);
        statusMessage.textContent = `You drew a ${drawnCard.color} ${drawnCard.value}`;
        renderPlayerHand();
        
        if (canPlay(drawnCard)) {
            // Player can play the drawn card if they want
            statusMessage.textContent += ". You can play this card if you want.";
        } else {
            statusMessage.textContent += ". You can't play this card.";
            advancePlayer();
            updateStatusMessage();
            setTimeout(playAITurn, 1000);
        }
    } else {
        statusMessage.textContent = "Deck is empty!";
        advancePlayer();
        updateStatusMessage();
        setTimeout(playAITurn, 1000);
    }
});

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initializeGame);
