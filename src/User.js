import React from 'react'; 
import {Button} from './Functions';

class UserPanel extends React.Component {
	constructor(props) {
    	super(props);
		
		this.state = {
			tempName: "",
			userName: ""
		};
		
		this.handleChangeLoginForm = this.handleChangeLoginForm.bind(this);
	}
	
	handleChangeLoginForm(e) { 
		this.setState({
			tempName: e.target.value
		});
	}
	
	submitLoginForm() {
		const userName = this.state.tempName;
		
		localStorage.setItem('userData', JSON.stringify({userName: userName}));
		this.setState({
			userName: userName
		});
	}
	
	reset() {
		localStorage.removeItem('userData');
		
		this.setState({
			tempName: "",
			userName: ""
		});
	}

	componentDidMount() { 
		const userData =  JSON.parse(localStorage.getItem('userData') || '{}');
		
		this.setState({
			userName: userData.userName
		});
	}
	
	renderLoginForm() {
		const value = this.state.tempName ;
		let visibilityBtnClass = "submit fa fa-arrow-circle-right ";
			
		if (value.length > 2 ) visibilityBtnClass += "animated fadeIn "
			
		return (<form>
				<h2>Accedi</h2>
				<label htmlFor="nome">Inserisci il tuo nome</label>
				<input name="nome"  autoComplete="off" value={value} className="nome" maxLength="6" onChange={this.handleChangeLoginForm} />
				<Button
						key="submit"
						value="procedi"
						className={visibilityBtnClass}
						onClick={() => this.submitLoginForm()}
					/>
				</form>);	
	}
	
	render() {
		const username = this.state.userName;
		const className = (!username || username === undefined || username.length < 3) ? 'userPanel loginForm animated fadeIn' : 'userPanel';
		let output = [];
		
		if(!username || username === undefined || username.length < 3) {
			output.push(this.renderLoginForm());
		}
		
		return (
			<div key="userPanel" className={className}>
				{output}
			</div>
    	);
	}
};


export default UserPanel;