// Input Management Functionality
// 输入内容管理功能

class InputManager {
    constructor() {
        this.storageKey = 'saved-inputs';
        this.inputTextarea = null;
        this.maxSavedItems = 20; // 最多保存20个条目
        this.setupEventListeners();
    }

    // Setup event listeners
    // 设置事件监听器
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.inputTextarea = document.querySelector('.input-section .main-textarea');
            
            const saveBtn = document.getElementById('save-input-btn');
            const importBtn = document.getElementById('import-input-btn');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveInput();
                });
            }
            
            if (importBtn) {
                importBtn.addEventListener('click', () => {
                    this.showImportModal();
                });
            }
        });
    }

    // Save current input to localStorage
    // 保存当前输入到localStorage
    saveInput() {
        if (!this.inputTextarea) {
            this.showMessage('Input textarea not found / 未找到输入文本框', 'error');
            return;
        }

        const content = this.inputTextarea.value.trim();
        if (!content) {
            this.showMessage('Please enter some text before saving / 保存前请输入一些文本', 'warning');
            return;
        }

        const savedInputs = this.getSavedInputs();
        
        // Create new input entry
        // 创建新的输入条目
        const newInput = {
            id: Date.now(),
            content: content,
            timestamp: new Date().toISOString(),
            preview: content.length > 50 ? content.substring(0, 50) + '...' : content
        };

        // Check if content already exists
        // 检查内容是否已存在
        const exists = savedInputs.some(input => input.content === content);
        if (exists) {
            this.showMessage('This content is already saved / 此内容已经保存过了', 'info');
            return;
        }

        // Add to beginning of array
        // 添加到数组开头
        savedInputs.unshift(newInput);

        // Keep only the most recent items
        // 只保留最新的条目
        if (savedInputs.length > this.maxSavedItems) {
            savedInputs.splice(this.maxSavedItems);
        }

        // Save to localStorage
        // 保存到localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(savedInputs));
            this.showMessage(`Input saved successfully! / 输入保存成功！`, 'success');
        } catch (error) {
            console.error('Error saving input:', error);
            this.showMessage('Failed to save input / 保存输入失败', 'error');
        }
    }

    // Get saved inputs from localStorage
    // 从localStorage获取保存的输入
    getSavedInputs() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved inputs:', error);
            return [];
        }
    }

    // Show import modal
    // 显示导入弹窗
    showImportModal() {
        const savedInputs = this.getSavedInputs();
        this.createImportModal(savedInputs);
    }

    // Create and show import modal
    // 创建并显示导入弹窗
    createImportModal(savedInputs) {
        // Remove existing modal if any
        // 移除现有弹窗
        const existingModal = document.getElementById('import-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        // 创建弹窗
        const modal = document.createElement('div');
        modal.id = 'import-modal';
        modal.className = 'modal';
        modal.style.display = 'block';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content import-modal-content';

        // Modal header
        // 弹窗头部
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3>IMPORT SAVED INPUT / 导入保存的输入</h3>
            <button class="close-btn" onclick="document.getElementById('import-modal').remove()">×</button>
        `;

        // Modal body
        // 弹窗主体
        const body = document.createElement('div');
        body.className = 'modal-body import-modal-body';

        if (savedInputs.length === 0) {
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
            emptyMessage.textContent = 'No saved inputs yet / 暂无保存的输入';
            body.appendChild(emptyMessage);
        } else {
            // Create list of saved inputs
            // 创建保存输入的列表
            savedInputs.forEach((input, index) => {
                const inputItem = document.createElement('div');
                inputItem.className = 'saved-input-item';
                
                const date = new Date(input.timestamp);
                const formattedDate = date.toLocaleString();
                
                inputItem.innerHTML = `
                    <div class="saved-input-preview">${input.preview}</div>
                    <div class="saved-input-meta">
                        <span class="saved-input-date">${formattedDate}</span>
                        <div class="saved-input-actions">
                            <button class="btn-small load-btn" onclick="window.inputManager.loadInput(${input.id})">LOAD</button>
                            <button class="btn-small delete-btn" onclick="window.inputManager.deleteSavedInput(${input.id})">DELETE</button>
                        </div>
                    </div>
                `;
                
                body.appendChild(inputItem);
            });
        }

        // Modal footer
        // 弹窗底部
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-small" onclick="window.inputManager.saveAsFile()">SAVE AS FILE</button>
            <button class="btn-small" onclick="window.inputManager.importFromFile()">IMPORT FROM LOCAL</button>
            <button class="btn-small" onclick="window.inputManager.clearAllInputs()">CLEAR ALL</button>
            <button class="btn-small" onclick="document.getElementById('import-modal').remove()">CLOSE</button>
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

    // Load specific input
    // 加载特定输入
    loadInput(inputId) {
        const savedInputs = this.getSavedInputs();
        const input = savedInputs.find(item => item.id === inputId);
        
        if (input && this.inputTextarea) {
            this.inputTextarea.value = input.content;
            
            // Trigger input event to update word count
            // 触发输入事件以更新字数统计
            const inputEvent = new Event('input', { bubbles: true });
            this.inputTextarea.dispatchEvent(inputEvent);
            
            this.showMessage('Input loaded successfully / 输入加载成功', 'success');
            
            // Close modal
            // 关闭弹窗
            const modal = document.getElementById('import-modal');
            if (modal) {
                modal.remove();
            }
        } else {
            this.showMessage('Failed to load input / 加载输入失败', 'error');
        }
    }

    // Delete specific saved input
    // 删除特定保存的输入
    deleteSavedInput(inputId) {
        const savedInputs = this.getSavedInputs();
        const filteredInputs = savedInputs.filter(input => input.id !== inputId);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(filteredInputs));
            this.showMessage('Input deleted / 输入已删除', 'success');
            
            // Check if there are any inputs left
            // 检查是否还有剩余的输入
            if (filteredInputs.length === 0) {
                // Close modal if no inputs left
                // 如果没有剩余输入，关闭弹窗
                const modal = document.getElementById('import-modal');
                if (modal) {
                    modal.remove();
                }
                this.showMessage('All inputs deleted / 所有输入已删除', 'info');
            } else {
                // Refresh modal with remaining inputs
                // 用剩余输入刷新弹窗
                this.showImportModal();
            }
        } catch (error) {
            console.error('Error deleting input:', error);
            this.showMessage('Failed to delete input / 删除输入失败', 'error');
        }
    }

    // Clear all saved inputs
    // 清除所有保存的输入
    clearAllInputs() {
        const savedInputs = this.getSavedInputs();
        if (savedInputs.length === 0) {
            this.showMessage('No inputs to clear / 没有输入需要清除', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to delete all saved inputs? / 确定要删除所有保存的输入吗？')) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify([]));
                this.showMessage('All inputs cleared / 所有输入已清除', 'success');
                
                // Refresh modal to show empty state
                // 刷新弹窗显示空状态
                this.showImportModal();
            } catch (error) {
                console.error('Error clearing inputs:', error);
                this.showMessage('Failed to clear inputs / 清除输入失败', 'error');
            }
        }
    }

    // Save inputs as file
    // 将输入保存为文件
    saveAsFile() {
        const savedInputs = this.getSavedInputs();
        
        const exportData = {
            type: 'input-data',
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: savedInputs
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `inputs_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        
        this.showMessage('Inputs exported successfully / 输入导出成功', 'success');
    }

    // Import inputs from file
    // 从文件导入输入
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
                    if (importData.type !== 'input-data') {
                        if (importData.type === 'configuration-data') {
                            this.showMessage('Error: This is a configuration file, not an input file / 错误：这是配置文件，不是输入文件', 'error');
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
                    const existingInputs = this.getSavedInputs();
                    const mergedInputs = [...importData.data, ...existingInputs];
                    
                    // Remove duplicates based on content
                    // 基于内容去除重复项
                    const uniqueInputs = [];
                    const seenContents = new Set();
                    
                    for (const input of mergedInputs) {
                        if (!seenContents.has(input.content)) {
                            seenContents.add(input.content);
                            uniqueInputs.push(input);
                        }
                    }
                    
                    // Keep only the most recent items
                    // 只保留最新的条目
                    const finalInputs = uniqueInputs.slice(0, this.maxSavedItems);
                    
                    // Save to localStorage
                    // 保存到localStorage
                    localStorage.setItem(this.storageKey, JSON.stringify(finalInputs));
                    
                    this.showMessage(`Imported ${importData.data.length} inputs successfully / 成功导入${importData.data.length}个输入`, 'success');
                    
                    // Refresh modal
                    // 刷新弹窗
                    this.showImportModal();
                    
                } catch (error) {
                    console.error('Error importing inputs:', error);
                    this.showMessage('Error: Failed to parse file / 错误：解析文件失败', 'error');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    // Show message
    // 显示消息
    showMessage(message, type = 'info') {
        // Create or update message element
        // 创建或更新消息元素
        let messageElement = document.getElementById('input-manager-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'input-manager-message';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
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

// Initialize input manager
// 初始化输入管理器
const inputManager = new InputManager();

// Make it globally accessible
// 使其全局可访问
window.inputManager = inputManager;
