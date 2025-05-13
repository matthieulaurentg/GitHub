import { setupNetworking } from './networking.mjs';
import { createPlayer, updatePlayer, drawPlayers } from './player.mjs';
import { startGameLoop } from './gameLoop.mjs';

// Kaboom setup
kaboom({
    global: false,
    canvas: document.getElementById('game-canvas'),
    width: 800,
    height: 400,
    background: [24, 24, 24],
});

let myPlayer = null;
let opponentPlayer = null;
let isHost = false;
let gameStarted = false;

const statusDiv = document.getElementById('status');
const lobbyDiv = document.getElementById('lobby');
const roomInput = document.getElementById('room-input');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const tankedToggle = document.getElementById('tanked-toggle');
const lobbiesDiv = document.getElementById('lobbies');
const startBtn = document.getElementById('start-btn');

function showStatus(msg) {
    statusDiv.textContent = msg;
}

function hideLobby() {
    lobbyDiv.style.display = 'none';
}

function showLobby() {
    lobbyDiv.style.display = 'block';
}

function showStartButton() {
    startBtn.style.display = 'inline-block';
}

function hideStartButton() {
    startBtn.style.display = 'none';
}

function startGame(isHostPlayer) {
    hideLobby();
    gameStarted = true;
    isHost = isHostPlayer;
    myPlayer = createPlayer(isHost ? 100 : 700, 300, isHost ? '🦸' : '🥷');
    opponentPlayer = createPlayer(isHost ? 700 : 100, 300, isHost ? '🥷' : '🦸');
    startGameLoop(myPlayer, opponentPlayer, isHost);
    showStatus('Fight!');
}

function renderLobbies(lobbies) {
    if (!lobbies || !lobbies.length) {
        lobbiesDiv.innerHTML = '<span style="opacity:0.7;">No public lobbies</span>';
        return;
    }
    lobbiesDiv.innerHTML = '';
    lobbies.forEach(lobby => {
        const btn = document.createElement('button');
        btn.textContent = `${lobby.room} ${lobby.tanked ? '🏆' : ''} (${lobby.players}/2)`;
        btn.style.margin = '4px 0';
        btn.style.width = '100%';
        btn.style.background = lobby.tanked ? '#ffd93d' : '#232323';
        btn.style.color = lobby.tanked ? '#181818' : '#fff';
        btn.style.fontWeight = lobby.tanked ? 'bold' : 'normal';
        btn.onclick = () => {
            roomInput.value = lobby.room;
            window.network.joinRoom(lobby.room);
        };
        lobbiesDiv.appendChild(btn);
    });
}

// Networking setup
setupNetworking({
    onRoomCreated: () => {
        showStatus('Room created. Waiting for opponent...');
        hideStartButton();
    },
    onRoomJoined: () => {
        showStatus('Joined room. Waiting for host to start...');
        hideStartButton();
    },
    onReadyToStart: () => {
        // Only host should see this
        showStartButton();
        showStatus('Opponent joined! Click Start Game.');
    },
    onStartGame: (isHostPlayer) => {
        hideStartButton();
        startGame(isHostPlayer);
    },
    onOpponentUpdate: (data) => {
        updatePlayer(opponentPlayer, data);
    },
    onOpponentLeft: () => {
        showStatus('Opponent left.');
        showLobby();
        hideStartButton();
        
        // If game was in progress, reset it
        if (gameStarted) {
            gameStarted = false;
            destroyAll();
            kaboom({
                global: false,
                canvas: document.getElementById('game-canvas'),
                width: 800,
                height: 400,
                background: [24, 24, 24],
            });
        }
    },
    onLobbyList: (lobbies) => {
        renderLobbies(lobbies);
    }
});

createBtn.onclick = () => {
    const room = roomInput.value.trim();
    const isTanked = tankedToggle.checked;
    if (room) {
        window.network.createRoom(room, isTanked);
    }
};

joinBtn.onclick = () => {
    const room = roomInput.value.trim();
    if (room) {
        window.network.joinRoom(room);
    }
};

startBtn.onclick = () => {
    window.network.sendStartGame();
}; 