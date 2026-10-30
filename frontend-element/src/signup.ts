import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("sign-up")
export class SignUp extends LitElement {
    static styles = css`
        :host {
            display: grid;
            place-items: center;
            min-height: 100%;
            padding: 24px;
            box-sizing: border-box;
        }

        .signup-form {
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

        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const password = formData.get("password")?.toString() ?? "";
        const confirmPassword = form.elements.namedItem("confirmPassword") as HTMLInputElement;

        if (password !== formData.get("confirmPassword")?.toString()) {
            confirmPassword.setCustomValidity("Mật khẩu xác nhận không khớp");
            confirmPassword.reportValidity();
            return;
        }

        confirmPassword.setCustomValidity("");
    }

    private handlePasswordConfirmation(event: InputEvent) {
        const confirmPassword = event.currentTarget as HTMLInputElement;
        const form = confirmPassword.form;
        const password = form?.elements.namedItem("password") as HTMLInputElement | null;
        confirmPassword.setCustomValidity(
            password && confirmPassword.value !== password.value
                ? "Mật khẩu xác nhận không khớp"
                : ""
        );
    }

    render() {
        return html`
            <form class="signup-form" @submit=${this.handleSubmit}>
                <h1>Đăng ký</h1>

                <div class="form-field">
                    <label for="username">Tên người dùng</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Nhập tên người dùng"
                        autocomplete="username"
                        required
                    />
                </div>

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
                        autocomplete="new-password"
                        required
                    />
                </div>

                <div class="form-field">
                    <label for="confirmPassword">Xác nhận mật khẩu</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        autocomplete="new-password"
                        @input=${this.handlePasswordConfirmation}
                        required
                    />
                </div>

                <button type="submit">Đăng ký</button>
            </form>
        `;
    }
}