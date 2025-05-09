const WS_URL = 'wss://ws.postman-echo.com/raw'; // Demo echo server

let ws = null;
let isHost = false;
let room = '';
let handlers = {};
let tanked = false;

// Demo: in-memory lobby list (local only, not shared between users)
let publicLobbies = [];

export function setupNetworking(events) {
    handlers = events;
    window.network = {
        createRoom,
        joinRoom,
        sendUpdate,
        getLobbies,
        sendStartGame,
    };
    // Demo: update lobby list every 2s
    setInterval(() => {
        if (handlers.onLobbyList) handlers.onLobbyList(publicLobbies);
    }, 2000);
}

function createRoom(roomName, isTanked) {
    isHost = true;
    room = roomName;
    tanked = isTanked;
    connect();
    // Add to public lobbies (demo only)
    publicLobbies.push({ room, tanked, players: 1 });
    if (handlers.onRoomCreated) handlers.onRoomCreated();
    if (handlers.onLobbyList) handlers.onLobbyList(publicLobbies);
}

function joinRoom(roomName) {
    isHost = false;
    room = roomName;
    connect();
    // Update lobby (demo only)
    const lobby = publicLobbies.find(l => l.room === roomName);
    if (lobby) lobby.players = 2;
    if (handlers.onRoomJoined) handlers.onRoomJoined();
    if (handlers.onLobbyList) handlers.onLobbyList(publicLobbies);
}

function getLobbies() {
    return publicLobbies;
}

function connect() {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', room, isHost, tanked }));
        // Only the joiner notifies the host to show Start Game
        if (!isHost && handlers.onRoomJoined) {
            setTimeout(() => {
                // Notify host to show Start Game button
                if (handlers.onReadyToStart) handlers.onReadyToStart();
            }, 1000);
        }
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && handlers.onOpponentUpdate) {
            handlers.onOpponentUpdate(data.payload);
        }
        if (data.type === 'start' && handlers.onStartGame) {
            handlers.onStartGame(false); // joiner starts game
        }
    };
    ws.onclose = () => {
        if (handlers.onOpponentLeft) handlers.onOpponentLeft();
    };
}

function sendUpdate(payload) {
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'update', room, payload }));
    }
}

function sendStartGame() {
    if (ws && ws.readyState === 1 && isHost) {
        ws.send(JSON.stringify({ type: 'start', room }));
        if (handlers.onStartGame) handlers.onStartGame(true); // host starts game
    }
} 