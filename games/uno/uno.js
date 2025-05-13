const colors = ['red', 'green', 'blue', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
const wildCards = ['Wild', 'Wild Draw Four'];

let deck = [];
let discardPile = [];
let playerHand = [];
let aiHands = [];

const playerHandElement = document.getElementById('player-hand');
const discardPileElement = document.getElementById('discard-pile');
const drawCardButton = document.getElementById('draw-card');

function createDeck() {
    deck = [];
    for (const color of colors) {
        for (const value of values) {
            deck.push({ color, value });
        }
    }
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
    discardPile.push(deck.pop());
}

let currentPlayer = 0; // 0 for player, 1-3 for AI
let gameDirection = 1; // 1 for clockwise, -1 for counter-clockwise

function renderCard(card, container, isDraggable = false) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.style.backgroundColor = card.color;
    cardElement.textContent = card.value;
    cardElement.draggable = isDraggable;
    if (isDraggable) {
        cardElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text', JSON.stringify(card));
        });
    }
    container.appendChild(cardElement);
}

function renderPlayerHand() {
    playerHandElement.innerHTML = '';
    playerHand.forEach(card => {
        renderCard(card, playerHandElement, true);
    });
}

function renderDiscardPile() {
    discardPileElement.innerHTML = '';
    if (discardPile.length > 0) {
        renderCard(discardPile[discardPile.length - 1], discardPileElement);
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

function canPlay(card) {
    const topCard = discardPile[discardPile.length - 1];
    return card.color === 'wild' || topCard.color === 'wild' || card.color === topCard.color || card.value === topCard.value;
}

function playCard(card, hand, index) {
    if (!canPlay(card)) {
        alert('Invalid move');
        return;
    }
    
    hand.splice(index, 1);
    discardPile.push(card);
    
    // Check for win condition
    if (hand.length === 0) {
        if (hand === playerHand) {
            alert('You win!');
        } else {
            alert(`AI ${aiHands.indexOf(hand) + 1} wins!`);
        }
        initializeGame();
        return;
    }
    
    // Handle special cards
    handleSpecialCard(card);
    
    renderPlayerHand();
    renderDiscardPile();
    renderAIHands();
    
    // Move to next player's turn
    if (hand === playerHand) {
        setTimeout(playAITurn, 1000);
    }
}

function handleSpecialCard(card) {
    switch (card.value) {
        case 'Skip':
            advancePlayer();
            break;
        case 'Reverse':
            gameDirection *= -1;
            break;
        case 'Draw Two':
            const nextPlayer = (currentPlayer + gameDirection) % 4;
            if (nextPlayer === 0) {
                playerHand.push(...deck.splice(0, 2));
            } else {
                aiHands[nextPlayer - 1].push(...deck.splice(0, 2));
            }
            break;
        case 'Wild Draw Four':
            const wildDrawPlayer = (currentPlayer + gameDirection) % 4;
            if (wildDrawPlayer === 0) {
                playerHand.push(...deck.splice(0, 4));
            } else {
                aiHands[wildDrawPlayer - 1].push(...deck.splice(0, 4));
            }
            card.color = colors[Math.floor(Math.random() * colors.length)];
            break;
        case 'Wild':
            card.color = colors[Math.floor(Math.random() * colors.length)];
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
    
    // Find a valid card to play
    const topCard = discardPile[discardPile.length - 1];
    
    // AI logic - prioritize special cards
    let playIndex = -1;
    
    // First look for special cards
    for (let i = 0; i < aiHand.length; i++) {
        const card = aiHand[i];
        if (canPlay(card) && (card.value === 'Skip' || card.value === 'Reverse' || card.value === 'Draw Two')) {
            playIndex = i;
            break;
        }
    }
    
    // If no special cards, look for wild cards
    if (playIndex === -1) {
        for (let i = 0; i < aiHand.length; i++) {
            const card = aiHand[i];
            if (card.color === 'wild') {
                playIndex = i;
                break;
            }
        }
    }
    
    // If no special or wild cards, look for any valid card
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
        playCard(cardToPlay, aiHand, playIndex);
    } else {
        // Draw a card
        if (deck.length > 0) {
            const drawnCard = deck.pop();
            aiHand.push(drawnCard);
            
            // Check if drawn card can be played
            if (canPlay(drawnCard)) {
                playCard(drawnCard, aiHand, aiHand.length - 1);
            } else {
                advancePlayer();
                setTimeout(playAITurn, 1000);
            }
        } else {
            advancePlayer();
            setTimeout(playAITurn, 1000);
        }
    }
    
    renderPlayerHand();
    renderDiscardPile();
    renderAIHands();
}

function initializeGame() {
    deck = [];
    discardPile = [];
    playerHand = [];
    aiHands = [];
    currentPlayer = 0;
    gameDirection = 1;
    createDeck();
    shuffleDeck();
    dealCards();
    renderPlayerHand();
    renderDiscardPile();
    renderAIHands();
}

discardPileElement.addEventListener('dragover', (event) => {
    event.preventDefault();
});

discardPileElement.addEventListener('drop', (event) => {
    event.preventDefault();
    const cardData = JSON.parse(event.dataTransfer.getData('text'));
    const cardIndex = playerHand.findIndex(card => card.color === cardData.color && card.value === cardData.value);
    if (cardIndex > -1) {
        playCard(playerHand[cardIndex], playerHand, cardIndex);
    }
});

drawCardButton.addEventListener('click', () => {
    if (currentPlayer !== 0) return;
    
    if (deck.length > 0) {
        const drawnCard = deck.pop();
        playerHand.push(drawnCard);
        renderPlayerHand();
        
        if (canPlay(drawnCard)) {
            // Player can play the drawn card if they want, but we don't auto-play it
        } else {
            advancePlayer();
            setTimeout(playAITurn, 1000);
        }
    }
});

initializeGame();
