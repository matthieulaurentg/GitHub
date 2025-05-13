const colors = ['red', 'green', 'blue', 'yellow'];
34const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
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
    for (const card of playerHand) {
        renderCard(card, playerHandElement, currentPlayer === 0);
    }
}

function renderDiscardPile() {
    discardPileElement.innerHTML = '';
    const topCard = discardPile[discardPile.length - 1];
    renderCard(topCard, discardPileElement);
}

function renderAIHands() {
    for (let i = 0; i < aiHands.length; i++) {
        const aiHandElement = document.getElementById(`ai-${i + 1}`);
        aiHandElement.innerHTML = '';
        for (const card of aiHands[i]) {
            renderCard({ color: 'gray', value: '' }, aiHandElement); // Render AI cards face down
        }
    }
}

function canPlay(card) {
    const topCard = discardPile[discardPile.length - 1];
    return card.color === 'wild' || card.color === topCard.color || card.value === topCard.value;
}

function playCard(card, hand, index) {
  if (canPlay(card)) {
    const cardElement =
      hand === playerHand
        ? playerHandElement.children[index]
        : document.getElementById(`ai-${currentPlayer}`);
    if (cardElement) {
      cardElement.classList.add("moving");
    }

    discardPile.push(hand.splice(index, 1)[0]);
    if (card.value === "Skip") {
      currentPlayer = (currentPlayer + 2 * gameDirection) % 4;
    } else if (card.value === "Reverse") {
      gameDirection *= -1;
      currentPlayer = (currentPlayer + 4 + gameDirection) % 4; // Ensure positive index
    } else if (card.value === "Draw Two") {
      const nextPlayer = (currentPlayer + gameDirection) % 4;
      if (nextPlayer === 0) {
        playerHand.push(deck.pop());
        playerHand.push(deck.pop());
      } else {
        aiHands[nextPlayer - 1].push(deck.pop());
        aiHands[nextPlayer - 1].push(deck.pop());
      }
      currentPlayer = (currentPlayer + 2 * gameDirection) % 4;
    } else if (card.value === "Wild Draw Four") {
      const nextPlayer = (currentPlayer + gameDirection) % 4;
      if (nextPlayer === 0) {
        playerHand.push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
      } else {
        aiHands[nextPlayer - 1].push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
      }
      currentPlayer = (currentPlayer + 2 * gameDirection) % 4;
    } else {
      currentPlayer = (currentPlayer + gameDirection) % 4;
    }

    setTimeout(() => {
      renderPlayerHand();
      renderDiscardPile();
      renderAIHands();
      if (cardElement) {
        cardElement.classList.remove("moving");
      }
      if (hand.length === 0) {
        alert(`Player ${currentPlayer === 0 ? "You" : currentPlayer} won!`);
        initializeGame();
      }
    }, 300); // Animation duration
  }
}

function playAITurn() {
    const aiHand = aiHands[currentPlayer - 1];
    const topCard = discardPile[discardPile.length - 1];
    let cardPlayed = false;

    // Try to play a matching card
    for (let i = 0; i < aiHand.length; i++) {
        if (canPlay(aiHand[i])) {
            playCard(aiHand[i], aiHand, i);
            cardPlayed = true;
            break;
        }
    }

    // If no matching card, try to play a wild card
    if (!cardPlayed) {
        for (let i = 0; i < aiHand.length; i++) {
            if (aiHand[i].color === 'wild') {
                playCard(aiHand[i], aiHand, i);
                cardPlayed = true;
                break;
            }
        }
    }

    // If no playable card, draw a card
    if (!cardPlayed) {
        aiHand.push(deck.pop());
        const newCard = aiHand[aiHand.length - 1];
        if (canPlay(newCard)) {
            playCard(newCard, aiHand, aiHand.length - 1);
            cardPlayed = true;
        }
    }

    // End turn if no card was played, otherwise AI plays again
    if (!cardPlayed) {
        currentPlayer = (currentPlayer + gameDirection) % 4;
    }
    
    renderAIHands();
    if (currentPlayer !== 0 && cardPlayed) {
        setTimeout(playAITurn, 1000);
    }
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
    playerHand.push(deck.pop());
    renderPlayerHand();
    currentPlayer = (currentPlayer + gameDirection) % 4;
    if (currentPlayer !== 0) {
        setTimeout(playAITurn, 1000);
    }
});

initializeGame();
