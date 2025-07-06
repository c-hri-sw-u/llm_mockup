// Model Configuration Management
// Based on Swift code ServiceProvider and APITestService implementation

// Service provider configuration (based on Swift ServiceProvider enum)
const ServiceProviders = {
    openAI: {
        name: 'OpenAI',
        value: 'openAI',
        defaultApiUrl: 'https://api.openai.com/v1',
        suggestedModels: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        modelCharacteristics: {
            'gpt-4.1': { maxTokens: 32768, temperature: 0.3, hasImageCapability: true, contextWindow: 1000000, pricing: '$2.00/1M input, $8.00/1M output' },
            'gpt-4.1-mini': { maxTokens: 16384, temperature: 0.3, hasImageCapability: true, contextWindow: 1000000, pricing: '$0.40/1M input, $1.60/1M output' },
            'gpt-4.1-nano': { maxTokens: 8192, temperature: 0.3, hasImageCapability: false, contextWindow: 500000, pricing: '$0.10/1M input, $0.40/1M output' },
            'gpt-4o': { maxTokens: 4000, temperature: 0.3, hasImageCapability: false, speciality: 'Advanced reasoning and complex problem solving' },
            'gpt-4o-mini': { maxTokens: 2000, temperature: 0.3, hasImageCapability: true },
            'gpt-4-turbo': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true }
        }
    },
    // claude: {
    //     name: 'Claude',
    //     value: 'claude',
    //     defaultApiUrl: 'https://api.anthropic.com/v1',
    //     suggestedModels: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307'],
    //     modelCharacteristics: {
    //         'claude-opus-4-20250514': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Highest capability with advanced agentic features' },
    //         'claude-sonnet-4-20250514': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Balanced capability and speed with code execution' },
    //         'claude-3-7-sonnet-latest': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Hybrid reasoning modes and Claude Code beta' },
    //         'claude-3-5-haiku-latest': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Enhanced coding and Artifacts feature' },
    //         'claude-3-5-sonnet-latest': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Enhanced coding and Artifacts feature' },
    //         'claude-3-5-sonnet-20240620': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Enhanced coding and Artifacts feature' },
    //         'claude-3-haiku-20240307': { maxTokens: 2000, temperature: 0.3, hasImageCapability: true, contextWindow: 200000, speciality: 'Speed optimized' }
    //     }
    // },
    gemini: {
        name: 'Gemini',
        value: 'gemini',
        defaultApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        suggestedModels: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-06-17', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
        modelCharacteristics: {
            'gemini-2.5-pro': { maxTokens: 8000, temperature: 0.3, hasImageCapability: true, contextWindow: 1000000, speciality: 'Multimodal with advanced coding capabilities' },
            'gemini-2.5-flash': { maxTokens: 2000, temperature: 0.3, hasImageCapability: true, contextWindow: 1000000, speciality: 'Fast inference with multimodal support' },
            'gemini-2.5-flash-lite-preview-06-17': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true, contextWindow: 128000 },
            'gemini-2.0-flash': { maxTokens: 1000, temperature: 0.3, hasImageCapability: true, contextWindow: 128000 },
            'gemini-2.0-flash-lite': { maxTokens: 1000, temperature: 0.3, hasImageCapability: true, contextWindow: 128000 }
        }
    },
    deepSeek: {
        name: 'DeepSeek',
        value: 'deepSeek',
        defaultApiUrl: 'https://api.deepseek.com/v1',
        suggestedModels: ['deepseek-reasoner', 'deepseek-chat'],
        modelCharacteristics: {
            'deepseek-reasoner': { maxTokens: 4000, temperature: 0.3, hasImageCapability: false, contextWindow: 128000, speciality: 'Specialized for coding tasks' },
            'deepseek-chat': { maxTokens: 1000, temperature: 0.3, hasImageCapability: false, contextWindow: 128000 }
        }
    },
    xAI: {
        name: 'xAI',
        value: 'xai',
        defaultApiUrl: 'https://api.x.ai/v1',
        suggestedModels: ['grok-3', 'grok-2', 'grok-1.5'],
        modelCharacteristics: {
            'grok-3': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true, speciality: 'Real-time information access and witty personality' },
            'grok-2': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true, speciality: 'Improved reasoning and image understanding' },
            'grok-1.5': { maxTokens: 2000, temperature: 0.3, hasImageCapability: false, speciality: 'Fast inference with humor' }
        }
    },
    meta: {
        name: 'Meta',
        value: 'meta',
        defaultApiUrl: 'https://api.llama-api.com/v1',
        suggestedModels: ['llama-4', 'llama-3.3-70b', 'llama-3.2-90b', 'llama-3.1-405b'],
        modelCharacteristics: {
            'llama-4': { maxTokens: 8000, temperature: 0.3, hasImageCapability: true, speciality: 'Latest generation with improved reasoning' },
            'llama-3.3-70b': { maxTokens: 4000, temperature: 0.3, hasImageCapability: false, contextWindow: 128000, speciality: 'Optimized 70B parameter model' },
            'llama-3.2-90b': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true, contextWindow: 128000 },
            'llama-3.1-405b': { maxTokens: 8000, temperature: 0.3, hasImageCapability: false, contextWindow: 128000, speciality: 'Largest open-source model' }
        }
    },
    qwen: {
        name: 'Qwen',
        value: 'qwen',
        defaultApiUrl: 'https://dashscope.aliyuncs.com/api/v1',
        suggestedModels: ['qwen-3', 'qwen-2.5-72b', 'qwen-2.5-32b', 'qwen-2.5-14b'],
        modelCharacteristics: {
            'qwen-3': { maxTokens: 8000, temperature: 0.3, hasImageCapability: true, speciality: 'Latest generation with multimodal capabilities' },
            'qwen-2.5-72b': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true, contextWindow: 128000 },
            'qwen-2.5-32b': { maxTokens: 3000, temperature: 0.3, hasImageCapability: false, contextWindow: 32000 },
            'qwen-2.5-14b': { maxTokens: 2000, temperature: 0.3, hasImageCapability: false, contextWindow: 32000 }
        }
    },
    mistral: {
        name: 'Mistral',
        value: 'mistral',
        defaultApiUrl: 'https://api.mistral.ai/v1',
        suggestedModels: ['mistral-large-2', 'mixtral-8x22b', 'mistral-medium', 'mistral-small'],
        modelCharacteristics: {
            'mistral-large-2': { maxTokens: 4000, temperature: 0.3, hasImageCapability: false, contextWindow: 128000, speciality: 'Latest flagship model' },
            'mixtral-8x22b': { maxTokens: 4000, temperature: 0.3, hasImageCapability: false, contextWindow: 64000, speciality: 'Mixture of Experts architecture' },
            'mistral-medium': { maxTokens: 3000, temperature: 0.3, hasImageCapability: false, contextWindow: 32000 },
            'mistral-small': { maxTokens: 2000, temperature: 0.3, hasImageCapability: false, contextWindow: 32000 }
        }
    },
};

// Current configuration state
let currentConfig = {
    provider: null,
    model: null,
    apiUrl: '',
    apiKey: '',
    maxTokens: 2000,
    temperature: 0.3,
    multiRounds: 5,
    multiRoundsEnabled: false
};

// Initialize model configuration
function initializeModelConfiguration() {
    console.log('[ModelConfig] 🚀 Initializing model configuration interface');
    
    // Get DOM elements
    const providerSelect = document.querySelector('.config-grid .config-item:nth-child(1) .config-select');
    const modelSelect = document.querySelector('.config-grid .config-item:nth-child(2) .config-select');
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const maxTokensInput = document.querySelector('.config-grid .config-item:nth-child(5) .config-input');
    const temperatureInput = document.querySelector('.config-grid .config-item:nth-child(6) .config-input');
    const multiRoundsInput = document.getElementById('multi-rounds');
    const multiRoundsToggle = document.getElementById('multi-rounds-toggle');
    const saveTestButton = document.querySelector('.model-config-header .btn-small');
    
    // Populate Provider selector
    populateProviderSelect(providerSelect);
    
    // Bind event listeners
    providerSelect.addEventListener('change', handleProviderChange);
    modelSelect.addEventListener('change', handleModelChange);
    apiUrlInput.addEventListener('input', handleApiUrlChange);
    apiKeyInput.addEventListener('input', handleApiKeyChange);
    maxTokensInput.addEventListener('input', handleMaxTokensChange);
    temperatureInput.addEventListener('input', handleTemperatureChange);
    multiRoundsInput.addEventListener('input', handleMultiRoundsChange);
    
    // Add input filter for multi-rounds to only allow numbers
    multiRoundsInput.addEventListener('keypress', function(event) {
        // Only allow numbers, backspace, delete, arrow keys
        if (!/[0-9]/.test(event.key) && 
            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
            event.preventDefault();
        }
    });
    
    saveTestButton.addEventListener('click', handleSaveAndTest);
    
    console.log('[ModelConfig] ✅ Model configuration initialization complete');
}

// Populate Provider selector
function populateProviderSelect(selectElement) {
    console.log('[ModelConfig] 📝 Populating Provider selector');
    
    // Clear existing options
    selectElement.innerHTML = '<option value="">None</option>';
    
    // Add all provider options
    Object.values(ServiceProviders).forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.value;
        option.textContent = provider.name;
        selectElement.appendChild(option);
    });
}

// Populate Model selector
function populateModelSelect(selectElement, providerValue) {
    console.log('[ModelConfig] 📝 Populating Model selector, Provider:', providerValue);
    
    // Clear existing options
    selectElement.innerHTML = '<option value="">None</option>';
    
    if (providerValue && ServiceProviders[providerValue]) {
        const provider = ServiceProviders[providerValue];
        provider.suggestedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            selectElement.appendChild(option);
        });
    }
}

// Handle Provider change
function handleProviderChange(event) {
    const providerValue = event.target.value;
    console.log('[ModelConfig] 🔄 Provider selection changed:', providerValue);
    
    currentConfig.provider = providerValue;
    
    // Update Model selector
    const modelSelect = document.querySelector('.config-grid .config-item:nth-child(2) .config-select');
    populateModelSelect(modelSelect, providerValue);
    
    // Auto-fill API URL
    if (providerValue && ServiceProviders[providerValue]) {
        const provider = ServiceProviders[providerValue];
        const apiUrlInput = document.getElementById('api-url');
        apiUrlInput.value = provider.defaultApiUrl;
        currentConfig.apiUrl = provider.defaultApiUrl;
        console.log('[ModelConfig] 🔗 Auto-filled API URL:', provider.defaultApiUrl);
    }
    
    // Reset Model selection and image capability
    currentConfig.model = null;
    modelSelect.value = '';
    const imageCapabilityInput = document.getElementById('image-capability');
    if (imageCapabilityInput) {
        imageCapabilityInput.value = 'false';
    }
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle Model change
function handleModelChange(event) {
    const modelValue = event.target.value;
    console.log('[ModelConfig] 🔄 Model selection changed:', modelValue);
    
    currentConfig.model = modelValue;
    
    // Auto-set recommended maxTokens and temperature
    if (currentConfig.provider && modelValue) {
        const provider = ServiceProviders[currentConfig.provider];
        const characteristics = provider.modelCharacteristics[modelValue];
        
        if (characteristics) {
            const maxTokensInput = document.querySelector('.config-grid .config-item:nth-child(5) .config-input');
            const temperatureInput = document.querySelector('.config-grid .config-item:nth-child(6) .config-input');
            const imageCapabilityInput = document.getElementById('image-capability');
            
            maxTokensInput.value = characteristics.maxTokens;
            temperatureInput.value = characteristics.temperature;
            imageCapabilityInput.value = characteristics.hasImageCapability.toString();
            
            currentConfig.maxTokens = characteristics.maxTokens;
            currentConfig.temperature = characteristics.temperature;
            
            console.log('[ModelConfig] ⚙️ Auto-set parameters - MaxTokens:', characteristics.maxTokens, 'Temperature:', characteristics.temperature, 'Image Capability:', characteristics.hasImageCapability);
        }
    } else {
        // Reset image capability when no model selected
        const imageCapabilityInput = document.getElementById('image-capability');
        if (imageCapabilityInput) {
            imageCapabilityInput.value = 'false';
        }
    }
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle API URL change
function handleApiUrlChange(event) {
    currentConfig.apiUrl = event.target.value;
    console.log('[ModelConfig] 🔗 API URL updated:', currentConfig.apiUrl);
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle API Key change
function handleApiKeyChange(event) {
    currentConfig.apiKey = event.target.value;
    const maskedKey = currentConfig.apiKey.length > 6 ? 
        currentConfig.apiKey.substring(0, 6) + '...' : currentConfig.apiKey;
    console.log('[ModelConfig] 🔑 API Key updated (first 6 chars):', maskedKey);
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle Max Tokens change
function handleMaxTokensChange(event) {
    currentConfig.maxTokens = parseInt(event.target.value) || 1000;
    console.log('[ModelConfig] 🔢 Max Tokens updated:', currentConfig.maxTokens);
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle Temperature change
function handleTemperatureChange(event) {
    currentConfig.temperature = parseFloat(event.target.value) || 0.3;
    console.log('[ModelConfig] 🌡️ Temperature updated:', currentConfig.temperature);
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle Multi-Rounds change
function handleMultiRoundsChange(event) {
    // Only handle changes if multi-rounds is enabled
    if (!currentConfig.multiRoundsEnabled) {
        return;
    }
    
    let value = parseInt(event.target.value);
    
    // Validate range (2-30)
    if (isNaN(value) || value < 2) {
        value = 2;
        event.target.value = value;
    } else if (value > 30) {
        value = 30;
        event.target.value = value;
    } else {
        // Valid number, update the input to clean format
        event.target.value = value;
    }
    
    currentConfig.multiRounds = value;
    console.log('[ModelConfig] 🔄 Multi-Rounds updated:', currentConfig.multiRounds);
    
    // Update short history management max rounds
    if (currentConfig.multiRoundsEnabled && typeof window.ShortHistory !== 'undefined') {
        window.ShortHistory.updateMaxRounds(value);
    }
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Handle Multi-Rounds toggle
function toggleMultiRounds(enabled) {
    currentConfig.multiRoundsEnabled = enabled;
    
    const multiRoundsInput = document.getElementById('multi-rounds');
    if (enabled) {
        multiRoundsInput.disabled = false;
        multiRoundsInput.value = currentConfig.multiRounds || 5;
        console.log('[ModelConfig] ✅ Multi-Rounds enabled:', currentConfig.multiRounds);
        
        // Enable short history management
        if (typeof window.ShortHistory !== 'undefined') {
            window.ShortHistory.enableMultiRound(currentConfig.multiRounds || 5);
        }
    } else {
        multiRoundsInput.disabled = true;
        multiRoundsInput.value = '--';
        console.log('[ModelConfig] ❌ Multi-Rounds disabled');
        
        // Disable short history management
        if (typeof window.ShortHistory !== 'undefined') {
            window.ShortHistory.disableMultiRound();
        }
    }
    
    // Auto-save configuration
    // 自动保存配置
    saveConfiguration();
}

// Make toggleMultiRounds globally accessible
window.toggleMultiRounds = toggleMultiRounds;

// Handle Save & Test button click
async function handleSaveAndTest() {
    console.log('[ModelConfig] 🚀 Starting save and test configuration');
    console.log('[ModelConfig] 📋 Current configuration:', currentConfig);
    
    // Validate configuration completeness
    if (!validateConfiguration()) {
        return;
    }
    
    // Save configuration
    saveConfiguration();
    
    // Execute API test
    await testApiConfiguration();
}

// Validate configuration completeness
function validateConfiguration() {
    console.log('[ModelConfig] 🔍 Validating configuration completeness');
    
    if (!currentConfig.provider) {
        console.error('[ModelConfig] ❌ Provider not selected');
        alert('Please select Provider');
        return false;
    }
    
    if (!currentConfig.model) {
        console.error('[ModelConfig] ❌ Model not selected');
        alert('Please select Model');
        return false;
    }
    
    if (!currentConfig.apiUrl) {
        console.error('[ModelConfig] ❌ API URL is empty');
        alert('Please fill in API URL');
        return false;
    }
    
    if (!currentConfig.apiKey) {
        console.error('[ModelConfig] ❌ API Key is empty');
        alert('Please fill in API Key');
        return false;
    }
    
    console.log('[ModelConfig] ✅ Configuration validation passed');
    return true;
}

// Save configuration to localStorage
function saveConfiguration() {
    console.log('[ModelConfig] 💾 Saving configuration to localStorage');
    
    try {
        localStorage.setItem('modelConfiguration', JSON.stringify(currentConfig));
        console.log('[ModelConfig] ✅ Configuration saved successfully');
    } catch (error) {
        console.error('[ModelConfig] ❌ Configuration save failed:', error);
    }
}

// Load configuration from localStorage
function loadConfiguration() {
    console.log('[ModelConfig] 📂 Loading configuration from localStorage');
    
    try {
        const savedConfig = localStorage.getItem('modelConfiguration');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            // Merge configuration, keeping defaults
            currentConfig = { ...currentConfig, ...parsedConfig };
            
            // Update UI
            updateUIFromConfig();
            
            console.log('[ModelConfig] ✅ Configuration loaded successfully:', currentConfig);
        }
    } catch (error) {
        console.error('[ModelConfig] ❌ Configuration load failed:', error);
    }
}

// Update UI based on configuration
function updateUIFromConfig() {
    console.log('[ModelConfig] 🎨 Updating UI based on configuration');
    
    // Update Provider selector
    const providerSelect = document.querySelector('.config-grid .config-item:nth-child(1) .config-select');
    if (providerSelect && currentConfig.provider) {
        providerSelect.value = currentConfig.provider;
        
        // Trigger Model selector update
        const modelSelect = document.querySelector('.config-grid .config-item:nth-child(2) .config-select');
        populateModelSelect(modelSelect, currentConfig.provider);
        
        if (currentConfig.model) {
            modelSelect.value = currentConfig.model;
        }
    }
    
    // Update other input fields
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const maxTokensInput = document.querySelector('.config-grid .config-item:nth-child(5) .config-input');
    const temperatureInput = document.querySelector('.config-grid .config-item:nth-child(6) .config-input');
    const multiRoundsInput = document.getElementById('multi-rounds');
    const multiRoundsToggle = document.getElementById('multi-rounds-toggle');
    
    if (apiUrlInput) apiUrlInput.value = currentConfig.apiUrl || '';
    if (apiKeyInput) apiKeyInput.value = currentConfig.apiKey || '';
    if (maxTokensInput) maxTokensInput.value = currentConfig.maxTokens || 1000;
    if (temperatureInput) temperatureInput.value = currentConfig.temperature || 0.3;
    
    // Update multi-rounds toggle and input
    if (multiRoundsToggle) {
        multiRoundsToggle.checked = currentConfig.multiRoundsEnabled || false;
    }
    if (multiRoundsInput) {
        if (currentConfig.multiRoundsEnabled) {
            multiRoundsInput.disabled = false;
            multiRoundsInput.value = currentConfig.multiRounds || 5;
            
            // Enable short history management if enabled
            if (typeof window.ShortHistory !== 'undefined') {
                window.ShortHistory.enableMultiRound(currentConfig.multiRounds || 5);
            }
        } else {
            multiRoundsInput.disabled = true;
            multiRoundsInput.value = '--';
            
            // Disable short history management if disabled
            if (typeof window.ShortHistory !== 'undefined') {
                window.ShortHistory.disableMultiRound();
            }
        }
    }
}

// API test functionality (based on Swift APITestService)
async function testApiConfiguration() {
    console.log('[ModelConfig] 🧪 Starting API test');
    console.log('[ModelConfig] 🧪 Test parameters:');
    console.log('  - Provider:', currentConfig.provider);
    console.log('  - Model:', currentConfig.model);
    console.log('  - API URL:', currentConfig.apiUrl);
    console.log('  - API Key (first 6 chars):', currentConfig.apiKey.substring(0, 6) + '...');
    
    try {
        const startTime = Date.now();
        
        let testResult = false;
        
        // Route to corresponding test function based on provider
        switch (currentConfig.provider) {
            case 'openAI':
                testResult = await testOpenAIAPI();
                break;
            case 'claude':
                testResult = await testClaudeAPI();
                break;
            case 'gemini':
                testResult = await testGeminiAPI();
                break;
            case 'deepSeek':
                testResult = await testDeepSeekAPI();
                break;

            default:
                console.error('[ModelConfig] ❌ Unsupported Provider:', currentConfig.provider);
                return;
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log('[ModelConfig] 🧪 API test complete');
        console.log('  - Duration:', duration.toFixed(2) + ' seconds');
        console.log('  - Result:', testResult ? '✅ Success' : '❌ Failed');
        
        // Display test result
        if (testResult) {
            alert('API test successful!');
        } else {
            alert('API test failed, please check configuration and network connection. See console for details.');
        }
        
    } catch (error) {
        console.error('[ModelConfig] ❌ API test exception:', error);
        alert('API test exception: ' + error.message);
    }
}

// OpenAI API test
async function testOpenAIAPI() {
    console.log('[ModelConfig] 🟠 Starting OpenAI API test');
    
    const fullUrl = `${currentConfig.apiUrl}/chat/completions`;
    console.log('[ModelConfig] 🟠 Complete request URL:', fullUrl);
    
    const requestBody = {
        model: currentConfig.model,
        messages: [
            { role: "user", content: "Hi" }
        ],
        max_tokens: 1 // Minimum token consumption
    };
    
    console.log('[ModelConfig] 🟠 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentConfig.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[ModelConfig] 🟠 HTTP status code:', response.status);
        console.log('[ModelConfig] 🟠 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[ModelConfig] 🟠 Response body:', responseText);
        
        return response.ok;
        
    } catch (error) {
        console.error('[ModelConfig] ❌ OpenAI test error:', error);
        return false;
    }
}

// Claude API test
async function testClaudeAPI() {
    console.log('[ModelConfig] 🟣 Starting Claude API test');
    
    // Due to CORS limitations with Claude API, we'll perform configuration validation instead
    console.log('[ModelConfig] 🟣 Note: Claude API testing is limited by CORS policy in browsers');
    console.log('[ModelConfig] 🟣 Performing configuration validation instead of live API test');
    
    // Validate API key format (Claude API keys start with 'sk-ant-')
    if (!currentConfig.apiKey.startsWith('sk-ant-')) {
        console.error('[ModelConfig] ❌ Invalid Claude API key format - should start with "sk-ant-"');
        return false;
    }
    
    // Validate API URL
    if (!currentConfig.apiUrl.includes('anthropic.com')) {
        console.error('[ModelConfig] ❌ Invalid Claude API URL - should contain "anthropic.com"');
        return false;
    }
    
    // Validate model exists in our configuration
    const provider = ServiceProviders[currentConfig.provider];
    if (!provider.suggestedModels.includes(currentConfig.model)) {
        console.error('[ModelConfig] ❌ Invalid model selection for Claude');
        return false;
    }
    
    // Validate other parameters
    if (currentConfig.maxTokens < 1 || currentConfig.maxTokens > 4096) {
        console.error('[ModelConfig] ❌ Invalid max tokens - should be between 1 and 4096');
        return false;
    }
    
    if (currentConfig.temperature < 0 || currentConfig.temperature > 1) {
        console.error('[ModelConfig] ❌ Invalid temperature - should be between 0 and 1');
        return false;
    }
    
    console.log('[ModelConfig] 🟣 ✅ Configuration validation passed');
    console.log('[ModelConfig] 🟣 ✅ API key format is valid');
    console.log('[ModelConfig] 🟣 ✅ API URL is valid');
    console.log('[ModelConfig] 🟣 ✅ Model selection is valid');
    console.log('[ModelConfig] 🟣 ✅ Parameters are within valid ranges');
    console.log('[ModelConfig] 🟣 Note: For actual API connectivity testing, use a server-side implementation');
    
    return true;
}

// Gemini API test
async function testGeminiAPI() {
    console.log('[ModelConfig] 🟢 Starting Gemini API test');
    
    const fullUrl = `${currentConfig.apiUrl}/${currentConfig.model}:generateContent?key=${currentConfig.apiKey}`;
    console.log('[ModelConfig] 🟢 Complete request URL:', fullUrl);
    
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: "Hi" }
                ]
            }
        ],
        generationConfig: {
            maxOutputTokens: 1
        }
    };
    
    console.log('[ModelConfig] 🟢 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[ModelConfig] 🟢 HTTP status code:', response.status);
        console.log('[ModelConfig] 🟢 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[ModelConfig] 🟢 Response body:', responseText);
        
        return response.ok;
        
    } catch (error) {
        console.error('[ModelConfig] ❌ Gemini test error:', error);
        return false;
    }
}

// DeepSeek API test
async function testDeepSeekAPI() {
    console.log('[ModelConfig] 🔵 Starting DeepSeek API test');
    
    const fullUrl = `${currentConfig.apiUrl}/chat/completions`;
    console.log('[ModelConfig] 🔵 Complete request URL:', fullUrl);
    
    // DeepSeek model name conversion
    const transformedModel = currentConfig.model.toLowerCase().replace(/\s+/g, '-');
    console.log('[ModelConfig] 🔵 Model name conversion:', currentConfig.model, '->', transformedModel);
    
    const requestBody = {
        model: transformedModel,
        messages: [
            { role: "user", content: "Hi" }
        ],
        max_tokens: 1
    };
    
    console.log('[ModelConfig] 🔵 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentConfig.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[ModelConfig] 🔵 HTTP status code:', response.status);
        console.log('[ModelConfig] 🔵 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[ModelConfig] 🔵 Response body:', responseText);
        
        return response.ok;
        
    } catch (error) {
        console.error('[ModelConfig] ❌ DeepSeek test error:', error);
        return false;
    }
}



// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ModelConfig] 📱 Page loaded, starting initialization');
    
    // Delay initialization to ensure all elements are loaded
    setTimeout(() => {
        initializeModelConfiguration();
        loadConfiguration();
    }, 100);
});

// Export configuration object for other modules to use
window.ModelConfiguration = {
    getCurrentConfig: () => currentConfig,
    getServiceProviders: () => ServiceProviders,
    testAPI: testApiConfiguration,
    saveConfig: saveConfiguration,
    loadConfig: loadConfiguration,
    toggleMultiRounds: toggleMultiRounds
};
