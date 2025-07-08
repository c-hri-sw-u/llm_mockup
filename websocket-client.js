// WebSocket Client Module for LLM Mockup
// Handles communication with Quest 3 via WebSocket server

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.isEnabled = false;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        
        // Bind methods to preserve context
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.toggle = this.toggle.bind(this);
        this.sendResponse = this.sendResponse.bind(this);
        
        console.log('[WebSocketClient] 🚀 Initialized');
    }
    
    // Connect to WebSocket server
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('[WebSocketClient] ⚠️ Already connected');
            return;
        }
        
        try {
            console.log('[WebSocketClient] 🔗 Connecting to WebSocket server...');
            this.ws = new WebSocket('ws://localhost:2025/frontend');
            
            this.ws.onopen = () => {
                console.log('[WebSocketClient] ✅ Connected to server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateUI();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.ws.onclose = () => {
                console.log('[WebSocketClient] 🔌 Connection closed');
                this.isConnected = false;
                this.updateUI();
                
                // Auto-reconnect if enabled
                if (this.isEnabled && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`[WebSocketClient] 🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(this.connect, this.reconnectDelay);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('[WebSocketClient] ❌ WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('[WebSocketClient] ❌ Connection failed:', error);
        }
    }
    
    // Disconnect from WebSocket server
    disconnect() {
        if (this.ws) {
            console.log('[WebSocketClient] 🔌 Disconnecting...');
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.updateUI();
    }
    
    // Handle incoming messages from server
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('[WebSocketClient] 📨 Message received:', message.type);
            
            if (message.type === 'quest_data') {
                this.processQuestData(message.data);
            }
        } catch (error) {
            console.error('[WebSocketClient] ❌ Error handling message:', error);
        }
    }
    
    // Process Quest data using the sift module
    processQuestData(questData) {
        try {
            console.log('[WebSocketClient] 🔧 Processing Quest data with sift module...');
            
            // Store original inputItems for potential restoration
            if (typeof window.inputItems !== 'undefined' && !this.originalInputItems) {
                this.originalInputItems = [...window.inputItems];
            }
            
            // Use the sift module to process the simplified name-value data
            if (typeof window.webSocketSift !== 'undefined') {
                const success = window.webSocketSift.processQuestData(questData);
                
                if (success) {
                    console.log('[WebSocketClient] ✅ Data processed successfully by sift module');
                    
                    // Auto-trigger model run after a small delay
                    setTimeout(() => {
                        this.triggerModelRun();
                    }, 100);
                    
                } else {
                    console.error('[WebSocketClient] ❌ Sift module failed to process data');
                }
                
            } else {
                console.error('[WebSocketClient] ❌ WebSocket sift module not found');
                // Fallback to old processing method if sift module is not available
                this.processQuestDataFallback(questData);
            }
            
        } catch (error) {
            console.error('[WebSocketClient] ❌ Error processing Quest data:', error);
        }
    }
    
    // Fallback processing method (old logic)
    processQuestDataFallback(questData) {
        console.log('[WebSocketClient] 🔄 Using fallback processing method');
        
        // Validate data structure
        if (!Array.isArray(questData)) {
            console.error('[WebSocketClient] ❌ Invalid data format: expected array');
            return;
        }
        
        // Update global inputItems
        if (typeof window.inputItems !== 'undefined') {
            // Process quest data: convert null/undefined to disabled state
            const processedItems = questData.map(item => {
                const processed = { ...item };
                
                // Handle null/undefined values by disabling the item
                if (processed.state === null || processed.state === undefined || processed.state === 'null') {
                    processed.enabled = false;
                    processed.state = ''; // Set to empty string for consistency
                } else {
                    processed.enabled = true;
                }
                
                return processed;
            });
            
            // Update inputItems
            window.inputItems = processedItems;
            
            // Re-render UI if function exists
            if (typeof renderInputItems === 'function') {
                renderInputItems();
                console.log('[WebSocketClient] 🎨 UI updated with Quest data (fallback)');
            }
            
        } else {
            console.error('[WebSocketClient] ❌ inputItems not found in global scope');
        }
    }
    
    // Trigger model run (simulate OK button click)
    triggerModelRun() {
        try {
            console.log('[WebSocketClient] ▶️ Triggering model run...');
            
            // Check if handleRunModel function exists and call it
            if (typeof handleRunModel === 'function') {
                handleRunModel();
                
                // Monitor for completion to send response
                this.monitorModelCompletion();
            } else {
                console.error('[WebSocketClient] ❌ handleRunModel function not found');
            }
        } catch (error) {
            console.error('[WebSocketClient] ❌ Error triggering model run:', error);
        }
    }
    
    // Monitor model completion and send response
    monitorModelCompletion() {
        const outputTextarea = document.querySelector('.output-section .main-textarea');
        if (!outputTextarea) {
            console.error('[WebSocketClient] ❌ Output textarea not found');
            return;
        }
        
        // Store initial output value
        const initialOutput = outputTextarea.value;
        
        // Check for output changes (indicating completion)
        const checkCompletion = () => {
            const currentOutput = outputTextarea.value;
            
            // Check if model is no longer running and output has changed
            if (!window.isRunning && currentOutput !== initialOutput && currentOutput.trim()) {
                console.log('[WebSocketClient] ✅ Model run completed');
                this.sendResponse(currentOutput);
            } else if (window.isRunning) {
                // Still running, check again
                setTimeout(checkCompletion, 500);
            } else {
                // Not running but no new output, might be an error
                setTimeout(checkCompletion, 100);
            }
        };
        
        // Start monitoring after a short delay
        setTimeout(checkCompletion, 500);
    }
    
    // Send LLM response back to Quest
    sendResponse(responseText) {
        if (!this.isConnected || !this.ws) {
            console.error('[WebSocketClient] ❌ Not connected to server');
            return;
        }
        
        try {
            const message = {
                type: 'llm_response',
                data: responseText
            };
            
            this.ws.send(JSON.stringify(message));
            console.log('[WebSocketClient] 📤 Response sent to Quest:', responseText.substring(0, 100) + '...');
        } catch (error) {
            console.error('[WebSocketClient] ❌ Error sending response:', error);
        }
    }
    
    // Toggle WebSocket mode on/off
    toggle() {
        this.isEnabled = !this.isEnabled;
        console.log('[WebSocketClient] 🔄 WebSocket mode:', this.isEnabled ? 'ENABLED' : 'DISABLED');
        
        if (this.isEnabled) {
            this.connect();
        } else {
            this.disconnect();
            // Clear sift module data
            if (typeof window.webSocketSift !== 'undefined') {
                window.webSocketSift.clear();
                console.log('[WebSocketClient] 🧹 Cleared sift module data');
            }
            // Restore original inputItems if available
            if (this.originalInputItems && typeof window.inputItems !== 'undefined') {
                window.inputItems = [...this.originalInputItems];
                if (typeof renderInputItems === 'function') {
                    renderInputItems();
                }
                console.log('[WebSocketClient] 🔄 Restored original inputItems');
            }
        }
        
        this.updateUI();
    }
    
    // Update UI elements
    updateUI() {
        const toggleButton = document.getElementById('websocket-toggle-btn');
        if (toggleButton) {
            if (this.isEnabled) {
                toggleButton.textContent = this.isConnected ? 'WS: ON' : 'WS: CONNECTING';
                toggleButton.classList.add('active');
                toggleButton.classList.toggle('connecting', !this.isConnected);
            } else {
                toggleButton.textContent = 'WS: OFF';
                toggleButton.classList.remove('active', 'connecting');
            }
        }
    }
    
    // Get current status
    getStatus() {
        return {
            enabled: this.isEnabled,
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// Initialize WebSocket client
let webSocketClient = null;

// Initialize function to be called when DOM is ready
function initializeWebSocketClient() {
    if (!webSocketClient) {
        webSocketClient = new WebSocketClient();
        console.log('[WebSocketClient] 🎯 Client initialized and ready');
        
        // Make globally accessible for debugging
        window.webSocketClient = webSocketClient;
    }
    return webSocketClient;
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebSocketClient);
} else {
    initializeWebSocketClient();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebSocketClient, initializeWebSocketClient };
} 