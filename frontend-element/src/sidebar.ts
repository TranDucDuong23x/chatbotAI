import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
    static styles = css`
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
    
    `
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
                        ChatbotAI
                    </li>
                    <li @click="${this.handleCollapse}" class="collapse-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <path d="M9 3v18"/>
                        <path d="m16 15-3-3 3-3"/>
                        </svg>
                    </li>
                </ul>
            </nav>
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
        </div>`;
    }
}