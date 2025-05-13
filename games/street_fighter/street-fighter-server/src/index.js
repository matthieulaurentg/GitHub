/**
 * Street Fighter Multiplayer Server
 * Uses Cloudflare Durable Objects for WebSocket connections and game state persistence
 */

// Define the Durable Object
export class StreetFighterRoomDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    this.sessions = new Map();
    this.roomData = null;
  }

  async fetch(request) {
    // Handle WebSocket connections
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept the WebSocket connection
      server.accept();

      const url = new URL(request.url);
      const roomId = url.pathname.split('/').pop();
      const isTanked = url.searchParams.get('tanked') === 'true';
      const clientId = crypto.randomUUID();

      // Set up session data
      const session = {
        id: clientId,
        ws: server,
        room: roomId,l
        isHost: false, // Will be determined once connected
        playerData: null
      };

      // Load room data from storage
      this.roomData = await this.storage.get(`room:${roomId}`);
      if (!this.roomData) {
        // New room
        this.roomData = {
          id: roomId,
          tanked: isTanked,
          hostId: clientId, // First player is host
          players: [],
          started: false,
          createdAt: Date.now()
        };
        session.isHost = true;
      }

      // Add player to room
      this.roomData.players.push({
        id: clientId,
        isHost: session.isHost
      });

      // Save room data
      await this.storage.put(`room:${roomId}`, this.roomData);

      // Add to KV for public lobbies
      if (this.roomData.players.length < 2) {
        await this.env.STREET_FIGHTER.put(`lobby:${roomId}`, JSON.stringify({
          room: roomId,
          tanked: this.roomData.tanked,
          players: this.roomData.players.length
        }));
      }

      // Store session
      this.sessions.set(clientId, session);

      // Set up WebSocket event handlers
      server.addEventListener('message', async event => {
        try {
          const message = JSON.parse(event.data);
          await this.handleMessage(clientId, message);
        } catch (error) {
          server.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));
        }
      });

      server.addEventListener('close', async () => {
        // Clean up when a client disconnects
        await this.handleDisconnect(clientId);
      });

      // Notify client they're connected
      server.send(JSON.stringify({
        type: session.isHost ? 'room-created' : 'room-joined',
        clientId,
        isHost: session.isHost
      }));

      // If this is the second player joining, notify host
      if (this.roomData.players.length === 2) {
        // Remove from public lobbies
        await this.env.STREET_FIGHTER.delete(`lobby:${roomId}`);
        
        // Notify host that opponent joined
        const hostSession = Array.from(this.sessions.values())
          .find(s => s.isHost && s.room === roomId);
          
        if (hostSession) {
          hostSession.ws.send(JSON.stringify({
            type: 'ready-to-start'
          }));
        }
      }

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    return new Response('Not a WebSocket connection', { status: 400 });
  }

  async handleMessage(clientId, message) {
    const session = this.sessions.get(clientId);
    if (!session) return;

    switch (message.type) {
      case 'update':
        // Forward player updates to the opponent
        this.broadcastToOpponents(clientId, {
          type: 'update',
          payload: message.payload
        });
        break;
      
      case 'start':
        // Only host can start the game
        if (session.isHost && this.roomData.players.length === 2) {
          this.roomData.started = true;
          await this.storage.put(`room:${session.room}`, this.roomData);
          
          // Notify players that game is starting
          this.broadcastToRoom(session.room, {
            type: 'start'
          });
        }
        break;
    }
  }

  async handleDisconnect(clientId) {
    const session = this.sessions.get(clientId);
    if (!session) return;

    // Remove from sessions
    this.sessions.delete(clientId);

    // Update room data
    if (this.roomData) {
      this.roomData.players = this.roomData.players.filter(p => p.id !== clientId);
      
      if (this.roomData.players.length === 0) {
        // No players left, delete room
        await this.storage.delete(`room:${session.room}`);
        await this.env.STREET_FIGHTER.delete(`lobby:${session.room}`);
      } else {
        // Update room data
        await this.storage.put(`room:${session.room}`, this.roomData);
        
        // Notify remaining players
        this.broadcastToRoom(session.room, {
          type: 'opponent-left'
        });
      }
    }
  }

  broadcastToOpponents(clientId, message) {
    const session = this.sessions.get(clientId);
    if (!session) return;

    for (const [id, s] of this.sessions.entries()) {
      if (id !== clientId && s.room === session.room) {
        s.ws.send(JSON.stringify(message));
      }
    }
  }

  broadcastToRoom(roomId, message) {
    for (const session of this.sessions.values()) {
      if (session.room === roomId) {
        session.ws.send(JSON.stringify(message));
      }
    }
  }
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api')) {
      if (url.pathname === '/api/lobbies') {
        // List public lobbies
        const lobbiesPrefix = 'lobby:';
        const lobbiesList = await env.STREET_FIGHTER.list({ prefix: lobbiesPrefix });
        const lobbies = [];
        
        for (const key of lobbiesList.keys) {
          const lobbyData = await env.STREET_FIGHTER.get(key.name, { type: 'json' });
          if (lobbyData) {
            lobbies.push(lobbyData);
          }
        }
        
        return new Response(JSON.stringify(lobbies), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response('Not Found', { status: 404 });
    }
    
    // Handle WebSocket connections to rooms
    if (url.pathname.startsWith('/room/')) {
      // Get the room ID from the URL
      const roomId = url.pathname.split('/').pop();
      
      // Create an ID for the Durable Object based on the room ID
      // This ensures consistent routing to the same object
      const id = env.STREET_FIGHTER_ROOM.idFromName(roomId);
      
      // Get the Durable Object stub for that ID
      const stub = env.STREET_FIGHTER_ROOM.get(id);
      
      // Forward the request to the Durable Object
      return stub.fetch(request);
    }
    
    // Serve static assets as a fallback
    return env.ASSETS.fetch(request);
  }
}; 