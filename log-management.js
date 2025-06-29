// Conversation Log Management System
// 对话记录管理系统

class ConversationLogger {
    constructor() {
        this.storageKey = 'conversation-logs';
        this.maxLogs = 100; // 最多保存100条对话记录
        this.isLogPanelOpen = false;
        this.currentSessionId = null;
        this.currentSessionLogs = [];
        
        this.initializeLogger();
    }

    // Initialize logger
    initializeLogger() {
        console.log('[ConversationLogger] 🚀 Initializing conversation logger');
        
        // Load existing logs
        this.loadLogsFromStorage();
        
        // Hook into the model runner to capture conversations
        this.hookIntoModelRunner();
        
        console.log('[ConversationLogger] ✅ Conversation logger initialized');
    }

    // Hook into model runner to capture conversations
    hookIntoModelRunner() {
        // Override the displayResult function to capture output
        if (window.displayResult) {
            const originalDisplayResult = window.displayResult;
            
            window.displayResult = (result) => {
                // Call original function first
                originalDisplayResult(result);
                
                // Then capture the conversation
                this.captureConversation(result);
            };
        } else {
            // If displayResult doesn't exist yet, wait for it
            const checkDisplayResult = setInterval(() => {
                if (window.displayResult) {
                    clearInterval(checkDisplayResult);
                    
                    const originalDisplayResult = window.displayResult;
                    
                    window.displayResult = (result) => {
                        originalDisplayResult(result);
                        this.captureConversation(result);
                    };
                }
            }, 100);
        }
    }

    // Capture conversation after model run
    captureConversation(result) {
        try {
            console.log('[ConversationLogger] 📝 Capturing conversation');
            
            // Get input text
            const inputTextarea = document.querySelector('.input-section .main-textarea');
            const inputText = inputTextarea ? inputTextarea.value.trim() : '';
            
            // Get output text (from result or textarea)
            const outputText = result || '';
            
            if (!inputText && !outputText) {
                console.log('[ConversationLogger] ⚠️ No input or output to capture');
                return;
            }
            
            // Get current configuration
            const config = this.getCurrentConfiguration();
            
            // Check if we're in multi-round mode
            const isMultiRound = this.isMultiRoundEnabled();
            const roundNumber = this.getCurrentRoundNumber();
            
            console.log('[ConversationLogger] 🔍 Multi-round status:', isMultiRound);
            console.log('[ConversationLogger] 🔍 Round number:', roundNumber);
            
            // Create log entry
            const logEntry = {
                id: Date.now() + Math.random(),
                input: inputText,
                output: outputText,
                config: config,
                timestamp: new Date().toISOString(),
                isMultiRound: isMultiRound,
                sessionId: this.getOrCreateSessionId(),
                roundNumber: roundNumber
            };
            
            console.log('[ConversationLogger] 📋 Log entry:', {
                isMultiRound: logEntry.isMultiRound,
                sessionId: logEntry.sessionId,
                roundNumber: logEntry.roundNumber
            });
            
            // Add to current session logs
            this.currentSessionLogs.push(logEntry);
            
            // Save to storage
            this.saveLogEntry(logEntry);
            
            // Update display if panel is open
            if (this.isLogPanelOpen) {
                this.updateLogDisplay();
            }
            
            console.log('[ConversationLogger] ✅ Conversation captured successfully');
            
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to capture conversation:', error);
        }
    }

    // Get current configuration including all context
    getCurrentConfiguration() {
        try {
            // Get input items
            let inputItems = [];
            if (window.FormInputs && typeof window.FormInputs.getInputItems === 'function') {
                inputItems = [...window.FormInputs.getInputItems()];
            } else if (window.inputItems) {
                inputItems = [...window.inputItems];
            }
            
            // Get model configuration (exclude API key for security)
            const originalModelConfig = window.ModelConfiguration ? 
                window.ModelConfiguration.getCurrentConfig() : {};
            const modelConfig = { ...originalModelConfig };
            delete modelConfig.apiKey; // Remove API key from logs
            
            // Get prompt text
            const promptTextarea = document.querySelector('.prompt-textarea');
            const promptText = promptTextarea ? promptTextarea.value : '';
            
            // Get short history if multi-round is enabled
            let shortHistory = '';
            if (typeof getShortHistory === 'function') {
                shortHistory = getShortHistory();
            }
            
            return {
                inputItems,
                modelConfig,
                promptText,
                shortHistory,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to get configuration:', error);
            return {};
        }
    }

    // Check if multi-round is enabled
    isMultiRoundEnabled() {
        // Check multiple possible locations for the variable
        if (typeof isMultiRoundEnabled !== 'undefined') {
            return isMultiRoundEnabled;
        }
        if (window.isMultiRoundEnabled !== undefined) {
            return window.isMultiRoundEnabled;
        }
        // Check if shortHistory exists and has content as backup indicator
        if (typeof getShortHistory === 'function') {
            const history = getShortHistory();
            return history && history !== "There's no history yet, the dialogue just begined";
        }
        return false;
    }

    // Get current round number
    getCurrentRoundNumber() {
        // Check multiple possible locations for the variable
        if (typeof currentRound !== 'undefined') {
            return currentRound;
        }
        if (window.currentRound !== undefined) {
            return window.currentRound;
        }
        return 0;
    }

    // Get or create session ID for multi-round conversations
    getOrCreateSessionId() {
        if (this.isMultiRoundEnabled()) {
            if (!this.currentSessionId) {
                this.currentSessionId = 'session_' + Date.now();
            }
            return this.currentSessionId;
        } else {
            // For single-round conversations, each has its own session
            return 'single_' + Date.now() + Math.random();
        }
    }

    // Start new session (called when multi-round resets)
    startNewSession() {
        this.currentSessionId = null;
        this.currentSessionLogs = [];
        console.log('[ConversationLogger] 🔄 Started new session');
    }

    // Save log entry to storage
    saveLogEntry(logEntry) {
        try {
            const logs = this.loadLogsFromStorage();
            
            // Add new log to beginning
            logs.unshift(logEntry);
            
            // Keep only the most recent logs
            if (logs.length > this.maxLogs) {
                logs.splice(this.maxLogs);
            }
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
            
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to save log:', error);
        }
    }

    // Load logs from storage
    loadLogsFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to load logs:', error);
            return [];
        }
    }

    // Toggle log panel visibility
    toggleLogPanel() {
        this.isLogPanelOpen = !this.isLogPanelOpen;
        
        const panel = document.getElementById('log-panel');
        const button = document.getElementById('log-toggle-btn');
        
        if (panel && button) {
            if (this.isLogPanelOpen) {
                panel.classList.add('open');
                button.classList.add('active');
                this.updateLogDisplay();
            } else {
                panel.classList.remove('open');
                button.classList.remove('active');
            }
        }
    }

    // Update log display
    updateLogDisplay() {
        const contentDiv = document.getElementById('log-panel-content');
        if (!contentDiv) return;
        
        const logs = this.loadLogsFromStorage();
        
        if (logs.length === 0) {
            contentDiv.innerHTML = '<div class="no-logs-message">No conversation logs yet</div>';
            return;
        }
        
        // Group logs by session for multi-round conversations
        const groupedLogs = this.groupLogsBySession(logs);
        
        console.log('[ConversationLogger] 🎨 Rendering logs, grouped sessions:', groupedLogs.length);
        
        let html = '';
        
        groupedLogs.forEach(group => {
            console.log('[ConversationLogger] 🎯 Processing group:', {
                sessionId: group.sessionId,
                isMultiRound: group.isMultiRound,
                logCount: group.logs.length
            });
            
            if (group.isMultiRound && group.logs.length > 1) {
                // Multi-round conversation group
                console.log('[ConversationLogger] 🔗 Rendering multi-round group');
                html += this.renderMultiRoundGroup(group);
            } else {
                // Single conversation or single log in session
                console.log('[ConversationLogger] 📝 Rendering single logs');
                group.logs.forEach(log => {
                    html += this.renderSingleLog(log);
                });
            }
        });
        
        contentDiv.innerHTML = html;
    }

    // Group logs by session
    groupLogsBySession(logs) {
        const sessions = new Map();
        
        logs.forEach(log => {
            const sessionId = log.sessionId || 'unknown';
            
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, {
                    sessionId,
                    isMultiRound: log.isMultiRound,
                    logs: [],
                    timestamp: log.timestamp
                });
            }
            
            sessions.get(sessionId).logs.push(log);
            
            // Update isMultiRound flag if any log in session is multi-round
            if (log.isMultiRound) {
                sessions.get(sessionId).isMultiRound = true;
            }
        });
        
        // Convert to array and sort by timestamp (newest first)
        const groupedSessions = Array.from(sessions.values()).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Debug logging
        console.log('[ConversationLogger] 🔍 Grouped sessions:', groupedSessions);
        
        return groupedSessions;
    }

    // Render multi-round conversation group
    renderMultiRoundGroup(group) {
        const date = new Date(group.timestamp).toLocaleString('zh-CN');
        const roundCount = group.logs.length;
        
        let html = `
            <div class="log-multi-round-group">
                <div class="log-multi-round-header">
                    <span>Multi-Round Conversation (${roundCount} rounds)</span>
                    <span>${date}</span>
                </div>
                <div class="log-multi-round-content">
        `;
        
        // Sort logs by round number
        const sortedLogs = group.logs.sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0));
        
        sortedLogs.forEach((log, index) => {
            html += this.renderSingleLog(log, true, index + 1);
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    // Render single log entry
    renderSingleLog(log, isInGroup = false, roundNumber = null) {
        const date = new Date(log.timestamp).toLocaleString('zh-CN');
        const config = log.config || {};
        
        let html = `
            <div class="log-entry ${isInGroup ? '' : 'single-log'}">
                <div class="log-entry-header">
                    <div class="log-entry-timestamp">${date}</div>
                    <div class="log-entry-actions">
        `;
        
        if (roundNumber) {
            html += `<span class="log-entry-round">Round ${roundNumber}</span>`;
        }
        
        html += `
                        <button class="btn-small" onclick="conversationLogger.saveConfigFromLog('${log.id}')">SAVE CONFIG</button>
                        <button class="btn-small" onclick="conversationLogger.deleteLog('${log.id}')">DELETE</button>
                    </div>
                </div>
        `;
        
        // Configuration section
        html += this.renderConfigSection(config);
        
        // Input/Output sections
        html += `
                <div class="log-io-section">
                    <div class="log-io-label">Input</div>
                    <div class="log-io-content">${this.escapeHtml(log.input || 'No input')}</div>
                </div>
                
                <div class="log-io-section">
                    <div class="log-io-label">Output</div>
                    <div class="log-io-content output">${this.escapeHtml(log.output || 'No output')}</div>
                </div>
            </div>
        `;
        
        return html;
    }

    // Render configuration section
    renderConfigSection(config) {
        const inputItems = config.inputItems || [];
        const modelConfig = config.modelConfig || {};
        const promptText = config.promptText || '';
        
        let html = `
            <div class="log-entry-config">
                <div class="log-config-header">
                    <span class="log-config-title">Configuration</span>
                </div>
        `;
        
        // Input items
        if (inputItems.length > 0) {
            html += `
                <div class="log-config-items">
            `;
            
            inputItems.forEach(item => {
                // Use 'name' instead of 'label' as that's the correct field
                let itemLabel = item.name || 'Unknown';
                
                // Add type indicator
                if (item.type === 'image') {
                    itemLabel += ' 🖼️';
                } else if (item.type === 'selection') {
                    itemLabel += ' ▼';
                } else if (item.type === 'input') {
                    itemLabel += ' ✏️';
                }
                
                // Add enabled/disabled indicator
                const statusIcon = item.enabled ? '' : ' ❌';
                
                html += `<span class="log-config-item">${this.escapeHtml(itemLabel + statusIcon)}</span>`;
            });
            
            html += `</div>`;
        }
        
        // Model info
        if (modelConfig.provider || modelConfig.model) {
            html += `
                <div class="log-config-model">
                    Model: ${this.escapeHtml(modelConfig.provider || 'Unknown')} / ${this.escapeHtml(modelConfig.model || 'Unknown')}
                </div>
            `;
        }
        
        // Prompt (truncated)
        if (promptText) {
            const truncatedPrompt = promptText.length > 100 ? 
                promptText.substring(0, 100) + '...' : promptText;
            
            html += `
                <div class="log-config-prompt ${promptText.length > 100 ? 'truncated' : ''}">
                    ${this.escapeHtml(truncatedPrompt)}
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }

    // Save configuration from log entry
    saveConfigFromLog(logId) {
        try {
            const logs = this.loadLogsFromStorage();
            const log = logs.find(l => l.id == logId);
            
            if (!log || !log.config) {
                alert('Log configuration not found');
                return;
            }
            
            // Use the configuration manager to save this config
            if (window.configManager) {
                // Generate configuration name based on timestamp
                const date = new Date();
                const configName = `FromLog_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
                
                // Create a configuration entry
                const configEntry = {
                    id: Date.now(),
                    name: configName,
                    config: log.config,
                    preview: this.generateConfigPreview(log.config),
                    timestamp: new Date().toISOString()
                };
                
                // Save using configuration manager's storage key
                const savedConfigs = window.configManager.getSavedConfigurations();
                
                // Check for duplicate content
                const isDuplicate = savedConfigs.some(saved => 
                    JSON.stringify(saved.config.inputItems) === JSON.stringify(log.config.inputItems) &&
                    saved.config.promptText === log.config.promptText &&
                    JSON.stringify(saved.config.modelConfig) === JSON.stringify(log.config.modelConfig)
                );
                
                if (isDuplicate) {
                    alert('This configuration is already saved / 此配置已经保存过了');
                    return;
                }
                
                // Add to beginning and save
                savedConfigs.unshift(configEntry);
                
                // Keep only the most recent items (same as ConfigurationManager)
                if (savedConfigs.length > 20) {
                    savedConfigs.splice(20);
                }
                
                localStorage.setItem('saved-configurations', JSON.stringify(savedConfigs));
                
                // Show success message using configManager's method
                if (window.configManager.showMessage) {
                    window.configManager.showMessage('Configuration saved from log / 从记录保存配置成功', 'success');
                } else {
                    alert('Configuration saved successfully!');
                }
            } else {
                alert('Configuration manager not available');
            }
            
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to save config from log:', error);
            alert('Failed to save configuration');
        }
    }

    // Generate configuration preview
    generateConfigPreview(config) {
        const items = config.inputItems || [];
        const model = config.modelConfig?.model || 'No model';
        const promptLength = (config.promptText || '').length;
        
        return {
            itemCount: items.length,
            modelName: model,
            promptLength: promptLength,
            hasImages: items.some(item => item.type === 'image' && item.imageData)
        };
    }

    // Delete single log
    deleteLog(logId) {
        if (confirm('Are you sure you want to delete this conversation log?')) {
            try {
                const logs = this.loadLogsFromStorage();
                const filteredLogs = logs.filter(log => log.id != logId);
                
                localStorage.setItem(this.storageKey, JSON.stringify(filteredLogs));
                
                // Update display
                this.updateLogDisplay();
                
            } catch (error) {
                console.error('[ConversationLogger] ❌ Failed to delete log:', error);
                alert('Failed to delete log');
            }
        }
    }

    // Clear all logs
    clearAllLogs() {
        if (confirm('Are you sure you want to clear all conversation logs? This action cannot be undone.')) {
            try {
                localStorage.removeItem(this.storageKey);
                this.updateLogDisplay();
                alert('All conversation logs have been cleared');
            } catch (error) {
                console.error('[ConversationLogger] ❌ Failed to clear logs:', error);
                alert('Failed to clear logs');
            }
        }
    }

    // Export logs to JSON file
    exportLogs() {
        try {
            const logs = this.loadLogsFromStorage();
            
            if (logs.length === 0) {
                alert('No logs to export');
                return;
            }
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                totalLogs: logs.length,
                logs: logs
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversation-logs-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('[ConversationLogger] ❌ Failed to export logs:', error);
            alert('Failed to export logs');
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for UI interactions
function toggleLogPanel() {
    if (window.conversationLogger) {
        window.conversationLogger.toggleLogPanel();
    }
}

function clearAllLogs() {
    if (window.conversationLogger) {
        window.conversationLogger.clearAllLogs();
    }
}

function exportLogs() {
    if (window.conversationLogger) {
        window.conversationLogger.exportLogs();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other modules are loaded
    setTimeout(() => {
        // Create global conversation logger instance
        window.conversationLogger = new ConversationLogger();
        
        // Hook into multi-round reset functionality
        if (typeof resetRounds === 'function') {
            const originalResetRounds = window.resetRounds;
            window.resetRounds = function() {
                originalResetRounds();
                window.conversationLogger.startNewSession();
            };
        }
        
        console.log('[ConversationLogger] 🚀 Logger initialized after DOM loaded');
    }, 100);
});

console.log('[ConversationLogger] 📁 Log management module loaded');
