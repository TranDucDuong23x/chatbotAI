import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Task, TaskStatus} from '@lit/task'

@customElement("chat-frame")
export class chatFrame extends LitElement{
    @property({type:String}) private  message=""
    @property({type:Boolean}) private isPressed=false
    @state() private isResponse = false
    @property({type:Date}) private dateData=Date.now()
    @property({type:Number}) statusCode = 0
    private messages: String[]=[]
    static styles = css `
        :host {
            flex-grow:1;
        }

        .chat-frame{
            display: flex;
            min-height: 100vh;
            justify-content: center;
            align-items: center;
        }

        .chat-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        input{
            width: 100vh;
        }
        input[type="text"]{
           border:none;
           padding: 10px;
           border-radius: 20px;
           background-color: #f5f5f5;
        }
         
        .chat-input-container{
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            
        }
        .chat-input-container button {
            position: relative;
            left:-30px;
           z-index: 1;
           border:none;
            border-radius:20px;
            cursor:pointer;
            background:transperent;
        }
        .chat-frame {
            display:flex;
            flex-direction:column;
            justify-content: space-between;
        }
        
    `
    @property({type: String}) text = "";
    private handleInputChange(event: Event){
        const input = event.target as HTMLInputElement;
        this.text = input.value;
        
    }
    private recordSetting(){
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if(!SpeechRecognition){
            console.error("Speech recognition is not supported in this browser.");
            return;
        }
        else{
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VI';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results).map((result: any) => result[0]).map((result:any) => result.transcript).join('');
                this.text = transcript;
            }
            recognition.start()
        }
    }
    private async handleButtonSubmit(){
        if(this.text.length === 0){
            this.isPressed = false
            this.recordSetting()
        }
        else{
            this.isPressed = true
            this.dateData=Date.now()
            try {
                const request = await fetch("http://127.0.0.1:5000/api/ask",{
                    method:"POST",
                    headers:{
                        "content-type":"application/json"
                    },
                    body:JSON.stringify({
                        text_origin: this.text
                    })
                
                })
                this.statusCode =  request.status
                
            } catch (error) {
                console.error("Error: " + error)
            }
        }
    }
    
    private _logtask =  new Task(this,{
        task: async ([url],{signal}) => {
            const eventSource = new EventSource(url) 
            const queue: String[] = []
            let resolveNext: (()=>void) | null = null 
            
            const handleMessage = (e: MessageEvent) => {
                queue.push(e.data)
                if(resolveNext){
                    resolveNext() 
                    resolveNext = null
                }
            }

            const handleError = (e:Event) => {
                eventSource?.close()
            }

            eventSource?.addEventListener("message", handleMessage)
            eventSource?.addEventListener("error", handleError)

            signal.addEventListener("abort", () => {
                eventSource?.close()
                if(resolveNext){
                    resolveNext()
                }
            })
            try {
                while(!signal.aborted){
                    if(queue.length === 0){
                        await new Promise<void>((resolve)=>{
                            resolveNext=resolve
                        })
                    }
                    while(queue.length > 0 && !signal.aborted){
                        const chunk = queue.shift()?.replace(" ", "")
                        this.message += chunk
                    }
                }
            } catch (error) {
                console.error("error: " + error)
            } finally{
                eventSource?.removeEventListener("message", handleMessage)
                eventSource?.removeEventListener("error", handleError)
                signal.removeEventListener("abort", () => {
                    eventSource?.close()
                    if(resolveNext){
                        resolveNext()
                        resolveNext = null
                    }
                })
            }
        },
        args: () =>  [this.statusCode === 200? `http://127.0.0.1:5000/api/event-stream?${this.dateData}`:""] as const
    })
    renderLogTask(){
        if(this.message.length > 0){
            this.isResponse = true
        }
        if(!this.isResponse){
            return  html`<p>Đang khởi tạo câu trả lời cho câu hỏi này</p>`
        }
        else if(this.isResponse){
            return html`<ul class="response-content">
                        <li>${this.message}</li>
                    </ul>`
        }
    }
    render(){
        return html`<div class="chat-frame">
            ${this.isPressed ? html`<div>${this.renderLogTask()}</div>`:null}
            <div class="chat-content">
                <p>This is the chat frame</p>
                <div class="chat-input-container">
                    <input class="chat-input" .value="${this.text}" @input="${this.handleInputChange}" type="text" placeholder="Type your message here..." />
                    <button @click="${this.handleButtonSubmit}" class="send-button">
                        ${this.text.length === 0 ? html`<img src="https://img.icons8.com/ios/50/000000/microphone.png" width="20px" height="20px"/>` : html`<img src="https://img.icons8.com/ios/50/000000/paper-plane.png" alt="submit" width="20px" height="20px" />`}
                    </button>
                </div>
            </div>
        </div>`;
    }
}