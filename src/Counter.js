import React from 'react'; 

class Counter extends React.Component {
	constructor(props) {
    	super(props);
		
		this.state = {
			from: (props.from >= 0) ? props.from : 0,  // the number the element should start at
			to:  (props.to >= 0) ? props.to : 100,  // the number the element should end at
			duration: (props.duration) ? props.duration : 1000,  // how long it should take to count between the target numbers
			refreshInterval: (props.refreshInterval) ? props.refreshInterval : 100,  // how often the element should be updated
			decimals: (props.decimals) ? props.decimals : 0,  // the number of decimal places to show
			inverse: (props.inverse) ? props.inverse : false,
			units: (props.units) ? props.units : "",
			className: (props.className) ? props.className : "",
			id: (props.id) ? props.id : "counter",
			increment: 0,
			timer: 0,
			loops: 0,
			loopCounter: 0,
			value: (props.from) ? props.from : 0
		};
	}
	
    componentDidMount(){
		const duration = this.state.duration;
		const refreshInterval = this.state.refreshInterval;
		const inverse = this.state.inverse;
		const to = this.state.to;
		const from = this.state.from;
		const loops = Math.ceil( duration / refreshInterval);
        const increment = (inverse === false) ? (to - from) / loops :  (from - to) / loops * -1;
		
		console.log('mount contatore');
        this.setState({
			increment: increment,
			loops: loops,
			loopCounter: 0,
			value: from,
			timer: setInterval( () => this.updateCounter() , refreshInterval)
		});
	}
	
    componentWillUnmount(){
		this.stopCounter();
	}
	
	updateCounter() {
		const increment = this.state.increment;
		const loops = this.state.loops;
		const loopCounter = this.state.loopCounter + 1;
		const value = (loopCounter >= loops) ? this.state.to : (this.state.value + increment);
		
		console.log('update contatore');
		
		if (loopCounter >= loops) this.stopCounter();
		
		this.setState({
			loopCounter: loopCounter,
			value: value 
		});
	}
	
	stopCounter() {
		console.log('stop contatore');
		clearInterval(this.state.timer);
	}
	
	render() {
		const value = this.state.value;
		const decimals = this.state.decimals;
		const id = this.state.id;
		const units = this.state.units;
		const className = this.state.className + " counter";
		
		return <span key={id} id={id} className={className} >{value.toFixed(decimals)} {units}</span>;
	}
};


export default Counter;