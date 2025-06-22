// Model Configuration Management
// Based on Swift code ServiceProvider and APITestService implementation

// Service provider configuration (based on Swift ServiceProvider enum)
const ServiceProviders = {
    openAI: {
        name: 'OpenAI',
        value: 'openAI',
        defaultApiUrl: 'https://api.openai.com/v1',
        suggestedModels: ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        modelCharacteristics: {
            'gpt-4o-mini': { maxTokens: 2000, temperature: 0.3, hasImageCapability: true },
            'gpt-4-turbo': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true },
            'gpt-3.5-turbo': { maxTokens: 2000, temperature: 0.3, hasImageCapability: false }
        }
    },
    claude: {
        name: 'Claude',
        value: 'claude',
        defaultApiUrl: 'https://api.anthropic.com/v1',
        suggestedModels: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
        modelCharacteristics: {
            'claude-3-haiku-20240307': { maxTokens: 2000, temperature: 0.3, hasImageCapability: true },
            'claude-3-sonnet-20240229': { maxTokens: 3000, temperature: 0.3, hasImageCapability: true },
            'claude-3-opus-20240229': { maxTokens: 4000, temperature: 0.3, hasImageCapability: true }
        }
    },
    gemini: {
        name: 'Gemini',
        value: 'gemini',
        defaultApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        suggestedModels: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'],
        modelCharacteristics: {
            'gemini-2.0-flash': { maxTokens: 1000, temperature: 0.3, hasImageCapability: true },
            'gemini-1.5-flash': { maxTokens: 1000, temperature: 0.3, hasImageCapability: true },
            'gemini-1.5-flash-8b': { maxTokens: 1000, temperature: 0.3, hasImageCapability: true }
        }
    },
    deepSeek: {
        name: 'DeepSeek',
        value: 'deepSeek',
        defaultApiUrl: 'https://api.deepseek.com/v1',
        suggestedModels: ['deepseek-chat'],
        modelCharacteristics: {
            'deepseek-chat': { maxTokens: 1000, temperature: 0.3, hasImageCapability: false }
        }
    },
};

// Current configuration state
let currentConfig = {
    provider: null,
    model: null,
    apiUrl: '',
    apiKey: '',
    maxTokens: 1000,
    temperature: 0.3
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
}

// Handle API URL change
function handleApiUrlChange(event) {
    currentConfig.apiUrl = event.target.value;
    console.log('[ModelConfig] 🔗 API URL updated:', currentConfig.apiUrl);
}

// Handle API Key change
function handleApiKeyChange(event) {
    currentConfig.apiKey = event.target.value;
    const maskedKey = currentConfig.apiKey.length > 6 ? 
        currentConfig.apiKey.substring(0, 6) + '...' : currentConfig.apiKey;
    console.log('[ModelConfig] 🔑 API Key updated (first 6 chars):', maskedKey);
}

// Handle Max Tokens change
function handleMaxTokensChange(event) {
    currentConfig.maxTokens = parseInt(event.target.value) || 1000;
    console.log('[ModelConfig] 🔢 Max Tokens updated:', currentConfig.maxTokens);
}

// Handle Temperature change
function handleTemperatureChange(event) {
    currentConfig.temperature = parseFloat(event.target.value) || 0.3;
    console.log('[ModelConfig] 🌡️ Temperature updated:', currentConfig.temperature);
}

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
    
    if (apiUrlInput) apiUrlInput.value = currentConfig.apiUrl || '';
    if (apiKeyInput) apiKeyInput.value = currentConfig.apiKey || '';
    if (maxTokensInput) maxTokensInput.value = currentConfig.maxTokens || 1000;
    if (temperatureInput) temperatureInput.value = currentConfig.temperature || 0.3;
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
            case 'google':
                testResult = await testGoogleTranslateAPI();
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
    
    const fullUrl = `${currentConfig.apiUrl}/messages`;
    console.log('[ModelConfig] 🟣 Complete request URL:', fullUrl);
    
    const requestBody = {
        model: currentConfig.model,
        max_tokens: 1,
        messages: [
            { role: "user", content: "Hi" }
        ]
    };
    
    console.log('[ModelConfig] 🟣 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'x-api-key': currentConfig.apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[ModelConfig] 🟣 HTTP status code:', response.status);
        console.log('[ModelConfig] 🟣 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[ModelConfig] 🟣 Response body:', responseText);
        
        return response.ok;
        
    } catch (error) {
        console.error('[ModelConfig] ❌ Claude test error:', error);
        return false;
    }
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

// Google Translate API test
async function testGoogleTranslateAPI() {
    console.log('[ModelConfig] 🔴 Starting Google Translate API test');
    
    const fullUrl = `${currentConfig.apiUrl}?key=${currentConfig.apiKey}`;
    console.log('[ModelConfig] 🔴 Complete request URL:', fullUrl);
    
    const requestBody = {
        q: "hi",
        target: "es",
        format: "text"
    };
    
    console.log('[ModelConfig] 🔴 Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[ModelConfig] 🔴 HTTP status code:', response.status);
        console.log('[ModelConfig] 🔴 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[ModelConfig] 🔴 Response body:', responseText);
        
        return response.ok;
        
    } catch (error) {
        console.error('[ModelConfig] ❌ Google Translate test error:', error);
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
    loadConfig: loadConfiguration
};
