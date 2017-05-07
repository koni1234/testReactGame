import React from 'react'; 

export function Button(props) {
	const classes = (props.className) ? props.className : "";
	
	const text = (props.value === "pause") ? "pause" : (props.value === "index") ? "home" : props.value;
	
	return (
		<button className={classes} onClick={(e) => (e.preventDefault(), props.onClick())}>
			{text}
    	</button>
  	);
}