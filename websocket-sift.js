// WebSocket Data Sift Module
// Processes simplified name-value data from Quest and updates inputItems

class WebSocketSift {
    constructor() {
        this.receivedData = {}; // Store latest received values for display
        console.log('[WebSocketSift] 🔍 Sift module initialized');
    }
    
    // Process Quest data in name-value format
    processQuestData(questDataArray) {
        try {
            console.log('[WebSocketSift] 🔧 Processing Quest data array:', questDataArray);
            
            // Validate input
            if (!Array.isArray(questDataArray)) {
                console.error('[WebSocketSift] ❌ Invalid data format: expected array');
                return false;
            }
            
            // Clear previous received data
            this.receivedData = {};
            
            // Process each name-value pair
            questDataArray.forEach(item => {
                if (item && typeof item === 'object' && item.name && item.value !== null && item.value !== undefined) {
                    this.receivedData[item.name] = item.value;
                    console.log(`[WebSocketSift] 📝 Received: ${item.name} = ${item.value}`);
                } else if (item && item.name && (item.value === null || item.value === undefined)) {
                    console.log(`[WebSocketSift] ⏭️ Skipping null value for: ${item.name}`);
                }
            });
            
            // Update inputItems with sifted data
            this.updateInputItems();
            
            // Update UI display
            this.updateWebSocketDisplay();
            
            return true;
            
        } catch (error) {
            console.error('[WebSocketSift] ❌ Error processing Quest data:', error);
            return false;
        }
    }
    
    // Update inputItems based on received data and current enabled states
    updateInputItems() {
        if (typeof window.inputItems === 'undefined') {
            console.error('[WebSocketSift] ❌ inputItems not found in global scope');
            return;
        }
        
        console.log('[WebSocketSift] 🎯 Updating inputItems with sifted data');
        
        // Iterate through current inputItems
        window.inputItems.forEach((item, index) => {
            // Only update if item is enabled and we have received data for it
            if (item.enabled && this.receivedData.hasOwnProperty(item.name)) {
                const newValue = this.receivedData[item.name];
                
                console.log(`[WebSocketSift] ✏️ Updating ${item.name}: ${item.state} → ${newValue}`);
                
                // Update the state regardless of type
                window.inputItems[index].state = newValue;
                
                // For selection type, we could validate against options, but as requested, we just go for it
                if (item.type === 'selection' && item.options && !item.options.includes(newValue)) {
                    console.warn(`[WebSocketSift] ⚠️ Value "${newValue}" not in options for ${item.name}, but updating anyway`);
                }
                
            } else if (!item.enabled && this.receivedData.hasOwnProperty(item.name)) {
                console.log(`[WebSocketSift] 🚫 Skipping disabled item: ${item.name}`);
            }
        });
        
        // Save updated inputItems
        if (typeof saveToStorage === 'function') {
            saveToStorage();
        }
        
        // Re-render UI
        if (typeof renderInputItems === 'function') {
            renderInputItems();
        }
        
        console.log('[WebSocketSift] ✅ inputItems updated successfully');
    }
    
    // Update WebSocket display windows under each context item
    updateWebSocketDisplay() {
        console.log('[WebSocketSift] 🎨 Updating WebSocket display windows');
        
        // Update display for each received data item
        Object.keys(this.receivedData).forEach(name => {
            const value = this.receivedData[name];
            const displayElement = document.getElementById(`ws-display-${name}`);
            
            if (displayElement) {
                displayElement.textContent = `WS: ${value}`;
                displayElement.classList.add('ws-has-data');
                
                // Find corresponding inputItem to check if it's enabled
                const matchingItem = window.inputItems?.find(item => item.name === name);
                if (matchingItem && !matchingItem.enabled) {
                    displayElement.classList.add('ws-disabled-item');
                } else {
                    displayElement.classList.remove('ws-disabled-item');
                }
                
                console.log(`[WebSocketSift] 📺 Updated display for ${name}: ${value}`);
            }
        });
        
        // Clear displays for items not in received data
        const allDisplays = document.querySelectorAll('[id^="ws-display-"]');
        allDisplays.forEach(display => {
            const name = display.id.replace('ws-display-', '');
            if (!this.receivedData.hasOwnProperty(name)) {
                display.textContent = 'WS: --';
                display.classList.remove('ws-has-data', 'ws-disabled-item');
            }
        });
    }
    
    // Get current received data for debugging
    getReceivedData() {
        return { ...this.receivedData };
    }
    
    // Get matching status between received data and inputItems
    getMatchingStatus() {
        const status = {
            matched: [],
            unmatched: [],
            disabled: []
        };
        
        if (typeof window.inputItems === 'undefined') {
            return status;
        }
        
        Object.keys(this.receivedData).forEach(name => {
            const matchingItem = window.inputItems.find(item => item.name === name);
            
            if (matchingItem) {
                if (matchingItem.enabled) {
                    status.matched.push(name);
                } else {
                    status.disabled.push(name);
                }
            } else {
                status.unmatched.push(name);
            }
        });
        
        return status;
    }
    
    // Clear all received data and displays
    clear() {
        console.log('[WebSocketSift] 🧹 Clearing all received data');
        this.receivedData = {};
        this.updateWebSocketDisplay();
    }
}

// Initialize sift module
let webSocketSift = null;

// Initialize function
function initializeWebSocketSift() {
    if (!webSocketSift) {
        webSocketSift = new WebSocketSift();
        console.log('[WebSocketSift] 🎯 Sift module initialized and ready');
        
        // Make globally accessible for debugging
        window.webSocketSift = webSocketSift;
    }
    return webSocketSift;
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebSocketSift);
} else {
    initializeWebSocketSift();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebSocketSift, initializeWebSocketSift };
} 