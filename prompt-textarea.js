// Prompt textarea functionality
let isFoldMode = true; // true = fold mode (show {{}}), false = unfold mode (show expanded)
let originalPromptText = ''; // Store the original text with {{}}
let promptInitialized = false; // Flag to track if prompt textarea has been initialized

// Make originalPromptText globally accessible for configuration management
// 使originalPromptText全局可访问以便配置管理
window.originalPromptText = originalPromptText;

document.addEventListener('DOMContentLoaded', function() {
    setupPromptTextarea();
});

function setupPromptTextarea() {
    const promptTextarea = document.querySelector('.prompt-textarea');
    
    // Load saved prompt text from localStorage
    const savedPromptText = localStorage.getItem('promptText');
    if (savedPromptText) {
        promptTextarea.value = savedPromptText;
        originalPromptText = savedPromptText;
        window.originalPromptText = originalPromptText; // Keep global reference updated
    } else {
        // Initialize original text
        originalPromptText = promptTextarea.value;
        window.originalPromptText = originalPromptText; // Keep global reference updated
    }
    
    // Store original text when user types
    promptTextarea.addEventListener('input', function() {
        // Only process input in fold mode
        if (isFoldMode) {
            originalPromptText = this.value;
            window.originalPromptText = originalPromptText; // Keep global reference updated
            updateDisplayAndWordCount();
            // Save to localStorage
            localStorage.setItem('promptText', this.value);
        }
    });
    
    // Setup copy and paste buttons
    setupCopyPasteButtons();
    
    // Add fold/unfold button
    addFoldUnfoldButton();
    
    // Initial word count update
    updateDisplayAndWordCount();
    
    // Mark as initialized
    promptInitialized = true;
}

// Expand variables in prompt text for copying
function expandPromptVariables(promptText) {
    let expandedText = promptText;
    
    // Get input box content
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const inputBoxContent = inputTextarea ? inputTextarea.value : '';
    
    // Replace {{input_box}} with actual input content
    expandedText = expandedText.replace(/\{\{input_box\}\}/g, inputBoxContent);
    
    // Replace {{short_history}} with actual short history content
    if (typeof window.getShortHistory !== 'undefined') {
        const shortHistoryContent = window.getShortHistory();
        expandedText = expandedText.replace(/\{\{short_history\}\}/g, shortHistoryContent);
    }
    
    // Replace input item variables with their present values (exclude image types)
    // 替换输入项变量的值（排除图片类型）
    if (typeof inputItems !== 'undefined') {
        inputItems.forEach(item => {
            // Skip image types as they don't have text content to expand
            // 跳过图片类型，因为它们没有文本内容可以展开
            if (item.type === 'image') {
                return;
            }
            
            if (item.enabled) {
                const variablePattern = new RegExp(`\\{\\{${item.name}\\}\\}`, 'g');
                let replacementText = '';
                
                // Get the present text and expand it
                let presentText = item.present || '';
                switch (item.type) {
                    case 'selection':
                        presentText = presentText.replace('{{selection}}', item.state || '');
                        break;
                    case 'input':
                        presentText = presentText.replace('{{input}}', item.state || '');
                        break;
                }
                replacementText = presentText;
                
                expandedText = expandedText.replace(variablePattern, replacementText);
            } else {
                // If disabled, replace with empty string
                const variablePattern = new RegExp(`\\{\\{${item.name}\\}\\}`, 'g');
                expandedText = expandedText.replace(variablePattern, '');
            }
        });
    }
    
    return expandedText;
}

// Expand variables for display (with underline markup)
function expandPromptVariablesForDisplay(promptText) {
    let expandedText = promptText;
    
    // Get input box content
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const inputBoxContent = inputTextarea ? inputTextarea.value : '';
    
    // Replace {{input_box}} with actual input content (with underline)
    expandedText = expandedText.replace(/\{\{input_box\}\}/g, `<u>${inputBoxContent}</u>`);
    
    // Replace {{short_history}} with actual short history content (with underline)
    if (typeof window.getShortHistory !== 'undefined') {
        const shortHistoryContent = window.getShortHistory();
        // Escape HTML and preserve line breaks
        const escapedContent = shortHistoryContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        expandedText = expandedText.replace(/\{\{short_history\}\}/g, `<u>${escapedContent}</u>`);
    }
    
    // Replace input item variables with their present values (with underline, exclude image types)
    // 替换输入项变量的值（带下划线，排除图片类型）
    if (typeof inputItems !== 'undefined') {
        inputItems.forEach(item => {
            // Skip image types as they don't have text content to expand
            // 跳过图片类型，因为它们没有文本内容可以展开
            if (item.type === 'image') {
                return;
            }
            
            if (item.enabled) {
                const variablePattern = new RegExp(`\\{\\{${item.name}\\}\\}`, 'g');
                let replacementText = '';
                
                // Get the present text and expand it
                let presentText = item.present || '';
                switch (item.type) {
                    case 'selection':
                        presentText = presentText.replace('{{selection}}', item.state || '');
                        break;
                    case 'input':
                        presentText = presentText.replace('{{input}}', item.state || '');
                        break;
                }
                replacementText = `<u>${presentText}</u>`;
                
                expandedText = expandedText.replace(variablePattern, replacementText);
            } else {
                // If disabled, replace with empty string
                const variablePattern = new RegExp(`\\{\\{${item.name}\\}\\}`, 'g');
                expandedText = expandedText.replace(variablePattern, '');
            }
        });
    }
    
    return expandedText;
}

// Update display and word count
function updateDisplayAndWordCount() {
    const promptTextarea = document.querySelector('.prompt-textarea');
    
    if (isFoldMode) {
        // In fold mode, show original text with {{}}
        const expandedText = expandPromptVariables(originalPromptText || promptTextarea.value);
        const wordCount = expandedText.trim() === '' ? 0 : expandedText.trim().split(/\s+/).length;
        document.getElementById('prompt-count').textContent = wordCount;
        
        // Clean up unfold mode display
        updateTextareaDisplay();
    } else {
        // In unfold mode, show expanded text with underlines
        // Use originalPromptText as the source for expansion
        // 在unfold模式下，使用originalPromptText作为展开的源文本
        const currentText = originalPromptText || promptTextarea.value;
        const expandedHtml = expandPromptVariablesForDisplay(currentText);
        
        // Create a temporary div to calculate word count from expanded text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = expandedHtml;
        const plainExpandedText = tempDiv.textContent || tempDiv.innerText || '';
        const wordCount = plainExpandedText.trim() === '' ? 0 : plainExpandedText.trim().split(/\s+/).length;
        document.getElementById('prompt-count').textContent = wordCount;
        
        // Update textarea display
        updateTextareaDisplay(expandedHtml);
    }
}

// Update textarea display for unfold mode
function updateTextareaDisplay(htmlContent) {
    const promptTextarea = document.querySelector('.prompt-textarea');
    
    if (!isFoldMode) {
        // Create wrapper if it doesn't exist
        // Check if textarea is already inside a wrapper
        let wrapper = promptTextarea.closest('.prompt-textarea-wrapper');
        
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'prompt-textarea-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: block;
                width: 100%;
                height: 200px;
                margin-bottom: 10px;
            `;
            
            // Insert wrapper and move textarea into it
            promptTextarea.parentNode.insertBefore(wrapper, promptTextarea);
            wrapper.appendChild(promptTextarea);
            
            // Remove textarea's margin-bottom to avoid double margin
            promptTextarea.style.marginBottom = '0';
        }
        
        // Create or update display div
        // First, remove any existing display divs to prevent duplicates
        // 首先移除任何现有的显示div以防止重复
        const existingDisplayDivs = wrapper.querySelectorAll('.prompt-display');
        existingDisplayDivs.forEach(div => div.remove());
        
        let displayDiv = wrapper.querySelector('.prompt-display');
        
        if (!displayDiv) {
            displayDiv = document.createElement('div');
            displayDiv.className = 'prompt-display';
            displayDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 15px;
                font-family: inherit;
                font-size: 11px;
                background-color: #f8f8f8;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
                pointer-events: none;
                z-index: 1;
            `;
            wrapper.appendChild(displayDiv);
        }
        
        displayDiv.innerHTML = htmlContent;
        
        // Force DOM refresh by triggering a reflow
        // 通过触发重排来强制刷新DOM
        displayDiv.offsetHeight;
        
        promptTextarea.style.color = 'transparent';
        promptTextarea.style.caretColor = 'black';
        
        // Ensure textarea value is kept in sync with originalPromptText in unfold mode
        // 确保在unfold模式下textarea的值与originalPromptText保持同步
        promptTextarea.value = originalPromptText;
        
        // Disable textarea editing in unfold mode
        promptTextarea.disabled = true;
        promptTextarea.style.cursor = 'default';
        
        // Disable variable insertion buttons
        disableVariableButtons(true);
    } else {
        // Remove display div and wrapper, restore normal textarea
        const wrapper = promptTextarea.parentNode;
        if (wrapper && wrapper.className === 'prompt-textarea-wrapper') {
            const parent = wrapper.parentNode;
            parent.insertBefore(promptTextarea, wrapper);
            wrapper.remove();
            
            // Restore textarea's original margin-bottom
            promptTextarea.style.marginBottom = '';
        }
        promptTextarea.style.color = '';
        promptTextarea.style.caretColor = '';
        
        // Re-enable textarea editing in fold mode
        promptTextarea.disabled = false;
        promptTextarea.style.cursor = '';
        
        // Re-enable variable insertion buttons
        disableVariableButtons(false);
    }
}

// Add fold/unfold button
function addFoldUnfoldButton() {
    const promptButtons = document.querySelector('.prompt-buttons');
    const foldButton = document.createElement('button');
    foldButton.className = 'btn-small';
    foldButton.textContent = 'UNFOLD';
    foldButton.id = 'fold-unfold-btn';
    
    foldButton.addEventListener('click', function() {
        toggleFoldMode();
    });
    
    // Insert before copy button (now we can use ID to find the copy button)
    // 在copy按钮前插入（现在我们可以使用ID来找到copy按钮）
    const copyButton = document.getElementById('copy-btn');
    if (copyButton) {
        promptButtons.insertBefore(foldButton, copyButton);
    } else {
        // Fallback: insert as first child if copy button not found
        // 后备方案：如果找不到copy按钮就插入为第一个子元素
        promptButtons.insertBefore(foldButton, promptButtons.firstChild);
    }
}

// Toggle between fold and unfold modes
function toggleFoldMode() {
    const promptTextarea = document.querySelector('.prompt-textarea');
    const foldButton = document.getElementById('fold-unfold-btn');
    
    if (isFoldMode) {
        // Switch to unfold mode
        isFoldMode = false;
        foldButton.textContent = 'FOLD';
        originalPromptText = promptTextarea.value; // Save current text
        window.originalPromptText = originalPromptText; // Keep global reference updated
    } else {
        // Switch to fold mode
        isFoldMode = true;
        foldButton.textContent = 'UNFOLD';
        
        // Important: Re-enable textarea first before setting value
        // 重要：在设置值之前先重新启用textarea
        promptTextarea.disabled = false;
        promptTextarea.value = originalPromptText; // Restore original text
    }
    
    updateDisplayAndWordCount();
}

// Setup copy and paste button functionality
function setupCopyPasteButtons() {
    // Use IDs to find buttons instead of relying on position
    // 使用ID来查找按钮，而不是依赖位置
    const copyButton = document.getElementById('copy-btn');
    const pasteButton = document.getElementById('paste-btn');
    
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            copyPromptText();
        });
    }
    
    if (pasteButton) {
        pasteButton.addEventListener('click', function() {
            pastePromptText();
        });
    }
}

// Copy prompt text to clipboard based on current mode
async function copyPromptText() {
    const promptTextarea = document.querySelector('.prompt-textarea');
    let textToCopy;
    
    if (isFoldMode) {
        // Copy fold mode text (with {{}})
        textToCopy = originalPromptText || promptTextarea.value;
    } else {
        // Copy unfold mode text (expanded)
        textToCopy = expandPromptVariables(originalPromptText || promptTextarea.value);
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Visual feedback
        const copyButton = document.getElementById('copy-btn');
        if (copyButton) {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'COPIED!';
            copyButton.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.backgroundColor = '';
            }, 1000);
        }
        
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Visual feedback
        const copyButton = document.getElementById('copy-btn');
        if (copyButton) {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'COPIED!';
            copyButton.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.backgroundColor = '';
            }, 1000);
        }
    }
}

// Paste text from clipboard to prompt textarea
async function pastePromptText() {
    const promptTextarea = document.querySelector('.prompt-textarea');
    
    try {
        const text = await navigator.clipboard.readText();
        
        // Insert at cursor position
        const cursorPos = promptTextarea.selectionStart;
        const textBefore = promptTextarea.value.substring(0, cursorPos);
        const textAfter = promptTextarea.value.substring(promptTextarea.selectionEnd);
        
        promptTextarea.value = textBefore + text + textAfter;
        promptTextarea.focus();
        promptTextarea.setSelectionRange(cursorPos + text.length, cursorPos + text.length);
        
        // Update word count
        if (isFoldMode) {
            originalPromptText = promptTextarea.value;
            // Save to localStorage
            localStorage.setItem('promptText', promptTextarea.value);
        }
        updateDisplayAndWordCount();
        
        // Visual feedback
        const pasteButton = document.getElementById('paste-btn');
        if (pasteButton) {
            const originalText = pasteButton.textContent;
            pasteButton.textContent = 'PASTED!';
            pasteButton.style.backgroundColor = '#2196f3';
            
            setTimeout(() => {
                pasteButton.textContent = originalText;
                pasteButton.style.backgroundColor = '';
            }, 1000);
        }
        
    } catch (err) {
        // Show error feedback
        const pasteButton = document.getElementById('paste-btn');
        if (pasteButton) {
            const originalText = pasteButton.textContent;
            pasteButton.textContent = 'FAILED';
            pasteButton.style.backgroundColor = '#f44336';
            
            setTimeout(() => {
                pasteButton.textContent = originalText;
                pasteButton.style.backgroundColor = '';
            }, 1000);
        }
    }
}

// Disable/enable variable insertion buttons
function disableVariableButtons(disable) {
    // Disable buttons in prompt-buttons-header (the +input_box, +place, +time etc.)
    const promptButtonsHeader = document.getElementById('prompt-buttons-header');
    if (promptButtonsHeader) {
        const buttons = promptButtonsHeader.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = disable;
            if (disable) {
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            } else {
                button.style.opacity = '';
                button.style.cursor = '';
            }
        });
    }
}

// Global function to update word count when input items change
function updatePromptWordCount() {
    // Don't update if prompt hasn't been initialized yet
    if (!promptInitialized) {
        return;
    }
    
    const promptTextarea = document.querySelector('.prompt-textarea');
    if (promptTextarea) {
        // In fold mode: sync originalPromptText with current textarea value
        // In unfold mode: keep originalPromptText unchanged but update display
        // 在fold模式下：同步originalPromptText与当前textarea值
        // 在unfold模式下：保持originalPromptText不变但更新显示
        if (isFoldMode) {
            // Only update if textarea has content or originalPromptText is empty
            // This prevents overwriting saved content during initialization
            if (promptTextarea.value || !originalPromptText) {
                originalPromptText = promptTextarea.value;
                window.originalPromptText = originalPromptText; // Keep global reference updated
                // Save to localStorage only if there's actual content
                if (promptTextarea.value) {
                    localStorage.setItem('promptText', promptTextarea.value);
                }
            }
        }
        
        // Always update display and word count, regardless of mode
        // This ensures both modes show updated content when input items change
        // 总是更新显示和字数统计，无论在哪种模式下
        // 这确保两种模式下当输入项改变时都显示更新的内容
        updateDisplayAndWordCount();
    }
    
    // Update IMG count
    if (typeof updateImgCount === 'function') {
        updateImgCount();
    }
}
