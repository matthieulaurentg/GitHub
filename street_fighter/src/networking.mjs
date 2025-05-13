// Replace the demo echo server with our Cloudflare Worker
const SERVER_URL = 'https://street-fighter-server.matthieu-laurentg.workers.dev';

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

async function getLobbies() {
    try {
        const response = await fetch(`${SERVER_URL}/api/lobbies`);
        if (!response.ok) return;
        
        const lobbies = await response.json();
        if (handlers.onLobbyList) handlers.onLobbyList(lobbies);
    } catch (error) {
        console.error('Failed to fetch lobbies:', error);
    }
}

function connect() {
    // Create a WebSocket connection to our Worker
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${SERVER_URL.split('//')[1]}/room/${room}?tanked=${tanked}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Connected to server');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (error) {
            console.error('Invalid message from server:', error);
        }
    };
    
    ws.onclose = () => {
        if (handlers.onOpponentLeft) handlers.onOpponentLeft();
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (handlers.onOpponentLeft) handlers.onOpponentLeft();
    };
}

function handleServerMessage(data) {
    switch (data.type) {
        case 'room-created':
            // Already handled by createRoom function
            break;
            
        case 'room-joined':
            // Already handled by joinRoom function
            break;
            
        case 'ready-to-start':
            if (handlers.onReadyToStart) handlers.onReadyToStart();
            break;
            
        case 'start':
            if (handlers.onStartGame) handlers.onStartGame(!isHost);
            break;
            
        case 'update':
            if (handlers.onOpponentUpdate) handlers.onOpponentUpdate(data.payload);
            break;
            
        case 'opponent-left':
            if (handlers.onOpponentLeft) handlers.onOpponentLeft();
            break;
    }
}

function sendUpdate(payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'update', payload }));
    }
}

function sendStartGame() {
    if (ws && ws.readyState === WebSocket.OPEN && isHost) {
        ws.send(JSON.stringify({ type: 'start' }));
    }
} 