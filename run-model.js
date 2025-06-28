// AI Model Runner
// Based on Swift code LLMAPIManager and CallLLMService implementation

// Running state management
let isRunning = false;
let abortController = null;

// Initialize model runner
function initializeModelRunner() {
    console.log('[ModelRunner] 🚀 Initializing model runner');
    
    // Get DOM elements
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    const okButton = document.getElementById('ok-btn'); // OK button
    const inputCountSpan = document.getElementById('input-count');
    const outputCountSpan = document.getElementById('output-count');
    
    // Bind event listeners
    if (inputTextarea) {
        inputTextarea.addEventListener('input', updateInputWordCount);
        inputTextarea.addEventListener('keydown', handleInputKeydown);
    }
    
    if (okButton) {
        okButton.addEventListener('click', handleRunModel);
    }
    
    // Initialize word count
    updateInputWordCount();
    updateOutputWordCount();
    
    console.log('[ModelRunner] ✅ Model runner initialization complete');
}

// Update input word count
function updateInputWordCount() {
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    const inputCountSpan = document.getElementById('input-count');
    
    if (inputTextarea && inputCountSpan) {
        const wordCount = countWords(inputTextarea.value);
        inputCountSpan.textContent = wordCount;
    }
}

// Update output word count
function updateOutputWordCount() {
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    const outputCountSpan = document.getElementById('output-count');
    
    if (outputTextarea && outputCountSpan) {
        const wordCount = countWords(outputTextarea.value);
        outputCountSpan.textContent = wordCount;
    }
}

// Word count function
function countWords(text) {
    if (!text || text.trim() === '') return 0;
    
    // Simple word count: split by spaces, filter empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

// Handle input box keyboard events (support Ctrl+Enter shortcut)
function handleInputKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleRunModel();
    }
}

// Main model running handler function
async function handleRunModel() {
    console.log('[ModelRunner] 🚀 Starting model run');
    
    // Prevent duplicate runs
    if (isRunning) {
        console.log('[ModelRunner] ⚠️ Model is already running, skipping this request');
        return;
    }
    
    try {
        // Validate configuration
        if (!validateModelConfiguration()) {
            return;
        }
        
        // Get input text
        const inputText = getInputText();
        if (!inputText) {
            alert('Please enter text content');
            return;
        }
        
        // Build messages with proper system/user separation
        const messageData = buildMessages(inputText);
        console.log('[ModelRunner] 📝 Message mode:', messageData.mode);
        
        // Set running state
        setRunningState(true);
        
        // Call API
        const result = await callLLMAPI(messageData);
        
        // Display result
        displayResult(result);
        
        console.log('[ModelRunner] ✅ Model run complete');
        
    } catch (error) {
        console.error('[ModelRunner] ❌ Model run failed:', error);
        
        // Display error message
        if (error.name === 'AbortError') {
            console.log('[ModelRunner] 🛑 Request cancelled');
        } else {
            alert('Model run failed: ' + error.message);
        }
    } finally {
        // Reset running state
        setRunningState(false);
    }
}

// Validate model configuration
function validateModelConfiguration() {
    console.log('[ModelRunner] 🔍 Validating model configuration');
    
    // Check if ModelConfiguration object exists
    if (!window.ModelConfiguration) {
        console.error('[ModelRunner] ❌ ModelConfiguration not loaded');
        alert('Model configuration module not loaded, please refresh page and try again');
        return false;
    }
    
    const currentConfig = window.ModelConfiguration.getCurrentConfig();
    
    if (!currentConfig.provider) {
        alert('Please configure Provider first');
        return false;
    }
    
    if (!currentConfig.model) {
        alert('Please configure Model first');
        return false;
    }
    
    if (!currentConfig.apiUrl) {
        alert('Please configure API URL first');
        return false;
    }
    
    if (!currentConfig.apiKey) {
        alert('Please configure API Key first');
        return false;
    }
    
    console.log('[ModelRunner] ✅ Model configuration validation passed');
    return true;
}

// Get input text
function getInputText() {
    const inputTextarea = document.querySelector('.input-section .main-textarea');
    if (!inputTextarea) {
        console.error('[ModelRunner] ❌ Input textarea not found');
        return '';
    }
    
    const text = inputTextarea.value.trim();
    console.log('[ModelRunner] 📝 Input text length:', text.length);
    return text;
}

// Build messages array with proper system/user separation
function buildMessages(inputText) {
    console.log('[ModelRunner] 🔧 Building messages with system/user separation');
    
    // Get system prompt from prompt textarea
    const promptTextarea = document.querySelector('.prompt-textarea');
    let systemPrompt = '';
    
    if (promptTextarea) {
        systemPrompt = promptTextarea.value.trim();
    }
    
    // Check if system prompt contains {{input_box}} for backward compatibility
    const hasInputBoxVariable = systemPrompt.includes('{{input_box}}');
    
    if (hasInputBoxVariable) {
        // Backward compatibility mode: expand variables and send as single user message
        console.log('[ModelRunner] 🔧 Using legacy mode - found {{input_box}} in system prompt');
        
        let expandedPrompt = expandPromptVariablesInRunModel(systemPrompt, inputText);
        
        console.log('[ModelRunner] 🔧 Legacy mode - expanded prompt:', expandedPrompt.substring(0, 200) + '...');
        
        return {
            mode: 'legacy',
            content: expandedPrompt
        };
    } else {
        // New separation mode: system prompt + user input as separate messages
        console.log('[ModelRunner] 🔧 Using separation mode - system prompt and user input separated');
        
        // Expand other variables in system prompt (but not {{input_box}})
        let expandedSystemPrompt = expandPromptVariablesInRunModel(systemPrompt, '');
        
        console.log('[ModelRunner] 🔧 System prompt:', expandedSystemPrompt.substring(0, 100) + '...');
        console.log('[ModelRunner] 🔧 User input:', inputText.substring(0, 100) + '...');
        
        return {
            mode: 'separated',
            systemPrompt: expandedSystemPrompt,
            userInput: inputText
        };
    }
}

// Expand prompt variables for run model (similar to prompt-textarea.js but for run-time)
// 为运行模型展开提示变量（类似于prompt-textarea.js但用于运行时）
function expandPromptVariablesInRunModel(promptText, inputText) {
    let expandedText = promptText;
    
    // Replace {{input_box}} with actual input content
    // 用实际输入内容替换{{input_box}}
    expandedText = expandedText.replace(/\{\{input_box\}\}/g, inputText);
    
    // Replace input item variables with their present values (exclude image types)
    // 替换输入项变量的值（排除图片类型）
    if (typeof inputItems !== 'undefined') {
        inputItems.forEach(item => {
            // Skip image types as they don't have text content to expand in prompt
            // 跳过图片类型，因为它们在提示中没有文本内容可以展开
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

// Get enabled image items
function getEnabledImages() {
    if (typeof inputItems === 'undefined') {
        return [];
    }
    
    return inputItems.filter(item => 
        item.type === 'image' && 
        item.enabled && 
        item.imageData
    );
}

// Set running state
function setRunningState(running) {
    isRunning = running;
    const okButton = document.getElementById('ok-btn');
    
    if (okButton) {
        if (running) {
            okButton.textContent = 'RUNNING...';
            okButton.disabled = true;
            okButton.style.opacity = '0.6';
        } else {
            okButton.textContent = '► OK';
            okButton.disabled = false;
            okButton.style.opacity = '1';
        }
    }
}

// Call LLM API (based on Swift LLMAPIManager logic)
async function callLLMAPI(messageData) {
    console.log('[ModelRunner] 🌐 Starting LLM API call');
    
    const currentConfig = window.ModelConfiguration.getCurrentConfig();
    console.log('[ModelRunner] 🌐 Using configuration:', {
        provider: currentConfig.provider,
        model: currentConfig.model,
        apiUrl: currentConfig.apiUrl,
        maxTokens: currentConfig.maxTokens,
        temperature: currentConfig.temperature
    });
    
    // Create AbortController for request cancellation
    abortController = new AbortController();
    
    // Get enabled images
    const enabledImages = getEnabledImages();
    console.log('[ModelRunner] 🖼️ Found enabled images:', enabledImages.length);
    
    // Build messages array based on mode
    let messages;
    
    if (messageData.mode === 'legacy') {
        // Legacy mode: single user message with expanded content
        console.log('[ModelRunner] 🌐 Building legacy format messages');
        
        if (enabledImages.length > 0 && isImageSupportedByCurrentModel()) {
            // Build message with images
            const content = [
                {
                    type: "text",
                    text: messageData.content
                }
            ];
            
            // Add images to content
            enabledImages.forEach(imageItem => {
                content.push({
                    type: "image_url",
                    image_url: {
                        url: imageItem.imageData
                    }
                });
            });
            
            messages = [
                {
                    role: "user",
                    content: content
                }
            ];
        } else {
            // Build text-only message
            messages = [
                {
                    role: "user",
                    content: messageData.content
                }
            ];
        }
    } else {
        // Separated mode: system prompt + user input
        console.log('[ModelRunner] 🌐 Building separated format messages');
        
        messages = [];
        
        // Add system message if system prompt exists
        if (messageData.systemPrompt && messageData.systemPrompt.trim()) {
            messages.push({
                role: "system",
                content: messageData.systemPrompt
            });
        }
        
        // Add user message
        if (enabledImages.length > 0 && isImageSupportedByCurrentModel()) {
            // Build user message with images
            const content = [
                {
                    type: "text",
                    text: messageData.userInput
                }
            ];
            
            // Add images to content
            enabledImages.forEach(imageItem => {
                content.push({
                    type: "image_url",
                    image_url: {
                        url: imageItem.imageData
                    }
                });
            });
            
            messages.push({
                role: "user",
                content: content
            });
        } else {
            // Build text-only user message
            messages.push({
                role: "user",
                content: messageData.userInput
            });
        }
    }
    
    console.log('[ModelRunner] 🌐 Final messages structure:', JSON.stringify(messages, null, 2));
    
    const startTime = Date.now();
    
    try {
        let result;
        
        // Route to corresponding API call function based on provider
        switch (currentConfig.provider) {
            case 'openAI':
                result = await callOpenAIAPI(messages, currentConfig);
                break;
            case 'claude':
                result = await callClaudeAPI(messages, currentConfig);
                break;
            case 'gemini':
                result = await callGeminiAPI(messages, currentConfig);
                break;
            case 'deepSeek':
                result = await callDeepSeekAPI(messages, currentConfig);
                break;

            default:
                throw new Error(`Unsupported Provider: ${currentConfig.provider}`);
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log('[ModelRunner] 🌐 API call complete');
        console.log('[ModelRunner] 🌐 Duration:', duration.toFixed(2) + ' seconds');
        console.log('[ModelRunner] 🌐 Response length:', result.length, 'characters');
        
        return result;
        
    } catch (error) {
        console.error('[ModelRunner] ❌ API call failed:', error);
        throw error;
    } finally {
        abortController = null;
    }
}

// Check if current model supports images
function isImageSupportedByCurrentModel() {
    const currentConfig = window.ModelConfiguration.getCurrentConfig();
    
    if (!currentConfig.provider || !currentConfig.model) {
        return false;
    }
    
    const providers = window.ModelConfiguration.getServiceProviders();
    const provider = providers[currentConfig.provider];
    
    if (!provider || !provider.modelCharacteristics) {
        return false;
    }
    
    const modelCharacteristics = provider.modelCharacteristics[currentConfig.model];
    return modelCharacteristics && modelCharacteristics.hasImageCapability;
}

// OpenAI API call
async function callOpenAIAPI(messages, config) {
    console.log('[ModelRunner] 🟠 Calling OpenAI API');
    
    const fullUrl = `${config.apiUrl}/chat/completions`;
    const requestBody = {
        model: config.model,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
    };
    
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API response format error');
    }
    
    // Log token usage statistics
    if (data.usage) {
        console.log('[ModelRunner] 🟠 Token Usage Statistics:');
        console.log('[ModelRunner] 🟠 Prompt Tokens:', data.usage.prompt_tokens || 0);
        console.log('[ModelRunner] 🟠 Completion Tokens:', data.usage.completion_tokens || 0);
        console.log('[ModelRunner] 🟠 Total Tokens:', data.usage.total_tokens || 0);
    }
    
    return data.choices[0].message.content;
}

// Claude API call
async function callClaudeAPI(messages, config) {
    console.log('[ModelRunner] 🟣 Calling Claude API');
    
    const fullUrl = `${config.apiUrl}/messages`;
    
    // Convert messages for Claude format (Claude has different image format)
    const claudeMessages = messages.map(msg => {
        if (Array.isArray(msg.content)) {
            // Handle content with images for Claude
            const claudeContent = msg.content.map(item => {
                if (item.type === 'image_url') {
                    // Claude expects different format for images
                    const base64Data = item.image_url.url.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    const mediaType = item.image_url.url.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
                    
                    return {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: `image/${mediaType}`,
                            data: base64Data
                        }
                    };
                }
                return item; // text content remains the same
            });
            
            return {
                ...msg,
                content: claudeContent
            };
        }
        return msg; // text-only messages remain the same
    });
    
    const requestBody = {
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: claudeMessages
    };
    
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Claude API response format error');
    }
    
    // Log token usage statistics
    if (data.usage) {
        console.log('[ModelRunner] 🟣 Token Usage Statistics:');
        console.log('[ModelRunner] 🟣 Input Tokens:', data.usage.input_tokens || 0);
        console.log('[ModelRunner] 🟣 Output Tokens:', data.usage.output_tokens || 0);
        console.log('[ModelRunner] 🟣 Total Tokens:', (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0));
    }
    
    return data.content[0].text;
}

// Gemini API call
async function callGeminiAPI(messages, config) {
    console.log('[ModelRunner] 🟢 Calling Gemini API');
    
    const fullUrl = `${config.apiUrl}/${config.model}:generateContent?key=${config.apiKey}`;
    
    // Convert messages format to Gemini format
    const contents = messages.map(msg => {
        if (Array.isArray(msg.content)) {
            // Handle content with images for Gemini
            const parts = msg.content.map(item => {
                if (item.type === 'image_url') {
                    // Gemini expects different format for images
                    const base64Data = item.image_url.url.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    const mediaType = item.image_url.url.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
                    
                    return {
                        inlineData: {
                            mimeType: `image/${mediaType}`,
                            data: base64Data
                        }
                    };
                } else {
                    return { text: item.text };
                }
            });
            
            return { parts: parts };
        } else {
            return { parts: [{ text: msg.content }] };
        }
    });
    
    const requestBody = {
        contents: contents,
        generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature
        }
    };
    
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Gemini API response format error');
    }
    
    // Log token usage statistics
    if (data.usageMetadata) {
        console.log('[ModelRunner] 🟢 Token Usage Statistics:');
        console.log('[ModelRunner] 🟢 Prompt Tokens:', data.usageMetadata.promptTokenCount || 0);
        console.log('[ModelRunner] 🟢 Completion Tokens:', data.usageMetadata.candidatesTokenCount || 0);
        console.log('[ModelRunner] 🟢 Total Tokens:', data.usageMetadata.totalTokenCount || 0);
    }
    
    return data.candidates[0].content.parts[0].text;
}

// DeepSeek API call
async function callDeepSeekAPI(messages, config) {
    console.log('[ModelRunner] 🔵 Calling DeepSeek API');
    
    const fullUrl = `${config.apiUrl}/chat/completions`;
    
    // DeepSeek model name conversion
    const transformedModel = config.model.toLowerCase().replace(/\s+/g, '-');
    
    const requestBody = {
        model: transformedModel,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
    };
    
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('DeepSeek API response format error');
    }
    
    // Log token usage statistics
    if (data.usage) {
        console.log('[ModelRunner] 🔵 Token Usage Statistics:');
        console.log('[ModelRunner] 🔵 Prompt Tokens:', data.usage.prompt_tokens || 0);
        console.log('[ModelRunner] 🔵 Completion Tokens:', data.usage.completion_tokens || 0);
        console.log('[ModelRunner] 🔵 Total Tokens:', data.usage.total_tokens || 0);
    }
    
    return data.choices[0].message.content;
}

// Display result
function displayResult(result) {
    console.log('[ModelRunner] 📤 Displaying result');
    console.log('[ModelRunner] 📤 Result length:', result.length, 'characters');
    console.log('[ModelRunner] 📤 Result preview:', result.substring(0, 200) + '...');
    
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    if (outputTextarea) {
        outputTextarea.value = result;
        
        // Update word count
        updateOutputWordCount();
        
        // Scroll to top of output box to show the beginning of the result
        outputTextarea.scrollTop = 0;
        
        console.log('[ModelRunner] ✅ Result displayed in output box');
    } else {
        console.error('[ModelRunner] ❌ Output textarea not found');
    }
}

// Cancel run
function cancelRun() {
    if (abortController) {
        console.log('[ModelRunner] 🛑 Cancelling run');
        abortController.abort();
        setRunningState(false);
    }
}

// Clear output
function clearOutput() {
    const outputTextarea = document.querySelector('.output-section .main-textarea');
    if (outputTextarea) {
        outputTextarea.value = '';
        updateOutputWordCount();
        console.log('[ModelRunner] 🧹 Output cleared');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ModelRunner] 📱 Page loaded, starting model runner initialization');
    
    // Delay initialization to ensure all modules are loaded
    setTimeout(() => {
        initializeModelRunner();
    }, 200);
});

// Export functions for other modules to use
window.ModelRunner = {
    runModel: handleRunModel,
    cancelRun: cancelRun,
    clearOutput: clearOutput,
    getInputText: getInputText,
    isRunning: () => isRunning
};
