// Configuration Management System
// 配置管理系统

class ConfigurationManager {
    constructor() {
        this.storageKey = 'saved-configurations';
        this.maxSavedConfigs = 20; // 最多保存20个配置
        this.setupEventListeners();
    }

    // Setup event listeners
    // 设置事件监听器
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const saveConfigBtn = document.getElementById('save-config-btn');
            const importConfigBtn = document.getElementById('import-config-btn');
            
            if (saveConfigBtn) {
                saveConfigBtn.addEventListener('click', () => {
                    this.saveCurrentConfiguration();
                });
            }
            
            if (importConfigBtn) {
                importConfigBtn.addEventListener('click', () => {
                    this.showImportModal();
                });
            }
        });
    }

    // Get current complete configuration
    // 获取当前完整配置
    getCurrentConfiguration() {
        // Get input items
        // 获取输入项
        let inputItems = [];
        if (window.FormInputs && typeof window.FormInputs.getInputItems === 'function') {
            inputItems = [...window.FormInputs.getInputItems()];
        } else if (window.inputItems) {
            inputItems = [...window.inputItems];
        }
        
        // Get model configuration (exclude API key for security)
        // 获取模型配置（排除API key以确保安全）
        const originalModelConfig = window.ModelConfiguration ? 
            window.ModelConfiguration.getCurrentConfig() : {};
        const modelConfig = { ...originalModelConfig };
        delete modelConfig.apiKey; // Remove API key from saved configuration
        
        // Get prompt text
        // 获取提示文本
        const promptTextarea = document.querySelector('.prompt-textarea');
        const promptText = promptTextarea ? promptTextarea.value : '';
        
        // Get output text (exclude input text as it will be saved separately)
        // 获取输出文本（排除输入文本，因为它会单独保存）
        const outputTextarea = document.querySelector('.output-section .main-textarea');
        const outputText = outputTextarea ? outputTextarea.value : '';
        
        return {
            inputItems,
            modelConfig,
            promptText,
            outputText, // Removed inputText
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Save current configuration
    // 保存当前配置
    saveCurrentConfiguration() {
        try {
            const currentConfig = this.getCurrentConfiguration();
            
            // Debug log to check input items
            // 调试日志检查输入项
            console.log('[ConfigManager] Saving configuration with input items:', currentConfig.inputItems);
            
            // Generate configuration name based on timestamp
            // 基于时间戳生成配置名称
            const date = new Date();
            const configName = `Config_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
            
            // Create configuration entry
            // 创建配置条目
            const configEntry = {
                id: Date.now(),
                name: configName,
                config: currentConfig,
                preview: this.generateConfigPreview(currentConfig),
                timestamp: new Date().toISOString()
            };
            
            // Get existing configurations
            // 获取现有配置
            const savedConfigs = this.getSavedConfigurations();
            
            // Check for duplicate content
            // 检查重复内容
            const isDuplicate = savedConfigs.some(saved => 
                this.compareConfigurations(saved.config, currentConfig)
            );
            
            if (isDuplicate) {
                this.showMessage('This configuration is already saved / 此配置已经保存过了', 'info');
                return;
            }
            
            // Add to beginning of array
            // 添加到数组开头
            savedConfigs.unshift(configEntry);
            
            // Keep only the most recent items
            // 只保留最新的条目
            if (savedConfigs.length > this.maxSavedConfigs) {
                savedConfigs.splice(this.maxSavedConfigs);
            }
            
            // Save to localStorage
            // 保存到localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
            
            this.showMessage(`Configuration saved successfully! / 配置保存成功！`, 'success');
            
        } catch (error) {
            console.error('Error saving configuration:', error);
            this.showMessage('Failed to save configuration / 保存配置失败', 'error');
        }
    }

    // Generate configuration preview
    // 生成配置预览
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

    // Compare two configurations for similarity
    // 比较两个配置的相似性
    compareConfigurations(config1, config2) {
        try {
            // Simple comparison - check if key properties are the same
            // 简单比较 - 检查关键属性是否相同
            // Note: inputText and apiKey are excluded from saved configurations
            // 注意：inputText和apiKey已从保存的配置中排除
            return (
                JSON.stringify(config1.inputItems) === JSON.stringify(config2.inputItems) &&
                config1.promptText === config2.promptText &&
                JSON.stringify(config1.modelConfig) === JSON.stringify(config2.modelConfig)
            );
        } catch (error) {
            return false;
        }
    }

    // Get saved configurations from localStorage
    // 从localStorage获取保存的配置
    getSavedConfigurations() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved configurations:', error);
            return [];
        }
    }

    // Show import modal
    // 显示导入弹窗
    showImportModal() {
        const savedConfigs = this.getSavedConfigurations();
        this.createImportModal(savedConfigs);
    }

    // Create and show import modal
    // 创建并显示导入弹窗
    createImportModal(savedConfigs) {
        // Remove existing modal if any
        // 移除现有弹窗
        const existingModal = document.getElementById('config-import-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        // 创建弹窗
        const modal = document.createElement('div');
        modal.id = 'config-import-modal';
        modal.className = 'modal';
        modal.style.display = 'block';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content import-modal-content';

        // Modal header
        // 弹窗头部
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3>IMPORT CONFIGURATION / 导入配置</h3>
            <button class="close-btn" onclick="document.getElementById('config-import-modal').remove()">×</button>
        `;

        // Modal body
        // 弹窗主体
        const body = document.createElement('div');
        body.className = 'modal-body import-modal-body';

        if (savedConfigs.length === 0) {
            // Show empty state message
            // 显示空状态消息
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state-message';
            emptyMessage.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                color: #666;
                font-style: italic;
            `;
            emptyMessage.textContent = 'No saved configurations yet / 暂无保存的配置';
            body.appendChild(emptyMessage);
        } else {
            // Create list of saved configurations
            // 创建保存配置的列表
            savedConfigs.forEach((configEntry) => {
                const configItem = document.createElement('div');
                configItem.className = 'saved-config-item';
                
                const date = new Date(configEntry.timestamp);
                const formattedDate = date.toLocaleString();
                const preview = configEntry.preview;
                
                configItem.innerHTML = `
                    <div class="saved-config-header">
                        <div class="saved-config-name">
                            <span class="config-name-display" id="name-display-${configEntry.id}">${configEntry.name}</span>
                            <input type="text" class="config-name-input" id="name-input-${configEntry.id}" value="${configEntry.name}" style="display: none;">
                        </div>
                        <div class="saved-config-date">${formattedDate}</div>
                    </div>
                    <div class="saved-config-preview">
                        <span class="preview-item">📝 ${preview.itemCount} items</span>
                        <span class="preview-item">🤖 ${preview.modelName}</span>
                        <span class="preview-item">📄 ${preview.promptLength} chars</span>
                        ${preview.hasImages ? '<span class="preview-item">🖼️ Images</span>' : ''}
                    </div>
                    <div class="saved-config-actions">
                        <button class="btn-small load-btn" onclick="window.configManager.loadConfiguration(${configEntry.id})">LOAD</button>
                        <button class="btn-small rename-btn" onclick="window.configManager.startRename(${configEntry.id})">RENAME</button>
                        <button class="btn-small delete-btn" onclick="window.configManager.deleteConfiguration(${configEntry.id})">DELETE</button>
                    </div>
                `;
                
                body.appendChild(configItem);
            });
        }

        // Modal footer
        // 弹窗底部
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-small" onclick="window.configManager.saveAsFile()">SAVE AS FILE</button>
            <button class="btn-small" onclick="window.configManager.importFromFile()">IMPORT FROM LOCAL</button>
            <button class="btn-small" onclick="window.configManager.clearAllConfigurations()">CLEAR ALL</button>
            <button class="btn-small" onclick="document.getElementById('config-import-modal').remove()">CLOSE</button>
        `;

        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        // Close modal when clicking outside
        // 点击外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Start rename mode for a configuration
    // 开始配置重命名模式
    startRename(configId) {
        const nameDisplay = document.getElementById(`name-display-${configId}`);
        const nameInput = document.getElementById(`name-input-${configId}`);
        
        if (nameDisplay && nameInput) {
            nameDisplay.style.display = 'none';
            nameInput.style.display = 'inline-block';
            nameInput.focus();
            nameInput.select();
            
            // Handle Enter key and blur events
            // 处理回车键和失焦事件
            const handleRename = () => {
                this.finishRename(configId, nameInput.value.trim());
            };
            
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.cancelRename(configId);
                }
            };
            
            nameInput.addEventListener('blur', handleRename, { once: true });
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRename();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.cancelRename(configId);
                }
            }, { once: true });
        }
    }

    // Finish renaming a configuration
    // 完成配置重命名
    finishRename(configId, newName) {
        if (!newName) {
            this.cancelRename(configId);
            return;
        }
        
        const savedConfigs = this.getSavedConfigurations();
        const configIndex = savedConfigs.findIndex(config => config.id === configId);
        
        if (configIndex !== -1) {
            savedConfigs[configIndex].name = newName;
            
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
                this.showMessage('Configuration renamed successfully / 配置重命名成功', 'success');
                
                // Refresh modal
                // 刷新弹窗
                this.showImportModal();
            } catch (error) {
                console.error('Error renaming configuration:', error);
                this.showMessage('Failed to rename configuration / 重命名配置失败', 'error');
                this.cancelRename(configId);
            }
        } else {
            this.cancelRename(configId);
        }
    }

    // Cancel renaming a configuration
    // 取消配置重命名
    cancelRename(configId) {
        const nameDisplay = document.getElementById(`name-display-${configId}`);
        const nameInput = document.getElementById(`name-input-${configId}`);
        
        if (nameDisplay && nameInput) {
            nameDisplay.style.display = 'inline-block';
            nameInput.style.display = 'none';
        }
    }

    // Save configurations as file
    // 将配置保存为文件
    saveAsFile() {
        const savedConfigs = this.getSavedConfigurations();
        
        const exportData = {
            type: 'configuration-data',
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: savedConfigs
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `configurations_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        
        this.showMessage('Configurations exported successfully / 配置导出成功', 'success');
    }

    // Import configurations from file
    // 从文件导入配置
    importFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate file type
                    // 验证文件类型
                    if (importData.type !== 'configuration-data') {
                        if (importData.type === 'input-data') {
                            this.showMessage('Error: This is an input file, not a configuration file / 错误：这是输入文件，不是配置文件', 'error');
                        } else {
                            this.showMessage('Error: Invalid file format / 错误：无效的文件格式', 'error');
                        }
                        return;
                    }
                    
                    if (!Array.isArray(importData.data)) {
                        this.showMessage('Error: Invalid data format / 错误：无效的数据格式', 'error');
                        return;
                    }
                    
                    // Merge with existing data
                    // 与现有数据合并
                    const existingConfigs = this.getSavedConfigurations();
                    const mergedConfigs = [...importData.data, ...existingConfigs];
                    
                    // Remove duplicates based on configuration content
                    // 基于配置内容去除重复项
                    const uniqueConfigs = [];
                    const seenConfigs = new Set();
                    
                    for (const config of mergedConfigs) {
                        // Create config key for duplicate detection (excludes inputText and apiKey)
                        // 创建配置键值用于重复检测（排除inputText和apiKey）
                        const configKey = JSON.stringify({
                            inputItems: config.config.inputItems,
                            promptText: config.config.promptText,
                            modelConfig: config.config.modelConfig
                        });
                        
                        if (!seenConfigs.has(configKey)) {
                            seenConfigs.add(configKey);
                            uniqueConfigs.push(config);
                        }
                    }
                    
                    // Keep only the most recent items
                    // 只保留最新的条目
                    const finalConfigs = uniqueConfigs.slice(0, this.maxSavedConfigs);
                    
                    // Save to localStorage
                    // 保存到localStorage
                    localStorage.setItem(this.storageKey, JSON.stringify(finalConfigs));
                    
                    this.showMessage(`Imported ${importData.data.length} configurations successfully / 成功导入${importData.data.length}个配置`, 'success');
                    
                    // Refresh modal
                    // 刷新弹窗
                    this.showImportModal();
                    
                } catch (error) {
                    console.error('Error importing configurations:', error);
                    this.showMessage('Error: Failed to parse file / 错误：解析文件失败', 'error');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    // Load specific configuration
    // 加载特定配置
    async loadConfiguration(configId) {
        try {
            const savedConfigs = this.getSavedConfigurations();
            const configEntry = savedConfigs.find(item => item.id === configId);
            
            if (!configEntry) {
                this.showMessage('Configuration not found / 配置未找到', 'error');
                return;
            }
            
            const config = configEntry.config;
            
            // Load input items
            // 加载输入项
            if (config.inputItems) {
                if (window.FormInputs && typeof window.FormInputs.setInputItems === 'function') {
                    // Use the FormInputs API to properly set input items
                    // 使用FormInputs API来正确设置输入项
                    window.FormInputs.setInputItems(config.inputItems);
                } else {
                    // Fallback method
                    // 后备方法
                    window.inputItems = [...config.inputItems];
                    if (typeof saveToStorage === 'function') {
                        saveToStorage();
                    }
                    if (typeof renderInputItems === 'function') {
                        renderInputItems();
                    }
                    if (typeof updatePromptButtons === 'function') {
                        updatePromptButtons();
                    }
                    if (typeof updateImgCount === 'function') {
                        updateImgCount();
                    }
                }
            }
            
            // Load model configuration
            // 加载模型配置
            if (config.modelConfig && window.ModelConfiguration) {
                // Update currentConfig in model-configuration.js
                // 更新model-configuration.js中的currentConfig
                Object.assign(window.ModelConfiguration.getCurrentConfig(), config.modelConfig);
                
                // Save the updated configuration to localStorage
                // 将更新的配置保存到localStorage
                if (typeof window.ModelConfiguration.saveConfig === 'function') {
                    window.ModelConfiguration.saveConfig();
                }
                
                // Update UI
                // 更新UI
                this.updateModelConfigurationUI(config.modelConfig);
            }
            
            // Load prompt text
            // 加载提示文本
            if (config.promptText !== undefined) {
                const promptTextarea = document.querySelector('.prompt-textarea');
                if (promptTextarea) {
                    promptTextarea.value = config.promptText;
                    localStorage.setItem('promptText', config.promptText);
                    
                    // Update originalPromptText in prompt-textarea.js to ensure consistency
                    // 更新prompt-textarea.js中的originalPromptText以确保一致性
                    if (typeof window.originalPromptText !== 'undefined') {
                        window.originalPromptText = config.promptText;
                    }
                }
                
                // Update prompt word count
                // 更新提示文字数统计
                if (typeof updatePromptWordCount === 'function') {
                    updatePromptWordCount();
                }
            }
            
            // Load output text only (inputText is handled separately by input management)
            // 只加载输出文本（inputText由输入管理单独处理）
            if (config.outputText !== undefined) {
                const outputTextarea = document.querySelector('.output-section .main-textarea');
                if (outputTextarea) {
                    outputTextarea.value = config.outputText;
                    localStorage.setItem('outputText', config.outputText);
                    if (typeof updateWordCount === 'function') {
                        updateWordCount('output-count', config.outputText);
                    }
                }
            }
            
            this.showMessage('Configuration loaded successfully / 配置加载成功', 'success');
            
            // Close modal
            // 关闭弹窗
            const modal = document.getElementById('config-import-modal');
            if (modal) {
                modal.remove();
            }
            
        } catch (error) {
            console.error('Error loading configuration:', error);
            this.showMessage('Failed to load configuration / 加载配置失败', 'error');
        }
    }

    // Update model configuration UI
    // 更新模型配置UI
    updateModelConfigurationUI(modelConfig) {
        try {
            // Update Provider selector
            // 更新提供商选择器
            const providerSelect = document.querySelector('.config-grid .config-item:nth-child(1) .config-select');
            if (providerSelect && modelConfig.provider) {
                providerSelect.value = modelConfig.provider;
                
                // Trigger change event to update model selector
                // 触发change事件来更新模型选择器
                const changeEvent = new Event('change', { bubbles: true });
                providerSelect.dispatchEvent(changeEvent);
                
                // Wait a moment for the model selector to be populated
                // 等待模型选择器被填充
                setTimeout(() => {
                    const modelSelect = document.querySelector('.config-grid .config-item:nth-child(2) .config-select');
                    if (modelSelect && modelConfig.model) {
                        modelSelect.value = modelConfig.model;
                        
                        // Trigger change event
                        // 触发change事件
                        const modelChangeEvent = new Event('change', { bubbles: true });
                        modelSelect.dispatchEvent(modelChangeEvent);
                    }
                }, 100);
            }
            
            // Update other fields (skip API key for security)
            // 更新其他字段（跳过API key以确保安全）
            const apiUrlInput = document.getElementById('api-url');
            const maxTokensInput = document.querySelector('.config-grid .config-item:nth-child(5) .config-input');
            const temperatureInput = document.querySelector('.config-grid .config-item:nth-child(6) .config-input');
            
            if (apiUrlInput && modelConfig.apiUrl !== undefined) {
                apiUrlInput.value = modelConfig.apiUrl;
            }
            // Skip API key update for security reasons
            // 出于安全考虑跳过API key更新
            if (maxTokensInput && modelConfig.maxTokens !== undefined) {
                maxTokensInput.value = modelConfig.maxTokens;
            }
            if (temperatureInput && modelConfig.temperature !== undefined) {
                temperatureInput.value = modelConfig.temperature;
            }
            
        } catch (error) {
            console.error('Error updating model configuration UI:', error);
        }
    }

    // Delete specific configuration
    // 删除特定配置
    deleteConfiguration(configId) {
        const savedConfigs = this.getSavedConfigurations();
        const filteredConfigs = savedConfigs.filter(config => config.id !== configId);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(filteredConfigs));
            this.showMessage('Configuration deleted / 配置已删除', 'success');
            
            // Check if there are any configurations left
            // 检查是否还有剩余的配置
            if (filteredConfigs.length === 0) {
                // Close modal if no configurations left
                // 如果没有剩余配置，关闭弹窗
                const modal = document.getElementById('config-import-modal');
                if (modal) {
                    modal.remove();
                }
                this.showMessage('All configurations deleted / 所有配置已删除', 'info');
            } else {
                // Refresh modal with remaining configurations
                // 用剩余配置刷新弹窗
                this.showImportModal();
            }
        } catch (error) {
            console.error('Error deleting configuration:', error);
            this.showMessage('Failed to delete configuration / 删除配置失败', 'error');
        }
    }

    // Clear all configurations
    // 清除所有配置
    clearAllConfigurations() {
        const savedConfigs = this.getSavedConfigurations();
        if (savedConfigs.length === 0) {
            this.showMessage('No configurations to clear / 没有配置需要清除', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to delete all saved configurations? / 确定要删除所有保存的配置吗？')) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify([]));
                this.showMessage('All configurations cleared / 所有配置已清除', 'success');
                
                // Refresh modal to show empty state
                // 刷新弹窗显示空状态
                this.showImportModal();
            } catch (error) {
                console.error('Error clearing configurations:', error);
                this.showMessage('Failed to clear configurations / 清除配置失败', 'error');
            }
        }
    }

    // Show message
    // 显示消息
    showMessage(message, type = 'info') {
        // Create or update message element
        // 创建或更新消息元素
        let messageElement = document.getElementById('config-manager-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'config-manager-message';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
                z-index: 1001;
                max-width: 300px;
                word-wrap: break-word;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(messageElement);
        }

        messageElement.textContent = message;
        
        // Set colors based on type
        // 根据类型设置颜色
        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#27ae60';
                messageElement.style.color = 'white';
                break;
            case 'error':
                messageElement.style.backgroundColor = '#e74c3c';
                messageElement.style.color = 'white';
                break;
            case 'warning':
                messageElement.style.backgroundColor = '#f39c12';
                messageElement.style.color = 'white';
                break;
            default:
                messageElement.style.backgroundColor = '#3498db';
                messageElement.style.color = 'white';
        }

        messageElement.style.display = 'block';

        // Auto-hide after 3 seconds
        // 3秒后自动隐藏
        setTimeout(() => {
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }, 3000);
    }
}

// Initialize configuration manager
// 初始化配置管理器
const configManager = new ConfigurationManager();

// Make it globally accessible
// 使其全局可访问
window.configManager = configManager;

// Export for use by other modules
// 导出供其他模块使用
window.ConfigurationManager = ConfigurationManager;
