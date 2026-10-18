import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

const placeholder = [
    ""
]

@customElement("chat-frame")
export class chatFrame extends LitElement{
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
        img{
           
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
    private handleButtonSubmit(){
        if(this.text.length === 0){
            this.recordSetting()
        }
        else{
            this.text=''
        }
    }
    render(){
        return html`<div class="chat-frame">
            <div class="chat-content">
                <p>This is the chat frame</p>
                <div class="chat-input-container">
                    <input class="chat-input" .value="${this.text}" @input="${this.handleInputChange}" type="text" placeholder="Type your message here..." />
                    <button @click="${this.handleButtonSubmit}">
                        ${this.text.length === 0 ? html`<img src="https://img.icons8.com/ios/50/000000/microphone.png" width="20px" height="20px"/>` : html`<img src="https://img.icons8.com/ios/50/000000/paper-plane.png" alt="submit" width="20px" height="20px" />`}
                    </button>
                </div>
            </div>
        </div>`;
    }
}