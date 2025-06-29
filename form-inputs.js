// Global variables
let inputItems = [];
let currentEditingIndex = -1;
let currentModalType = '';
let deleteConfirmState = false;
let updatePromptButtonsTimeout = null; // Add debounce timeout variable

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    renderInputItems();
    updatePromptButtons();
    setupWordCounts();
    setupModalClose();
    updateImgCount(); // Initialize IMG count display
    
    // Make sure inputItems is available globally after loading
    // 确保加载后inputItems全局可用
    window.inputItems = inputItems;
});

// Load data from localStorage
function loadFromStorage() {
    const stored = localStorage.getItem('inputItems');
    if (stored) {
        inputItems = JSON.parse(stored);
    } else {
        // Set default input items
        inputItems = [
            {
                name: 'place',
                type: 'selection',
                state: 'Home',
                present: 'I am at {{selection}}',
                options: ['Home', 'Office', 'Park'],
                enabled: true
            },
            {
                name: 'time',
                type: 'input',
                state: '18:00',
                present: 'Now, it\'s {{input}}',
                enabled: true
            }
        ];
        saveToStorage();
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('inputItems', JSON.stringify(inputItems));
}

// Render input items in the form
function renderInputItems() {
    const container = document.getElementById('form-inputs');
    container.innerHTML = '';
    
    inputItems.forEach((item, index) => {
        const inputItemDiv = document.createElement('div');
        inputItemDiv.className = 'input-item';
        
        let inputElement = '';
        let currentPresent = '';
        
        if (!item.enabled) {
            // When disabled, show disabled state
            switch (item.type) {
                case 'selection':
                    inputElement = `
                        <select class="select-input" disabled>
                            <option selected>None</option>
                        </select>
                    `;
                    currentPresent = '';
                    break;
                case 'input':
                    inputElement = `
                        <input type="text" class="text-input" disabled value="" placeholder="Input">
                    `;
                    currentPresent = '';
                    break;
                case 'image':
                    inputElement = `
                        <div style="position: relative;">
                            <input type="file" class="file-input" accept="image/*" disabled>
                            <div class="file-input-overlay">
                                Upload
                            </div>
                        </div>
                        <div class="image-info">
                            <span class="image-status">No image</span>
                            <span class="compression-info">Compression: ${item.compressionRatio || 50}%</span>
                        </div>
                    `;
                    currentPresent = '';
                    break;
            }
        } else {
            // When enabled, show normal state
            switch (item.type) {
                case 'selection':
                    const options = item.options || [];
                    inputElement = `
                        <select class="select-input" onchange="updateSelectionState(${index}, this.value)">
                            ${options.map(option => 
                                `<option value="${option}" ${option === item.state ? 'selected' : ''}>${option}</option>`
                            ).join('')}
                        </select>
                    `;
                    currentPresent = item.present.replace('{{selection}}', item.state || '');
                    break;
                case 'input':
                    inputElement = `
                        <input type="text" class="text-input" placeholder="Input" 
                               value="${item.state}" 
                               onchange="updateInputState(${index}, this.value)">
                    `;
                    currentPresent = item.present.replace('{{input}}', item.state || '');
                    break;
                case 'image':
                    const overlayContent = item.imageData ? 
                        `<img src="${item.imageData}" class="mini-image" alt="Preview">` : 
                        'Upload';
                    const overlayClass = item.imageData ? 'file-input-overlay has-image' : 'file-input-overlay';
                    
                    inputElement = `
                        <div style="position: relative;">
                            <input type="file" class="file-input" accept="image/*" 
                                   onchange="updateImageState(${index}, this)">
                            <div class="${overlayClass}">
                                ${overlayContent}
                            </div>
                        </div>
                        <div class="image-info">
                            ${item.imageData ? `<span class="image-status">✓ Image loaded</span>` : '<span class="image-status">No image</span>'}
                            <span class="compression-info">Compression: ${item.compressionRatio || 50}%</span>
                        </div>
                    `;
                    currentPresent = ''; // Remove redundant present text
                    break;
            }
        }
        
        inputItemDiv.innerHTML = `
            <div class="input-item-header">
                <label class="input-item-label" onclick="openEditModal(${index})">${item.name}:</label>
                <label class="toggle-switch">
                    <input type="checkbox" ${item.enabled ? 'checked' : ''} 
                           onchange="toggleItemEnabled(${index}, this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            ${inputElement}
            <div class="present-text">${currentPresent}</div>
        `;
        
        container.appendChild(inputItemDiv);
    });
    
    // Update prompt word count when input items change
    if (typeof updatePromptWordCount === 'function') {
        updatePromptWordCount();
    }
    
    // Update IMG count
    updateImgCount();
}

// Update prompt buttons based on current input items (with debounce)
function updatePromptButtons() {
    // Clear any existing timeout to prevent multiple rapid calls
    if (updatePromptButtonsTimeout) {
        clearTimeout(updatePromptButtonsTimeout);
    }
    
    // Use setTimeout to debounce the function call
    updatePromptButtonsTimeout = setTimeout(() => {
        const container = document.getElementById('prompt-buttons-header');
        
        // Add defensive check to ensure container exists
        if (!container) {
            console.warn('prompt-buttons-header container not found');
            return;
        }
        
        // Clear existing buttons before adding new ones to prevent duplication
        // 在添加新按钮前清除现有按钮以防止重复
        container.innerHTML = '';
        
        // Only add buttons for non-image input items
        // 只为非图片类型的输入项添加按钮
        inputItems.forEach(item => {
            if (item.type !== 'image') {
                const button = document.createElement('button');
                button.className = 'btn-small';
                button.onclick = () => insertPromptVariable(item.name);
                button.innerHTML = `+ <span class="variable-name">${item.name}</span>`;
                container.appendChild(button);
            }
        });
        
        updatePromptButtonsTimeout = null; // Reset timeout
    }, 10); // 10ms debounce delay
}

// Update state functions
function toggleItemEnabled(index, enabled) {
    inputItems[index].enabled = enabled;
    window.inputItems = inputItems; // Keep global reference updated
    saveToStorage();
    renderInputItems();
}

function updateSelectionState(index, value) {
    inputItems[index].state = value;
    window.inputItems = inputItems; // Keep global reference updated
    saveToStorage();
    renderInputItems();
}

function updateInputState(index, value) {
    inputItems[index].state = value;
    window.inputItems = inputItems; // Keep global reference updated
    saveToStorage();
    renderInputItems();
}

// Update image state with compression
function updateImageState(index, fileInput) {
    const file = fileInput.files[0];
    if (!file) {
        inputItems[index].imageData = null;
        window.inputItems = inputItems; // Keep global reference updated
        saveToStorage();
        renderInputItems();
        return;
    }
    
    const compressionRatio = inputItems[index].compressionRatio || 50;
    
    // Create canvas for image compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Calculate new dimensions based on compression ratio
        const scale = compressionRatio / 100;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw compressed image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Store compressed image data
        inputItems[index].imageData = compressedDataUrl;
        inputItems[index].fileName = file.name;
        window.inputItems = inputItems; // Keep global reference updated
        saveToStorage();
        renderInputItems();
        updateImgCount();
    };
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Modal functions
function openAddModal(type) {
    currentEditingIndex = -1;
    currentModalType = type;
    deleteConfirmState = false;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('delete-btn');
    
    title.textContent = `ADD ${type.toUpperCase()}`;
    deleteBtn.style.display = 'none';
    
    renderModalContent(type);
    modal.style.display = 'block';
}

function openEditModal(index) {
    currentEditingIndex = index;
    const item = inputItems[index];
    currentModalType = item.type;
    deleteConfirmState = false;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('delete-btn');
    
    title.textContent = `EDIT ${item.type.toUpperCase()}`;
    deleteBtn.style.display = 'block';
    deleteBtn.textContent = 'DELETE';
    deleteBtn.className = 'btn-delete';
    
    renderModalContent(item.type, item);
    modal.style.display = 'block';
}

function renderModalContent(type, existingItem = null) {
    const modalBody = document.getElementById('modal-body');
    let content = '';
    
    switch (type) {
        case 'selection':
            const options = existingItem ? existingItem.options || [] : [];
            content = `
                <div class="modal-form-group">
                    <label>NAME:</label>
                    <input type="text" class="modal-input" id="modal-name" 
                           value="${existingItem ? existingItem.name : 'input'}" placeholder="input">
                </div>
                <div class="modal-form-group">
                    <label>PRESENT:</label>
                    <button type="button" class="btn-add" onclick="insertModalVariable('modal-present', 'Selection')">+ Selection</button>
                </div>
                <div class="modal-form-group">
                    <input type="text" class="modal-input" id="modal-present" 
                           value="${existingItem ? existingItem.present : 'Input'}" placeholder="Input">
                </div>
                <div id="selection-options">
                    <div class="modal-form-group">
                        <label>NONE (Default):</label>
                        <input type="text" class="modal-input" value="None" disabled>
                        <span class="none-info">Cannot be deleted</span>
                    </div>
                    ${options.length > 0 ? options.map((option, index) => `
                        <div class="modal-form-group">
                            <label>OPTION ${index + 1}:</label>
                            <input type="text" class="modal-input selection-option" 
                                   value="${option}" placeholder="Input">
                            <button type="button" class="btn-add" onclick="removeSelection(this)">-</button>
                        </div>
                    `).join('') : `
                        <div class="modal-form-group">
                            <label>OPTION 1:</label>
                            <input type="text" class="modal-input selection-option" 
                                   value="Input" placeholder="Input">
                        </div>
                    `}
                </div>
                <div class="modal-present-buttons">
                    <button type="button" class="btn-add" onclick="addSelection()">+</button>
                </div>
            `;
            break;
            
        case 'input':
            content = `
                <div class="modal-form-group">
                    <label>NAME:</label>
                    <input type="text" class="modal-input" id="modal-name" 
                           value="${existingItem ? existingItem.name : 'input'}" placeholder="input">
                </div>
                <div class="modal-form-group">
                    <label>PRESENT:</label>
                    <button type="button" class="btn-add" onclick="insertModalVariable('modal-present', 'Input')">+ Input</button>
                </div>
                <div class="modal-form-group">
                    <input type="text" class="modal-input" id="modal-present" 
                           value="${existingItem ? existingItem.present : 'Input'}" placeholder="Input">
                </div>
            `;
            break;
            
        case 'image':
            content = `
                <div class="modal-form-group">
                    <label>NAME:</label>
                    <input type="text" class="modal-input" id="modal-name" 
                           value="${existingItem ? existingItem.name : 'image'}" placeholder="image">
                </div>
                <div class="modal-form-group">
                    <label>COMPRESSION RATIO (%):</label>
                    <input type="number" class="modal-input" id="modal-compression" 
                           value="${existingItem ? existingItem.compressionRatio || 50 : 50}" 
                           placeholder="50" min="10" max="100">
                </div>
            `;
            break;
    }
    
    modalBody.innerHTML = content;
}

function addSelection() {
    const container = document.getElementById('selection-options');
    // Count only the selection options (exclude the None option which is always first)
    const selectionOptions = container.querySelectorAll('.selection-option');
    const count = selectionOptions.length + 1;
    const div = document.createElement('div');
    div.className = 'modal-form-group';
    div.innerHTML = `
        <label>SELECTION ${count}:</label>
        <input type="text" class="modal-input selection-option" value="Input" placeholder="Input">
        <button type="button" class="btn-add" onclick="removeSelection(this)">-</button>
    `;
    container.appendChild(div);
}

function removeSelection(button) {
    button.parentElement.remove();
    // Renumber remaining selections (skip the first child which is the None option)
    const container = document.getElementById('selection-options');
    const selectionGroups = Array.from(container.children).slice(1); // Skip None option
    selectionGroups.forEach((option, index) => {
        const label = option.querySelector('label');
        if (label) {
            label.textContent = `SELECTION ${index + 1}:`;
        }
    });
}

function addInput() {
    // This function can be extended if needed
    console.log('Add input functionality');
}

function insertModalVariable(inputId, variableType) {
    const input = document.getElementById(inputId);
    const cursorPos = input.selectionStart;
    const textBefore = input.value.substring(0, cursorPos);
    const textAfter = input.value.substring(cursorPos);
    
    let variable = '';
    switch (variableType) {
        case 'Input':
            variable = '{{input}}';
            break;
        case 'Selection':
            variable = '{{selection}}';
            break;
        default:
            variable = `{{${variableType}}}`;
    }
    
    input.value = textBefore + variable + textAfter;
    input.focus();
    input.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
}

function saveInputItem() {
    const name = document.getElementById('modal-name').value.trim();
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    let newItem = { name, type: currentModalType, enabled: true };
    
    switch (currentModalType) {
        case 'selection':
            const options = Array.from(document.querySelectorAll('.selection-option')).map(input => input.value).filter(val => val.trim() !== '');
            const present = document.getElementById('modal-present').value;
            newItem.state = options.length > 0 ? options[0] : '';
            newItem.present = present;
            newItem.options = options;
            break;
            
        case 'input':
            const inputPresent = document.getElementById('modal-present').value;
            newItem.state = '';
            newItem.present = inputPresent;
            break;
            
        case 'image':
            const compressionRatio = parseInt(document.getElementById('modal-compression').value) || 50;
            newItem.compressionRatio = Math.max(10, Math.min(100, compressionRatio)); // Clamp between 10-100
            newItem.imageData = null;
            newItem.fileName = '';
            break;
    }
    
    if (currentEditingIndex >= 0) {
        // Preserve enabled state when editing
        newItem.enabled = inputItems[currentEditingIndex].enabled;
        inputItems[currentEditingIndex] = newItem;
    } else {
        inputItems.push(newItem);
    }
    
    window.inputItems = inputItems; // Keep global reference updated
    saveToStorage();
    renderInputItems();
    updatePromptButtons();
    updateImgCount();
    closeModal();
}

// Update the old function name to new one
function saveInputGroup() {
    saveInputItem();
}

function deleteInputItem() {
    if (currentEditingIndex >= 0) {
        if (!deleteConfirmState) {
            // First click - show confirm state
            deleteConfirmState = true;
            const deleteBtn = document.getElementById('delete-btn');
            deleteBtn.textContent = 'CONFIRM';
            deleteBtn.className = 'btn-delete-confirm';
        } else {
            // Second click - actually delete
            inputItems.splice(currentEditingIndex, 1);
            window.inputItems = inputItems; // Keep global reference updated
            saveToStorage();
            renderInputItems();
            updatePromptButtons();
            updateImgCount();
            closeModal();
        }
    }
}

// Update the old function name to new one
function deleteInputGroup() {
    deleteInputItem();
}

function closeModal() {
    deleteConfirmState = false;
    document.getElementById('modal').style.display = 'none';
}

function setupModalClose() {
    const modal = document.getElementById('modal');
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

// Prompt variable insertion
function insertPromptVariable(variableName) {
    // Check if we're in unfold mode and prevent insertion
    if (typeof isFoldMode !== 'undefined' && !isFoldMode) {
        return; // Do nothing in unfold mode
    }
    
    const textarea = document.querySelector('.prompt-textarea');
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    let variable = '';
    // Note: input_box is no longer supported in separated mode
    // Only insert variables for dynamic input items
    const item = inputItems.find(i => i.name === variableName);
    if (item) {
        variable = `{{${variableName}}}`;
    }
    
    if (variable) {
        textarea.value = textBefore + variable + textAfter;
        textarea.focus();
        textarea.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
        
        // Use the new expanded word count function
        if (typeof updatePromptWordCount === 'function') {
            updatePromptWordCount();
        } else {
            updateWordCount('prompt-count', textarea.value);
        }
    }
}

// Word count functionality
function setupWordCounts() {
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    
    // Load saved content from localStorage
    const savedInputText = localStorage.getItem('inputText');
    const savedOutputText = localStorage.getItem('outputText');
    
    if (savedInputText) {
        inputTextarea.value = savedInputText;
        updateWordCount('input-count', savedInputText);
    }
    
    if (savedOutputText) {
        outputTextarea.value = savedOutputText;
        updateWordCount('output-count', savedOutputText);
    }
    
    inputTextarea.addEventListener('input', function() {
        updateWordCount('input-count', this.value);
        // Save to localStorage
        localStorage.setItem('inputText', this.value);
        // Update prompt word count when input changes (for {{input_box}})
        if (typeof updatePromptWordCount === 'function') {
            updatePromptWordCount();
        }
    });
    
    outputTextarea.addEventListener('input', function() {
        updateWordCount('output-count', this.value);
        // Save to localStorage
        localStorage.setItem('outputText', this.value);
    });
    
    // Prompt textarea word count is handled by prompt-textarea.js
}

function updateWordCount(elementId, text) {
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    document.getElementById(elementId).textContent = wordCount;
}

// Update IMG count display
function updateImgCount() {
    const imgCountSpan = document.getElementById('img-count');
    if (imgCountSpan) {
        const enabledImageWithDataCount = inputItems.filter(item => 
            item.type === 'image' && 
            item.enabled && 
            item.imageData
        ).length;
        imgCountSpan.textContent = enabledImageWithDataCount;
    }
}

// Make inputItems globally accessible for configuration management
// 使inputItems全局可访问以便配置管理
window.inputItems = inputItems;

// Export functions for external access
// 导出函数供外部访问
window.FormInputs = {
    getInputItems: () => inputItems,
    setInputItems: (items) => {
        inputItems = items;
        window.inputItems = inputItems;
        saveToStorage();
        renderInputItems();
        updatePromptButtons();
        updateImgCount();
    },
    renderInputItems,
    updatePromptButtons,
    saveToStorage,
    updateImgCount
};
