import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("sign-in")
export class SignIn extends LitElement {
    static styles = css`
        :host {
            display: grid;
            place-items: center;
            min-height: 100%;
            padding: 24px;
            box-sizing: border-box;
        }

        .signin-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: min(360px, 100%);
            padding: 32px;
            border: 1px solid #d8d8d8;
            border-radius: 8px;
            box-sizing: border-box;
            box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
        }

        h1 {
            margin: 0 0 8px;
            text-align: center;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        label {
            font-weight: 600;
        }

        input, button {
            font: inherit;
        }

        input {
            padding: 10px 12px;
            border: 1px solid #b8b8b8;
            border-radius: 4px;
        }

        button {
            padding: 10px 12px;
            border: 0;
            border-radius: 4px;
            background: #2563eb;
            color: white;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }
    `;

    private handleSubmit(event: SubmitEvent) {
        event.preventDefault();
    }

    render() {
        return html`
            <form class="signin-form" @submit=${this.handleSubmit}>
                <h1>Đăng nhập</h1>

                <div class="form-field">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        autocomplete="email"
                        required
                    />
                </div>

                <div class="form-field">
                    <label for="password">Mật khẩu</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        autocomplete="current-password"
                        required
                    />
                </div>

                <button type="submit">Đăng nhập</button>
            </form>
        `;
    }
}