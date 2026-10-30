import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit/task';

interface ChatItem {
    question: string;
    answer: string;
}

@customElement("chat-frame")
export class chatFrame extends LitElement {
    @property({ type: String }) text = "";
    @state() private history: ChatItem[] = [];
    @state() private currentQuestion: string = "";
    @state() private currentAnswer: string = "";
    @state() private isGenerating: boolean = false;
    @property({ type: Date }) private dateData = Date.now();
    @property({ type: Number }) statusCode = 0;

    static styles = css`
        :host {
            display: block;
            flex: 1;
            min-width: 0;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .chat-frame {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 24px;
            background-color: #ffffff;
        }

        .chat-header {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .chat-history {
            flex: 1;
            width: min(760px, 100%);
            margin: 0 auto;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 16px 12px;
        }

        .message-pair {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
        }

        .user-bubble {
            align-self: flex-end;
            background-color: #0084ff;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 18px 18px 4px 18px;
            max-width: 80%;
            word-break: break-word;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .bot-bubble {
            align-self: flex-start;
            background-color: #f0f2f5;
            color: #1c1e21;
            padding: 12px 18px;
            border-radius: 18px 18px 18px 4px;
            max-width: 85%;
            word-break: break-word;
            font-size: 14px;
            line-height: 1.6;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .bot-loading {
            align-self: flex-start;
            color: #888;
            font-style: italic;
            font-size: 13px;
            padding: 8px 12px;
        }

        .chat-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: min(760px, 100%);
            margin: 0 auto;
            padding-top: 12px;
        }

        .chat-input-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            position: relative;
        }

        input[type="text"] {
            box-sizing: border-box;
            width: 100%;
            border: 1px solid #e0e0e0;
            padding: 12px 50px 12px 20px;
            border-radius: 24px;
            background-color: #f8f9fa;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, background-color 0.2s;
        }

        input[type="text"]:focus {
            border-color: #0084ff;
            background-color: #ffffff;
        }

        .send-button {
            position: absolute;
            right: 10px;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }

        .send-button:hover {
            background-color: #e4e6eb;
        }
        
    `;

    private handleInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.text = input.value;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.handleButtonSubmit();
        }
    }

    private recordSetting() {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition is not supported in this browser.");
            return;
        } else {
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VI';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results).map((result: any) => result[0]).map((result: any) => result.transcript).join('');
                this.text = transcript;
            };
            recognition.start();
        }
    }

    private async handleButtonSubmit() {
        const queryText = this.text.trim();
        if (queryText.length === 0) {
            this.recordSetting();
            return;
        }
        if (this.currentQuestion && this.currentAnswer) {
            this.history = [...this.history, { question: this.currentQuestion, answer: this.currentAnswer }];
        }

        this.currentQuestion = queryText;
        this.currentAnswer = "";
        this.isGenerating = true;
        this.text = ""; 
        this.statusCode = 0;

        try {
            const request = await fetch("http://127.0.0.1:5000/api/ask", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    text_origin: queryText
                })
            });
            
            if (request.ok) {
                this.dateData = Date.now();
                this.statusCode = request.status;
            } else {
                this.isGenerating = false;
            }
        } catch (error) {
            console.error("Error: " + error);
            this.isGenerating = false;
        }
    }

    private _logtask = new Task(this, {
        task: async ([url], { signal }) => {
            if (!url) return;
            const eventSource = new EventSource(url);
            const queue: string[] = [];
            let resolveNext: (() => void) | null = null;

            const handleMessage = (e: MessageEvent) => {
                if (e.data === '[DONE]' || e.data.trim() === '[DONE]') {
                    eventSource.close();
                    this.isGenerating = false;
                    return;
                }
                queue.push(e.data);
                if (resolveNext) {
                    resolveNext();
                    resolveNext = null;
                }
            };

            const handleError = () => {
                eventSource.close();
                this.isGenerating = false;
            };

            eventSource.addEventListener("message", handleMessage);
            eventSource.addEventListener("error", handleError);

            signal.addEventListener("abort", () => {
                eventSource.close();
                if (resolveNext) resolveNext();
            });

            try {
                while (!signal.aborted) {
                    if (queue.length === 0) {
                        await new Promise<void>((resolve) => {
                            resolveNext = resolve;
                        });
                    }
                    while (queue.length > 0 && !signal.aborted) {
                        const chunk = queue.shift()?.replace(" ", "") || "";
                        this.currentAnswer += chunk;
                    }
                }
            } catch (error) {
                console.error("error: " + error);
            } finally {
                eventSource.removeEventListener("message", handleMessage);
                eventSource.removeEventListener("error", handleError);
                eventSource.close();
            }
        },
        args: () => [this.statusCode === 200 ? `http://127.0.0.1:5000/api/event-stream?${this.dateData}` : ""] as const
    });

    render() {
        return html`
            <div class="chat-frame">
                <div class="chat-header">
                    <h3>Chatbot hỗ trợ và tư vấn linh kiện máy tính</h3>
                </div>

                <div class="chat-history">
                    ${this.history.map(item => html`
                        <div class="message-pair">
                            <div class="user-bubble">${item.question}</div>
                            <div class="bot-bubble">${item.answer}</div>
                        </div>
                    `)}

                    ${this.currentQuestion ? html`
                        <div class="message-pair">
                            <div class="user-bubble">${this.currentQuestion}</div>
                            ${this.currentAnswer ? html`
                                <div class="bot-bubble">${this.currentAnswer}</div>
                            ` : (this.isGenerating ? html`
                                <div class="bot-loading">Đang suy nghĩ và tạo câu trả lời...</div>
                            ` : null)}
                        </div>
                    ` : null}
                </div>

                <div class="chat-content">
                    <div class="chat-input-container">
                        <input 
                            class="chat-input" 
                            .value="${this.text}" 
                            @input="${this.handleInputChange}" 
                            @keydown="${this.handleKeyDown}"
                            type="text" 
                            placeholder="Nhập câu hỏi của bạn (nhấn Enter để gửi)..." 
                        />
                        <button @click="${this.handleButtonSubmit}" class="send-button">
                            ${this.text.length === 0 
                                ? html`<img src="https://img.icons8.com/ios/50/000000/microphone.png" width="20px" height="20px"/>` 
                                : html`<img src="https://img.icons8.com/ios/50/000000/paper-plane.png" alt="submit" width="20px" height="20px" />`}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
