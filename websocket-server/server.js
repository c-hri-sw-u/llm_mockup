const WebSocket = require('ws');
const os = require('os');

// Configuration
const PORT = 2025;
let SERVER_IP = 'localhost'; // Global variable for IP address

// Get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// WebSocket server
const wss = new WebSocket.Server({ port: PORT });

// Client connections
let questClient = null;
let frontendClient = null;

// Message handlers
const handleQuestMessage = (message, ws) => {
    try {
        console.log('[Server] 📱 Quest message received:', message.substring(0, 100) + '...');
        
        // Forward to frontend if connected
        if (frontendClient && frontendClient.readyState === WebSocket.OPEN) {
            frontendClient.send(JSON.stringify({
                type: 'quest_data',
                data: JSON.parse(message)
            }));
            console.log('[Server] ➡️ Forwarded to frontend');
        } else {
            console.log('[Server] ⚠️ Frontend not connected');
        }
    } catch (error) {
        console.error('[Server] ❌ Error handling Quest message:', error);
    }
};

const handleFrontendMessage = (message, ws) => {
    try {
        console.log('[Server] 💻 Frontend message received:', message.substring(0, 100) + '...');
        
        const parsedMessage = JSON.parse(message);
        
        if (parsedMessage.type === 'llm_response') {
            // Forward LLM response to Quest
            if (questClient && questClient.readyState === WebSocket.OPEN) {
                questClient.send(JSON.stringify({
                    type: 'llm_response',
                    data: parsedMessage.data
                }));
                console.log('[Server] ➡️ LLM response forwarded to Quest');
            } else {
                console.log('[Server] ⚠️ Quest not connected');
            }
        }
    } catch (error) {
        console.error('[Server] ❌ Error handling Frontend message:', error);
    }
};

// Connection handler
wss.on('connection', (ws, req) => {
    const url = req.url;
    console.log(`[Server] 🔗 New connection: ${url}`);
    
    if (url === '/quest') {
        // Quest connection
        questClient = ws;
        console.log('[Server] 📱 Quest client connected');
        
        ws.on('message', (message) => handleQuestMessage(message.toString(), ws));
        
        ws.on('close', () => {
            console.log('[Server] 📱 Quest client disconnected');
            questClient = null;
        });
        
    } else if (url === '/frontend') {
        // Frontend connection
        frontendClient = ws;
        console.log('[Server] 💻 Frontend client connected');
        
        ws.on('message', (message) => handleFrontendMessage(message.toString(), ws));
        
        ws.on('close', () => {
            console.log('[Server] 💻 Frontend client disconnected');
            frontendClient = null;
        });
        
    } else {
        // Unknown connection
        console.log('[Server] ❓ Unknown connection, closing');
        ws.close();
    }
    
    ws.on('error', (error) => {
        console.error('[Server] ❌ WebSocket error:', error);
    });
});

// Server startup
SERVER_IP = getLocalIPAddress();

console.log('=================================');
console.log('🚀 LLM Mockup WebSocket Server');
console.log('=================================');
console.log(`📡 Server running on port: ${PORT}`);
console.log(`🌐 Local IP: ${SERVER_IP}`);
console.log(`🔗 Quest endpoint: ws://${SERVER_IP}:${PORT}/quest`);
console.log(`🔗 Frontend endpoint: ws://localhost:${PORT}/frontend`);
console.log('=================================');

// Handle server errors
wss.on('error', (error) => {
    console.error('[Server] ❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Server] 🛑 Shutting down server...');
    wss.close(() => {
        console.log('[Server] ✅ Server closed');
        process.exit(0);
    });
});

// Export for potential testing
module.exports = { wss, SERVER_IP, PORT }; 