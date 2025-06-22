// Voice Input Functionality
// 语音输入功能实现

class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.targetTextarea = null;
        this.voiceButton = null;
        this.shouldRestart = false; // 用于控制是否自动重启
        this.initializeVoiceRecognition();
        this.setupEventListeners();
    }

    // Initialize Web Speech API
    // 初始化语音识别API
    initializeVoiceRecognition() {
        // Check if browser supports Speech Recognition
        // 检查浏览器是否支持语音识别
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        // Configure recognition settings
        // 配置识别设置
        this.recognition.continuous = false; // 改为false，避免长时间连接问题
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // 只支持英语
        this.recognition.maxAlternatives = 1;

        // Setup event handlers
        // 设置事件处理器
        this.recognition.onstart = () => {
            this.onRecognitionStart();
        };

        this.recognition.onresult = (event) => {
            this.onRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            this.onRecognitionError(event);
        };

        this.recognition.onend = () => {
            this.onRecognitionEnd();
        };
    }

    // Setup event listeners for voice button
    // 设置语音按钮的事件监听器
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // 使用ID精确选择VOICE INPUT按钮
            this.voiceButton = document.getElementById('voice-input-btn');
            this.targetTextarea = document.querySelector('.input-section .main-textarea');

            if (this.voiceButton && this.targetTextarea) {
                this.voiceButton.addEventListener('click', () => {
                    this.toggleVoiceInput();
                });

                // Add microphone icon to button
                // 为按钮添加麦克风图标
                this.updateButtonState(false);
            }
        });
    }

    // Toggle voice input on/off
    // 切换语音输入开关
    toggleVoiceInput() {
        // 暂时禁用语音识别功能，显示友好提示
        const messages = [
            'Voice feature coming soon! / 语音功能即将推出！',
            'Feature under development / 功能开发中',
            'Stay tuned! / 敬请期待！'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showStatus(randomMessage, 'info');
        
        // 注释掉实际的语音识别功能
        /*
        if (!this.recognition) {
            this.showError('Speech recognition not supported in this browser / 此浏览器不支持语音识别');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            // 显示使用提示
            this.showStatus('Click "Allow" to enable microphone access / 点击"允许"启用麦克风访问', 'info');
            this.startListening();
        }
        */
    }

    // Start voice recognition
    // 开始语音识别
    startListening() {
        try {
            this.shouldRestart = true;
            this.recognition.start();
            this.isListening = true;
            this.updateButtonState(true);
            this.showStatus('Listening... Click to speak / 正在监听...点击开始说话', 'info');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.isListening = false;
            this.shouldRestart = false;
            this.updateButtonState(false);
            this.showError('Failed to start voice recognition / 语音识别启动失败');
        }
    }

    // Stop voice recognition
    // 停止语音识别
    stopListening() {
        this.shouldRestart = false; // 防止自动重启
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateButtonState(false);
            this.showStatus('Voice input stopped / 语音输入已停止', 'info');
        }
    }

    // Handle recognition start
    // 处理识别开始
    onRecognitionStart() {
        console.log('Voice recognition started');
        this.showStatus('Listening... Speak now / 正在监听...请开始说话', 'success');
    }

    // Handle recognition results
    // 处理识别结果
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process recognition results
        // 处理识别结果
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update textarea with transcribed text
        // 用转录的文本更新文本区域
        if (finalTranscript) {
            const currentText = this.targetTextarea.value;
            const newText = currentText + (currentText ? ' ' : '') + finalTranscript;
            this.targetTextarea.value = newText;
            
            // Trigger input event to update word count
            // 触发输入事件以更新字数统计
            const inputEvent = new Event('input', { bubbles: true });
            this.targetTextarea.dispatchEvent(inputEvent);
            
            this.showStatus(`Added: "${finalTranscript}" / 已添加："${finalTranscript}"`, 'success');
        }

        // Show interim results as placeholder or in status
        // 在状态中显示临时结果
        if (interimTranscript) {
            this.showStatus(`Recognizing: "${interimTranscript}" / 识别中："${interimTranscript}"`, 'interim');
        }
    }

    // Handle recognition errors
    // 处理识别错误
    onRecognitionError(event) {
        console.error('Voice recognition error:', event.error);
        this.isListening = false;
        this.updateButtonState(false);

        let errorMessage = 'Voice recognition error / 语音识别错误';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Try speaking louder / 未检测到语音，请大声一些';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Check permissions / 无法访问麦克风，请检查权限';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow microphone access / 麦克风权限被拒绝，请允许麦克风访问';
                break;
            case 'network':
                errorMessage = 'Service unavailable. Speech recognition requires internet connection / 服务不可用，语音识别需要网络连接';
                break;
            case 'service-not-allowed':
                errorMessage = 'Speech service not available / 语音服务不可用';
                break;
            default:
                errorMessage = `Recognition error: ${event.error}. Try again / 识别错误：${event.error}，请重试`;
        }
        
        this.showError(errorMessage);
    }

    // Handle recognition end
    // 处理识别结束
    onRecognitionEnd() {
        this.isListening = false;
        this.updateButtonState(false);
        console.log('Voice recognition ended');
        
        // 自动重启监听，除非用户主动停止
        if (this.shouldRestart && this.recognition) {
            setTimeout(() => {
                if (!this.isListening) {
                    this.startListening();
                }
            }, 100);
        }
    }

    // Update button appearance and text
    // 更新按钮外观和文本
    updateButtonState(isListening) {
        if (!this.voiceButton) return;

        if (isListening) {
            this.voiceButton.textContent = '🔴 STOP';
            this.voiceButton.style.backgroundColor = '#ff4757';
            this.voiceButton.style.color = 'white';
            this.voiceButton.classList.add('listening');
        } else {
            this.voiceButton.textContent = 'VOICE INPUT';
            this.voiceButton.style.backgroundColor = '';
            this.voiceButton.style.color = '';
            this.voiceButton.classList.remove('listening');
        }
    }

    // Show status message
    // 显示状态消息
    showStatus(message, type = 'info') {
        // Create or update status element
        // 创建或更新状态元素
        let statusElement = document.getElementById('voice-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'voice-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
                z-index: 1000;
                max-width: 300px;
                word-wrap: break-word;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusElement);
        }

        statusElement.textContent = message;
        
        // Set colors based on type
        // 根据类型设置颜色
        switch (type) {
            case 'success':
                statusElement.style.backgroundColor = '#2ed573';
                statusElement.style.color = 'white';
                break;
            case 'error':
                statusElement.style.backgroundColor = '#ff4757';
                statusElement.style.color = 'white';
                break;
            case 'interim':
                statusElement.style.backgroundColor = '#ffa502';
                statusElement.style.color = 'white';
                break;
            default:
                statusElement.style.backgroundColor = '#3742fa';
                statusElement.style.color = 'white';
        }

        statusElement.style.display = 'block';

        // Auto-hide after 3 seconds (except for interim messages)
        // 3秒后自动隐藏（临时消息除外）
        if (type !== 'interim') {
            setTimeout(() => {
                if (statusElement) {
                    statusElement.style.display = 'none';
                }
            }, 3000);
        }
    }

    // Show error message
    // 显示错误消息
    showError(message) {
        this.showStatus(message, 'error');
    }

    // 只支持英语，移除多语言相关方法
}

// Initialize voice input when DOM is loaded
// DOM加载完成后初始化语音输入
const voiceInput = new VoiceInput();

// 移除语言选择功能，只支持英语

// Export for external use
// 导出供外部使用
window.voiceInput = voiceInput;
