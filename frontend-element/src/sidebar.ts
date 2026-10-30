import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import './signin'
import './signup'
import './chatFrame'
@customElement('app-sidebar')
export class AppSidebar extends LitElement {
    private _router=new Router(this,[
        {path:"/",render:() => html`
        <chat-frame></chat-frame>`},
        {path:"/sign-in",render:() => html`<sign-in></sign-in>`},
        {path:"/sign-up",render:() => html`<sign-up></sign-up>`}
    ])
    static styles = css`
        :host {
            display: flex;
            width: 100%;
            height: 100vh;
        }

        main {
            flex: 1;
            min-width: 0;
            height: 100vh;
            overflow: hidden;
        }

        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .sidebar {
            display: flex;
            flex-direction: column;
            width: 200px;
            height: 100vh;
            background-color: #f5f5f5;

        }
        li {
            list-style: none;
            padding: 10px;
            cursor: pointer;
        }
        .sidebar-nav {
            display: flex;
            justify-content: space-arround;
            align-items: center;
        }
        
        .sidebar-nav li:nth-child(1){
            font-weight: bold;
            width: 100%;
        }
        .sidebar-nav .toggle-collapse li:nth-child(2){
            width: 100%;
        }
        .selection .sign {
            display:flex;
            flex-direction:column;
            margin-top:10px;
        }
        form{
            display:flex;
            flex-direction:column;
            gap:20px;
            margin-top:20px;
        }
        form .input{
            display:flex;
            flex-direction:column
        }
        
    `

    private handleSignedUp = () => {
        window.open("/sign-up","_blank","noopener,noreferrer")
        
    }
    private handleSignedIn = () => {
        window.open("/sign-in","_blank","noopener,noreferrer")
    }
    @property({ type: Boolean }) collapsed = false;
    private handleCollapse() {
        const sidebarNav = this.shadowRoot?.querySelector(".sidebar-nav");
        if(sidebarNav){
            this.collapsed = !this.collapsed;
            console.log("collapsed: ", this.collapsed);
            if(this.collapsed){
                sidebarNav?.classList.toggle("toggle-collapse")
            }
        }
    }
    render() {
        return html`<div class="sidebar">
            <nav>
                <ul class="sidebar-nav">
                    <li>
                        Chatbot
                    </li>
                
                </ul>
            </nav>
            <div class="selection">
            <ul>
                <li>
                    <img src="https://img.icons8.com/ios/50/000000/chat.png" width="20px" height="20px"/>
                    New chat
                </li>
                <li>
                    <img src="https://img.icons8.com/ios/50/000000/search.png" width="20px" height="20px"/>
                    Search
                </li>
                <li>
                    <img src="https://img.icons8.com/ios/50/000000/document.png" width="20px" height="20px"/>
                    Document
                </li>
            </ul>
            <div class="sign">
                <button class="sign-button"  id="signUp" @click="${() => this.handleSignedUp()}">
                    Sign up
                </button>
            </div>
             <div class="sign">
                <button class="sign-button" id="signIn" @click = "${() => this.handleSignedIn()}">
                    Sign in
                </button>
            </div>
            </div>
        </div>

        <main>
            ${this._router.outlet()}
        </main>
        `;

    }
}