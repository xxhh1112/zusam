import { h, render, Component } from "preact";
import { alert, cache, http, lang, router } from "/core";
import zusam_logo from "/assets/zusam_logo.svg";

export default class Signup extends Component {

    constructor() {
        super();
        this.state = {
            showAlert: false,
            error: "",
            inviteKey: router.getParam("inviteKey")
        };
        this.sendSignupForm = this.sendSignupForm.bind(this);
    }

	sendSignupForm(e) {
		e.preventDefault();
        this.setState({showAlert: false});
		let login = document.getElementById("login").value || "";
        login.toLowerCase();
		const password = document.getElementById("password").value;
        cache.set("apiKey", "");
		http.post("/api/signup", {login: login, password: password, invite_key: this.state.inviteKey}).then(res => {
			if (res && !res.message) {
				cache.set("apiKey", res.api_key);
                setTimeout(() => router.navigate("/"), 100);
            } else {
                alert.add(lang[res.message]);
            }
		});
	}
    
    render() {
        return (
            <div class="signup">
                <div class="signup-form">
                    <img src={zusam_logo}/>
                    <div class="welcome lead">{lang["invitation_welcome"]}</div>
                    <form>
                        <div class="form-group">
                            <input type="email" class="form-control" required id="login" placeholder={lang.login_placeholder} />
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" required id="password" placeholder={lang.password_placeholder} />
                        </div>
                        <button type="submit" class="btn btn-light" onClick={this.sendSignupForm}>{lang.signup}</button>
                    </form>
                </div>
            </div>
        );
    }
}
