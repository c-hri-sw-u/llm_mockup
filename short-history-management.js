// Short History Management for Multi-Round Dialogue
// 多轮对话的简短历史记录管理

// Global state for short history
let shortHistory = [];
let currentRound = 0;
let maxRounds = 5;
let isMultiRoundEnabled = false;

// Make variables globally accessible
window.isMultiRoundEnabled = isMultiRoundEnabled;
window.currentRound = currentRound;

// Initialize short history management
function initializeShortHistory() {
    // Load state from localStorage
    loadShortHistoryState();
    
    // Create round indicator if multi-round is enabled
    if (isMultiRoundEnabled) {
        createRoundIndicator();
        updateRoundIndicator();
    }
}

// Load state from localStorage
function loadShortHistoryState() {
    try {
        const savedState = localStorage.getItem('shortHistoryState');
        if (savedState) {
            const state = JSON.parse(savedState);
            shortHistory = state.shortHistory || [];
            currentRound = state.currentRound || 0;
            maxRounds = state.maxRounds || 5;
            isMultiRoundEnabled = state.isMultiRoundEnabled || false;
            
            // Update global variables
            window.isMultiRoundEnabled = isMultiRoundEnabled;
            window.currentRound = currentRound;
        }
    } catch (error) {
        console.error('[ShortHistory] ❌ Failed to load state:', error);
    }
}

// Save state to localStorage
function saveShortHistoryState() {
    try {
        const state = {
            shortHistory,
            currentRound,
            maxRounds,
            isMultiRoundEnabled
        };
        localStorage.setItem('shortHistoryState', JSON.stringify(state));
    } catch (error) {
        console.error('[ShortHistory] ❌ Failed to save state:', error);
    }
}

// Enable multi-round mode
function enableMultiRound(rounds) {
    console.log('[ShortHistory] ✅ Enabling multi-round mode, rounds:', rounds);
    
    isMultiRoundEnabled = true;
    maxRounds = rounds;
    currentRound = 0;
    shortHistory = [];
    
    // Update global variables
    window.isMultiRoundEnabled = isMultiRoundEnabled;
    window.currentRound = currentRound;
    
    createRoundIndicator();
    updateRoundIndicator();
    addShortHistoryButton();
    saveShortHistoryState();
    
    // Update prompt display
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
    }
}

// Disable multi-round mode
function disableMultiRound() {
    console.log('[ShortHistory] ❌ Disabling multi-round mode');
    
    isMultiRoundEnabled = false;
    currentRound = 0;
    shortHistory = [];
    
    // Update global variables
    window.isMultiRoundEnabled = isMultiRoundEnabled;
    window.currentRound = currentRound;
    
    removeRoundIndicator();
    removeShortHistoryButton();
    saveShortHistoryState();
    
    // Update prompt display
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
    }
}

// Add new dialogue to history
function addDialogue(input, output) {
    if (!isMultiRoundEnabled) {
        console.log('[ShortHistory] ⚠️ Multi-round not enabled, skipping dialogue addition');
        return;
    }
    
    console.log('[ShortHistory] 📝 Adding dialogue to round:', currentRound + 1);
    console.log('[ShortHistory] 📝 Input:', input.trim());
    console.log('[ShortHistory] 📝 Output:', output.trim());
    
    const dialogue = {
        round: currentRound + 1,
        input: input.trim(),
        output: output.trim(),
        timestamp: new Date().toISOString()
    };
    
    shortHistory.push(dialogue);
    currentRound++;
    
    // Update global variables
    window.currentRound = currentRound;
    
    console.log('[ShortHistory] 📊 Updated currentRound to:', currentRound);
    console.log('[ShortHistory] 📊 History now contains:', shortHistory.length, 'dialogues');
    console.log('[ShortHistory] 📊 Short history content:');
    console.log(getShortHistory());
    
    // Update round indicator
    updateRoundIndicator();
    
    // Update prompt display if prompt textarea exists
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
        console.log('[ShortHistory] 🔄 Triggered prompt update');
    }
    
    // Check if we've reached max rounds
    if (currentRound >= maxRounds) {
        console.log('[ShortHistory] 🔄 Max rounds reached, resetting...');
        resetRounds();
    } else {
        saveShortHistoryState();
    }
}

// Reset rounds and clear history
function resetRounds() {
    console.log('[ShortHistory] 🔄 Resetting rounds and clearing history');
    
    currentRound = 0;
    shortHistory = [];
    
    // Update global variables
    window.currentRound = currentRound;
    
    updateRoundIndicator();
    
    // Update prompt display
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
    }
    
    saveShortHistoryState();
}

// Get formatted short history
function getShortHistory() {
    if (!isMultiRoundEnabled || shortHistory.length === 0) {
        return "There's no history yet, the dialogue just begined";
    }
    
    let formattedHistory = '';
    shortHistory.forEach(dialogue => {
        formattedHistory += `ROUND ${dialogue.round}:\n`;
        formattedHistory += `Input: ${dialogue.input}\n`;
        formattedHistory += `Output: ${dialogue.output}\n\n`;
    });
    
    return formattedHistory.trim();
}

// Create round indicator UI
function createRoundIndicator() {
    // Remove existing indicator if any
    removeRoundIndicator();
    
    const indicator = document.createElement('div');
    indicator.id = 'round-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background-color: #333;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        user-select: none;
    `;
    
    document.body.appendChild(indicator);
}

// Remove round indicator UI
function removeRoundIndicator() {
    const existing = document.getElementById('round-indicator');
    if (existing) {
        existing.remove();
    }
}

// Update round indicator display
function updateRoundIndicator() {
    const indicator = document.getElementById('round-indicator');
    if (indicator) {
        indicator.textContent = `ROUND ${currentRound}/${maxRounds}`;
        console.log('[ShortHistory] 🔄 Round indicator updated:', `${currentRound}/${maxRounds}`);
    }
}

// Add +short_history button to prompt buttons
function addShortHistoryButton() {
    const container = document.getElementById('prompt-buttons-header');
    if (!container) {
        console.warn('[ShortHistory] ⚠️ prompt-buttons-header not found');
        return;
    }
    
    // Check if button already exists
    if (document.getElementById('short-history-btn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.className = 'btn-small';
    button.id = 'short-history-btn';
    button.innerHTML = '+ <span class="variable-name">short_history</span>';
    button.onclick = () => insertShortHistoryVariable();
    
    // Insert as first button
    container.insertBefore(button, container.firstChild);
}

// Remove +short_history button
function removeShortHistoryButton() {
    const button = document.getElementById('short-history-btn');
    if (button) {
        button.remove();
    }
}

// Insert {{short_history}} variable into prompt
function insertShortHistoryVariable() {
    // Check if we're in unfold mode and prevent insertion
    if (typeof isFoldMode !== 'undefined' && !isFoldMode) {
        return; // Do nothing in unfold mode
    }
    
    const textarea = document.querySelector('.prompt-textarea');
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    const variable = '{{short_history}}';
    textarea.value = textBefore + variable + textAfter;
    textarea.focus();
    textarea.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
    
    // Update word count
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
    }
    
    console.log('[ShortHistory] 📝 {{short_history}} variable inserted');
}

// Update max rounds (called from model configuration)
function updateMaxRounds(rounds) {
    maxRounds = rounds;
    updateRoundIndicator();
    saveShortHistoryState();
}

// Manual trigger for adding dialogue (for testing or external calls)
function triggerAddDialogue() {
    console.log('[ShortHistory] 🔧 triggerAddDialogue called');
    
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    
    console.log('[ShortHistory] 🔧 Input textarea found:', !!inputTextarea);
    console.log('[ShortHistory] 🔧 Output textarea found:', !!outputTextarea);
    
    if (inputTextarea && outputTextarea) {
        const input = inputTextarea.value;
        const output = outputTextarea.value;
        
        console.log('[ShortHistory] 🔧 Input content:', input.trim() ? `"${input.trim()}"` : '(empty)');
        console.log('[ShortHistory] 🔧 Output content:', output.trim() ? `"${output.trim()}"` : '(empty)');
        
        if (input.trim() && output.trim()) {
            addDialogue(input, output);
            console.log('[ShortHistory] ✅ Dialogue added manually');
        } else {
            console.warn('[ShortHistory] ⚠️ Input or output is empty - cannot add dialogue');
        }
    } else {
        console.error('[ShortHistory] ❌ Could not find input or output textareas');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure other components are loaded
    setTimeout(() => {
        initializeShortHistory();
    }, 200);
});

// Debug function to check current state
function debugState() {
    console.log('[ShortHistory] 🐛 === DEBUG STATE ===');
    console.log('[ShortHistory] 🐛 isMultiRoundEnabled:', isMultiRoundEnabled);
    console.log('[ShortHistory] 🐛 currentRound:', currentRound);
    console.log('[ShortHistory] 🐛 maxRounds:', maxRounds);
    console.log('[ShortHistory] 🐛 shortHistory length:', shortHistory.length);
    console.log('[ShortHistory] 🐛 shortHistory content:', shortHistory);
    console.log('[ShortHistory] 🐛 getShortHistory() result:', getShortHistory());
    console.log('[ShortHistory] 🐛 Round indicator exists:', !!document.getElementById('round-indicator'));
    console.log('[ShortHistory] 🐛 Short history button exists:', !!document.getElementById('short-history-btn'));
    console.log('[ShortHistory] 🐛 === END DEBUG ===');
}

// Export functions for external access
window.ShortHistory = {
    enableMultiRound,
    disableMultiRound,
    addDialogue,
    getShortHistory,
    resetRounds,
    updateMaxRounds,
    triggerAddDialogue,
    getCurrentRound: () => currentRound,
    getMaxRounds: () => maxRounds,
    isEnabled: () => isMultiRoundEnabled,
    debugState
};

// Make functions globally accessible
window.enableMultiRound = enableMultiRound;
window.disableMultiRound = disableMultiRound;
window.addDialogue = addDialogue;
window.getShortHistory = getShortHistory;
window.debugShortHistory = debugState; 