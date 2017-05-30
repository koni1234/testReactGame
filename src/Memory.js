import React from 'react'; 
import {Button} from './Functions';
import Counter from './Counter';
import UserPanel from './User';
//import update from 'immutability-helper';
import './animate.css';
import './App.css';

function Square(props) {
	const found = (props.visible && props.found) ? true : false;
	const visible = (props.visible) ? true : false;
	const lastClicked = (props.clicked) ? true : false;
	const classes = (found) ? "visible found" : (visible) ? "visible" : (lastClicked) ? "clicked" : "";
	
	return (
		<button className={classes + " square"} onClick={() => props.onClick()}>
			<span className={(found) ? "animated fadeInUp" : ""}>{props.data.name}</span>
			<img className={(lastClicked && !found ) ? "animated fadeInOut" : ""} src={props.data.image} alt={props.data.name}/>
    	</button>
  	);
}

function SelectGame(props) {
	const classes = (props.className) ? props.className : "";  
	const text = props.game.name ;
	const selected = (props.selected) ? "selected" : ""; ;
	
	return (
		<button className={classes + " " + selected} data-game={props.game.name} onClick={() => props.onClick()}>
			<span>{text}</span>
			<img src={props.game.thumb} alt={props.game.name}/>
    	</button>
  	);
}

function SelectGameLevel(props) {
	const classes = (props.className) ? props.className : "";  
	const text = props.type ; 
	
	return (
		<button className={classes} data-gameLevel={props.type} onClick={() => props.onClick()}>
			<span>{text}</span>
    	</button>
  	);
}

function SelectGameMode(props) {
	const classes = (props.className) ? props.className : "";  
	const text = props.type ; 
	
	return (
		<button className={classes} data-gameLevel={props.type} onClick={() => props.onClick()}>
			<span>{text}</span>
    	</button>
  	);
}

class Board extends React.Component {
	constructor(props) {
    	super(props);
  		const squares = [];
		
		for(let i = 0, y ; i<(props.rows * props.cells); i++) {
			y = ( 1+i> (props.rows * props.cells)/2) ? 1+i - (props.rows * props.cells)/2 : 1+i ;
			squares[i] = {
				key: i,
				value: y,
				visible: false,
				found: false,
				firstView: false,
				data: ""
			}
		}
		
		this.state = {
			squares: squares.sort(function() { return 0.5 - Math.random() }),
			squareVisible: "",
			lastClickedSquare: "",
			rows: (props.rows) ? props.rows : 2,
			cells: (props.cells) ? props.cells : 2,
			pause: false,
			selectedGame: "",
			gameLevel: "",
			gameMode: "",
			startTime: "",
			time: "",
			timer: "",
			points: 0,
			lastPoints: 0,
			gameStatus: "",
			onShuffle: false
		};
		
		this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
		this.handleShuffleEnd = this.handleShuffleEnd.bind(this);
	}
	
    componentDidMount(){

        // componentDidMount is called by react when the component 
        // has been rendered on the page. We can set the interval here:

        this.setState({timer: setInterval( () => this.checkTimer() , 1000)});
		
	}
	
	componentDidUpdate(){
		const elm = this.refs.lastPoints;
		const board = this.refs.gameBoard;
		const onShuffle = this.state.onShuffle;
		
		if(elm!== undefined && elm.className === "") {
			elm.className = "animated fadeInOut";
			elm.addEventListener('animationend', this.handleAnimationEnd);
		}
		
		if(onShuffle) {
			const className = this.state.gameLevel + " animated shuffle game-board";
			board.className = className;
			board.addEventListener('animationend', this.handleShuffleEnd);
		}
	}
	
	checkTimer() {
		const winner = calculateWinner(this.state.squares);
		const pause = this.state.pause;
		const selectedGame = this.state.selectedGame; 
		const startTime = this.state.startTime;
		const mode = this.state.gameMode;
		const time = this.state.time;
			
		if(!pause && selectedGame && startTime && !winner && ( ( mode !== "time" ) || time > 0 )) {
			let mode = this.state.gameMode;
			let newTime = ( mode === "time") ? time - 1 : time + 1; 
			let looser = ( mode === "time" && newTime < 1 && !winner) ? true : false;
			
			if(looser) {
				this.setState({
					gameStatus: "lose",
					time: newTime 
				});
			}
			else {
				this.setState({time: newTime });
			}
			
			//shuffle
			let seconds = 15; //ogni 15 secondi provo a fare shuffle
			let tryShuffle = ( newTime % seconds === 0 && time !== 0 )  ? true : false;
			
			if( newTime % seconds === 0 && time !== 0 ) tryShuffle = true;
			if( tryShuffle && Math.random() >= 0.5) this.shuffle();
		}
	}

	handleClick(i) {
  		const squares = this.state.squares.slice();
		const gameStatus = this.state.gameStatus;
  		const squareVisible = this.state.squareVisible;
		let newState = {};
		
		
		if ( gameStatus === "win" || squareVisible === i || squares[i].visible === true ) {
			return;
		}
		
		if(squareVisible.toString().length && squares[squareVisible].value === squares[i].value) {
			//calc points
			let lastPoints = 50;
			
			if(!squares[i].firstView) lastPoints += 10;
			if(!squares[squareVisible].firstView) lastPoints += 10;
			
			let points = this.state.points + lastPoints;
			
			squares[i].visible = true;
			squares[i].found = true;
			squares[i].firstView = true;
			squares[squareVisible].found = true;
			squares[squareVisible].firstView = true;
			
			newState.squareVisible= "";
			newState.lastClickedSquare= "";
			newState.points= points;
			newState.lastPoints= lastPoints; 
		}
		else if(squareVisible.toString().length) {
			squares[i].firstView = true;
			squares[squareVisible].visible = false;
			squares[squareVisible].firstView = true;
			
			newState.squareVisible= "";
			newState.lastClickedSquare= i; 
		}
		else {
			squares[i].visible = true;
			newState.squareVisible= i;
			newState.lastClickedSquare= "";
		}
		
		const winner = calculateWinner(squares);
		let endGameCallback = () => {};
		
		if(winner) {
			newState.gameStatus= "win";	
			endGameCallback = () => { this.saveGame();};
		} 
		
		newState.squares= squares;
		this.setState(newState , endGameCallback);
	}
	
	handleShuffleEnd(e) {
		const elm = this.refs.gameBoard;
		const className = this.state.gameLevel + " game-board";
  		const squares = this.state.squares.slice();
  		const squareVisible = this.state.squareVisible;
		
		if(squareVisible.toString().length) {
			squares[squareVisible].visible = false;
			squares[squareVisible].firstView = true;
		}
		
		elm.removeEventListener('animationend', this.handleShuffleEnd );
		elm.className = className;
		
		this.setState({
			squares: squares.sort(function() { return 0.5 - Math.random() }),
			onShuffle: false,
			squareVisible: "",
			lastClickedSquare: ""
		});
	}
	
	handleAnimationEnd(e){
		const elm = this.refs.lastPoints;
		elm.removeEventListener('animationend', this.handleAnimationEnd );
		elm.className = "";
		
		this.setState({
			lastPoints: 0
		});
	}
	
	mainMenu(i) {
		let squares = [];
		
		for(let x = 0, y ; x<(this.state.rows * this.state.cells); x++) {
			y = ( 1+x> (this.state.rows * this.state.cells)/2) ? 1+x - (this.state.rows * this.state.cells)/2 : 1+x ;
			squares[x] = {
				key: x,
				value: y,
				visible: false,
				found: false,
				firstView: false,
				data: ""
			}
		}
		
		this.setState({
			squares: squares.sort(function() { return 0.5 - Math.random() }),
			squareVisible: "",
			lastClickedSquare: "",
			pause: false,
			gameStatus: "",
			selectedGame: "",
			gameLevel: "",
			gameMode: "",
			startTime: "",
			time: "",
			points: 0
		});
		
		this.userPanel.reset();
	}
	
	saveGame() {
		const userName = this.userPanel.state.userName;
		const selectedGame = this.state.selectedGame;
		const gameLevel = this.state.gameLevel; 
		const gameMode = this.state.gameMode;
		const time = this.state.time;
		const score = (gameMode === "time") ? this.state.points + ( time * 20 ) : this.state.points;
	
		this.userPanel.saveLog({
			userName:userName,
			selectedGame: selectedGame.name,
			gameLevel: gameLevel,
			gameMode: gameMode,
			points: score
		});
	}
	
	pauseGame(i) {
		this.setState({
			pause: true
		});
	}
	
	resumeGame(i) {
		this.setState({
			pause: false
		});
	}
	
	checkGame() {
		const gameLevel = this.state.gameLevel;
		const gameMode = this.state.gameMode;
		const selectedGame = this.state.selectedGame;
		const startTime = this.state.startTime;
		
		if(selectedGame && gameLevel && gameMode && !startTime) this.startGame();
		
	}
	
	startGame(){
		const gameLevel = this.state.gameLevel; 
		const selectedGame = this.state.selectedGame;
		const time = ( this.state.gameMode === "time") ? 60 : 0;
		
		const cells = (gameLevel === "easy") ? 3 : (gameLevel === "medium") ? 4 : 5;
		const rows = (gameLevel === "easy") ? 4 : (gameLevel === "medium") ? 5 : 6; 
		let squares = [];
		const sortedData = selectedGame.data.sort(function() { return 0.5 - Math.random() });
		
		for(let x = 0, y ; x<( rows * cells); x++) {
			y = ( 1+x> ( rows * cells)/2) ? 1+x - (rows * cells)/2 : 1+x ;
			squares[x] = {
				key: x,
				value: y,
				visible: false,
				found: false,
				firstView: false,
				data: sortedData[y - 1]
			}
		}
		
		this.setState({
			squares: squares.sort(function() { return 0.5 - Math.random() }),
			rows: rows,
			cells: cells,
			gameStatus: "",
			squareVisible: "",
			pause: false,
			startTime: Date.now(),
			time: time,
			points: 0,
			lastPoints: 0,
			onShuffle: false
		});
	}
	
	selectGame(i) {
		this.setState({
			squares: [],
			gameLevel: "",
			gameMode: "",
			selectedGame: i.game,
		});
	}
	
	shuffle() {
		this.setState({
			onShuffle: true,
		});
	}
	
	selectGameLevel(i) {
		this.setState({
			gameMode: "",
			gameLevel: i.type,
		});
	}
	
	selectGameMode(i){
		this.setState({
			gameMode: i.type,
		},this.checkGame);
	}
	
	renderGameSelection() {
		const gamesx = games();
		const selectedGame = this.state.selectedGame;
		const gameLevel = this.state.gameLevel;
		let output = [],
			i = 0;
		
		gamesx.forEach((game) => {
		
			if(selectedGame.name === game.name) {
				if(gameLevel) {
					output.push(<li key={'game' + i}>{
						this.renderSelectGame({game: game , className:"selectGame " , selected: (selectedGame.name === game.name) ? true : false  })}
						   {this.renderGameLevelSelection()}{this.renderGameModeSelection()
					}</li>);
				}
				else {
					output.push(<li key={'game' + i}>{
						this.renderSelectGame({game: game , className:"selectGame " , selected: (selectedGame.name === game.name) ? true : false  })}
						   {this.renderGameLevelSelection()
					}</li>);
				}
			}
			else {
				output.push(<li key={'game' + i}>{
					this.renderSelectGame({game: game , className:"selectGame" , selected: (selectedGame.name === game.name) ? true : false  })
				}</li>);
			}
			i++;
		});
		
		return (
			<ul key={'gameSelection'} className="gameSelection">
			{output}
			</ul>
		);
	}
	
	renderGameLevelSelection() {
		const animation = this.state.gameLevel ? "animated slideOutLeft" : "animated fadeIn";
		return(<div key={'renderGameLevelSelection'} className={"gameLevelSelection " + animation}>
			   <div key={'sub'}>
			   {this.renderSelectGameLevel({type:"easy", className:"easy fa fa-th-large"})}
			   {this.renderSelectGameLevel({type:"medium", className:"medium fa fa-th"})}
			   {this.renderSelectGameLevel({type:"hard", className:"hard fa fa-th"})}
			   </div></div>);
	}
	
	renderGameModeSelection() {
		return(<div key={'renderGameModeSelection'} className="gameModeSelection animated slideInRight">
			   <div key={'sub'}>
			   {this.renderSelectGameMode({type:"time", className:"time fa fa-clock-o"})}
			   {this.renderSelectGameMode({type:"free", className:"free fa fa-flash"})}
			   </div></div>);
	}
	
	renderTopBar() {
		let output = [];
		
		output.push(this.renderButton({type:"pause", className:"pause fa fa-pause-circle-o" }));
		output.push(this.renderGamePoints());
		output.push(this.renderTimer());
		
		return (<div key={'topBar'} className={'topBar'}>
			{output}
		</div>);
	}
				
	renderPauseMenu() {
		let output = [];
		output.push(this.renderButton({type:"close", className:"close fa-times-circle-o" }));
		output.push(this.renderButton({type:"continue", className:"continue fa fa-play" }));
		output.push(this.renderButton({type:"restart", game:this.state.selectedGame, className:"restart fa fa-repeat"}));
		output.push(this.renderButton({type:"index", className:"home fa fa-home" }));
			
		return (<div key={'pauseMenu'} className={'pauseMenu animated fadeIn'}>
			{output}
		</div>);		
	}

	renderEndGameMenu() {
		const winner = this.state.gameStatus === "win" ? true : false;
		const status = ( winner === true ) ? 'Hai vinto!' : 'Hai perso!';
		const cssClass = ( winner === true ) ?  "status win animated fadeIn" : "status lose animated fadeIn"; 
		let output = [];
				
		output.push(<div key="endGameMenu" className={cssClass}>
			<span className="animated infinite pulse" key="endGameMenuStatus">{status}</span>
			{this.renderScore()}
			{this.renderButton({type:"play again", game:this.state.selectedGame, className:"continue fa fa-play", })}
			{this.renderButton({type:"index", className:"continue fa fa-home", })}
		</div>);
		
		return output;
	}
			
	renderBoard() {
		const rows = this.state.rows;
		let className = this.state.gameLevel + " game-board";
		let output = [];
	  
		for(let i = 0; i<rows; i++) {
			output.push(this.renderRow(i));
		}
	  
		return (
			<div key={'game-board'} ref="gameBoard" className={className}>
				{output}
			</div>
		);
	}
	
	renderRow(i) {
		const cells = this.state.cells;
		let output = [];
	  
		for(let y = 0; y<cells; y++) {
			output.push(this.renderSquare(y+(i*cells)));
		}
		
		return (
			<div className="board-row" key={i}>
				{output}
			</div>
		);
	}
  
	renderSquare(i) {
    	return <Square 
			key={this.state.squares[i].key} 
			found={this.state.squares[i].found} 
			clicked={(this.state.lastClickedSquare === i ) ? true : false}
			visible={this.state.squares[i].visible} 
			data={this.state.squares[i].data} 
			value={this.state.squares[i].value} 
			onClick={() => this.handleClick(i)} 
		/>;
	}
	
	renderSelectGame(i) {
		return <SelectGame
			key={i.type}
			value={i.type}
			game={i.game}
			selected={i.selected}
			className={i.className}
			onClick={() => this.selectGame(i)}
		/>;
	}
			
	renderSelectGameLevel(i) {
		return <SelectGameLevel
			key={i.type}
			type={i.type}
			value={i.type}
			className={i.className}
			onClick={() => this.selectGameLevel(i)}
		/>;
	}	
			
	renderSelectGameMode(i) {
		return <SelectGameMode
			key={i.type}
			type={i.type}
			value={i.type}
			className={i.className}
			onClick={() => this.selectGameMode(i)}
		/>;
	}
	
	renderButton(i) {
		if(i.type === "play again" || i.type === "restart" )
		return <Button
			key={i.type}
			value={i.type}
			game={i.game}
			className={i.className}
			onClick={() => this.startGame(i)}
		/>;
		else if(i.type === "index" )
		return <Button
			key={i.type}
			value={i.type}
			className={i.className}
			onClick={() => this.mainMenu(i)}
		/>;
		else if(i.type === "continue" || i.type === "close" )
		return <Button
			key={i.type}
			value={i.type}
			className={i.className}
			onClick={() => this.resumeGame(i)}
		/>;
		else if(i.type === "pause" )
		return <Button
			key={i.type}
			value={i.type}
			className={i.className}
			onClick={() => this.pauseGame(i)}
		/>;
	}
			
	renderScore() {
		const gameStatus= this.state.gameStatus;
		const gameMode = this.state.gameMode;
		const time = this.state.time;
		const score = (gameMode === "time") ? this.state.points + ( time * 20 ) : this.state.points;
		
		let output = [];
		
		if(gameMode === "time" && gameStatus === "win") {
			output.push(<Counter
				from={time} 
				units="seconds"
				to={0} 
				id="counter_inverse"
				inverse={true}
				className="animated fadeOut"
				duration={2500}
				refreshInterval={10}
			/>);
		} 
		output.push(<Counter 
						from={0} 
						className="animated zoomScaleIn"
						to={score} 
						units="points"
						duration={2500}
						refreshInterval={10}
						/>);
					 
		return output;
	}
	
	renderTimer(i) {
		const seconds = this.state.time;
 
        return <div key="timer" className="timer"><span >{seconds}</span></div>;
	}
			
	renderGamePoints(){
		const points = this.state.points;
		const lastPoints = this.state.lastPoints;
		const cssClass = (parseInt(lastPoints) > 0 ) ? "" : "hidden";//animated fadeOut
		let output = [];
 
	  	output.push(<span className={cssClass} ref="lastPoints">+{lastPoints}</span>);
					
		
		output.push(<span className="" >{points} <i className="fa fa-trophy"></i></span>);
			
        return <div key="points" className="points">{output}</div>;
	}
	
	render() {
		const gameStatus = this.state.gameStatus;
	  	const pause = this.state.pause;
		const gameLevel = this.state.gameLevel;
		const gameMode = this.state.gameMode;
		const startTime = this.state.startTime;
		
		let output = [];
		
		//includo component user con ref x richiamare metodi parent/child
		output.push(<UserPanel ref={(userPanel) => { this.userPanel = userPanel; }}  />);
		
	  	if (gameStatus === "win" || gameStatus === "lose") {
			output.push(this.renderEndGameMenu());
		}
		
		
		if(this.state.selectedGame && gameLevel && gameMode && startTime) {
			if(pause === true) {
				output.push(this.renderPauseMenu());
			}
			output.push(this.renderTopBar());
			output.push(this.renderBoard());
		}
		else {
			output.push(<h1 key="title">Select a game</h1>);
			output.push(this.renderGameSelection());
		}
    
		return (
			<div key="game" className="game">
				{output}
			</div>
    	);
  	}
}

class Game extends React.Component {
  render() {
    return (
      <div>
          <Board rows={5} cells={6}/>
      </div>
    );
  }
}

function calculateWinner(squares) {
	let winner = true;
	
	if(squares.length > 0) {
		
		squares.forEach((square) => {
			if(square.found === false ) winner = false ;
		}); 
	}
	else {
		winner = false ;
	} 
	
	return winner;
}

function games(i,y) {
	const data = [
		{ 
			name: 'Lego Super Heroes',
			thumb: 'http://media.comicbook.com/2015/12/lego-justice-league---cosmic-clash-162065.jpg',
			data: [
			{
				name: 'Hulk ',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/mugshots/2016/76065_1to1_mf_hulk_336.png?l.r2=1785523228'
			},
			{
				name: 'Magneto',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2017/76073_1to1_mf_mugshot_magneto_336.png?l.r2=-125388413'
			},
			{
				name: 'Iron Man',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2017/76072_1to1_mf_mugshot_iron_man_336.png?l.r2=1372266114'
			},
			{
				name: 'Goblin',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2016/76064_1to1_mf_mugshot_green_goblin_336.png?l.r2=-1567420428'
			},
			{
				name: 'Wonder Woman',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2017/76070_1to1_mf_mugshot_wonder_woman_336.png?l.r2=257901294'
			},
			{
				name: 'Batman',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/mugshot%202016/76061_1to1_mf_batman_336.png?l.r2=-798905063'
			},
			{
				name: 'Catwoman',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/mugshot%202016/76061_1to1_mf_mugshot_catwoman_336.png?l.r2=-1981519508'
			},
			{
				name: 'Joker',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/new%202hy%202015/76035_joker_912x516_360w_2x.png?l.r2=-680540174'
			},
				{
				name: 'Spiderman',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/mugshots/2016/76064_1to1_mf_spider_man_336.png?l.r2=-1183066193'
			},
			{
				name: 'Robin',
				image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/lbm%20characters/primary/70902_1to1_robin_360_480.png?l.r2=-84004269'
			},
			{
				name: 'Enigmista',
				image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/lbm%20characters/primary/70903_1to1_riddler_360_480.png?l.r2=942447265'
			},
			{
				name: 'Poison Ivy',
				image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/lbm%20characters/primary/70908_1to1_poisonivy_360_480.png?l.r2=754989105'
			},
			{
				name: 'Batgirl',
				image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/lbm%20characters/primary/70902_1to1_batgirl_360_480.png?l.r2=-1989911370'
			},
			{
				name: 'Superman',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/mugshot%202016/76044_superman_720x960.png?l.r2=1097915692'
			},
			{
				name: 'Flash',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/dc/mugshots/thumbs/76012_flash_1488x1984_mugshot_360w.png?l.r2=273087807'
			},
			{
				name: 'Wolverine',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2017/76073_1to1_mf_mugshot_wolverine_336.png?l.r2=737591422'
			},
			{
				name: 'Capitan America',
				image: 'https://lc-www-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/marvel/2015/thumbnail/76032_captamerica_1488x1984_360w.png?l.r2=-526024371'
			},
				
				
				
				
				
				
				
				
				
			
			]
		},
		{
			name: 'Hot Wheels',
			thumb: 'http://www.theteachersalaryproject.org/wp-content/uploads/2016/12/Hot-Wheels-Race-Off-Cheats.png',
			data: [
				{
					name: 'Lamborghini',
					image: 'http://media.mattel.com/root/Images/MainImage/dhr00_lamborghini_huracan_lp.jpg'
				},
				{
					name: 'Porsche',
					image: 'http://media.mattel.com/root/Images/MainImage/dhx85_porsche_carrera_gt.jpg'
				},
				{
					name: 'Honda',
					image: 'http://media.mattel.com/root/Images/MainImage/dhr05_1985_honda_cr_x.jpg'
				},
				{
					name: 'Cruiser Bruiser',
					image: 'http://media.mattel.com/root/Images/MainImage/dhw97_cruise_bruiser.jpg'
				},
				{
					name: 'Arrow Dynamic',
					image: 'http://media.mattel.com/root/Images/MainImage/dhw69_arrow_dynamic.jpg'
				},
				{
					name: 'Corvette',
					image: 'http://media.mattel.com/root/Images/MainImage/dhx34_corvette_stingray.jpg'
				},
				{
					name: 'Ford',
					image: 'http://media.mattel.com/root/Images/MainImage/dhx43_15_ford_f_150.jpg'
				},
				{
					name: 'Roadster',
					image: 'http://media.mattel.com/root/Images/MainImage/dhx31_corvette_grand_sport_roadster.jpg'
				},
				{
					name: 'Fast Gassin',
					image: 'http://media.mattel.com/root/Images/MainImage/dhr67_fast_gassin.jpg',
				},
				{
					name: 'Aston Martin',
					image: 'http://media.mattel.com/root/Images/MainImage/dhp81_aston_martin_v8_vantage.jpg',
				},
				{
					name: 'Maelstrom',
					image: 'http://media.mattel.com/root/Images/MainImage/dlh90_maelstrom.jpg',
				},
				{
					name: 'F-Racer',
					image: 'http://media.mattel.com/root/Images/MainImage/dhy15_f_racer.jpg',
				},
				{
					name: 'Anthracite',
					image: 'http://media.mattel.com/root/Images/MainImage/dmy63_anthracite.jpg',
				},
				{
					name: 'T-Rextroyer',
					image: 'http://media.mattel.com/root/HWCarsCatalog/Web/Thumbnail/DHT36_c_16_003.png',
				},
				{
					name: 'Dodge Charger',
					image: 'http://media.mattel.com/root/HWCarsCatalog/Web/Thumbnail/DHR06_c_16_003.png',
				},
				{
					name: 'Ford GT',
					image: 'http://media.mattel.com/root/HWCarsCatalog/Web/Thumbnail/DHX89_c_16_003.png',
				}
			]
		},
		{
			name: 'Lego Star Wars',
			thumb: 'https://lc-www-live-s.legocdn.com/r/www/r/starwars/-/media/franchises/starwars2015/misc/tfa_cta_744x421.jpg?l.r2=-521045527',
			data: [
				{
					name: 'Anakin Skywalker',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75087_anakin-skywalker_mugshot_672x896.png?l.r2=-1927119629'
				},
				{
					name: 'C-3PO',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75136_c3po_mugshot_672x896.png?l.r2=808884488'
				},
				{
					name: 'Tarpals',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/captain%20tarpals.png?l.r2=993879118'
				},
				{
					name: 'Chewbacca',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/chewbacca.png?l.r2=995439909'
				},
				{
					name: 'Ewok',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/ewok.png?l.r2=479800828'
				},
				{
					name: 'Kanan Jarrus',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75141_kanan-jarrus_mugshot_672x896.png?l.r2=-347871137'
				},
				{
					name: 'Luke Skywalker',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/luke-skywalker.png?l.r2=244429617'
				},
				{
					name: 'Yoda',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75142_yoda_mugshot_672x896.png?l.r2=-131520165'
				},
				{
					name: 'Darth Vader',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/darth%20vader.png?l.r2=1578037663',
				},
				{
					name: 'Stormtrooper',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/first-order-stormtrooper.png?l.r2=-1265670965',
				},
				{
					name: 'Guardia Ombra',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75079_shadow-guard_mugshot_672x896.png?l.r2=1075935474',
				},
				{
					name: 'Kylo Ren',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75139_kylo-ren_mugshot_672x896.png?l.r2=-792116255',
				},
				{
					name: 'Emperor Palpatine',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/emperorpalpatine.png?l.r2=1503064260',
				},
				{
					name: 'Darth Maul',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/darth%20maul.png?l.r2=-542587956',
				},
				{
					name: 'R2-D2',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/new%20full%20body/updated/75136_r2d2_mugshot_672x896.png?l.r2=1012310864',
				},
				{
					name: 'Princess Leyla',
					image: 'https://mi-od-live-s.legocdn.com/r/www/r/catalogs/-/media/catalogs/characters/star%20wars/2016/672x896/mugshot_672x896_0006s_0016_princess-leia.png?l.r2=120060852',
				}
			]
		},
		{
			name: 'Curious George',
			thumb: 'http://cdn3-www.comingsoon.net/assets/uploads/2016/08/curious-george-header1.jpg',
			data: [
				{
					name: 'George',
					image: 'http://blogs.lsc.org/files/2016/11/1274710264curious_george_banana_820x1250.jpg'
				},
				{
					name: 'Maggiordomo',
					image: 'https://img.clipartfest.com/3acdae0f18b4815abd3f618c84df858b_1000-images-about-curious-curious-george-characters-clipart_633-475.jpeg'
				},
				{
					name: 'Pasticciere',
					image: 'https://img.clipartfest.com/538d029ffc062eb1bd25c99a882dd0ac_1000-images-about-curious-curious-george-characters-clipart_633-475.jpeg'
				},
				{
					name: 'Angly',
					image: 'https://img.clipartfest.com/f8593ff7d671ee820efdc04546b7088e_1000-ideas-about-curious-curious-george-characters-clipart_633-475.jpeg'
				},
				{
					name: 'Polpetta',
					image: 'https://s-media-cache-ak0.pinimg.com/736x/11/10/34/111034ed0bd24fb2da255cff7beb6d41.jpg'
				},
				{
					name: 'Bill',
					image: 'http://vignette3.wikia.nocookie.net/curious-george/images/b/ba/Bill.png/revision/latest?cb=20150528191019'
				},
				{
					name: 'Allie',
					image: 'http://vignette4.wikia.nocookie.net/curious-george/images/7/7f/Allie_Whoops.png/revision/latest?cb=20150528191541'
				},
				{
					name: 'Signore dal cappello giallo',
					image: 'https://s-media-cache-ak0.pinimg.com/736x/0a/3c/c9/0a3cc9666ca267aae5c1a210c0b3addc.jpg'
				},
				{
					name: 'Professoressa Wiseman',
					image: 'https://s-media-cache-ak0.pinimg.com/564x/3c/4a/47/3c4a476cb03130ebc34f9ba869d4bf75.jpg',
				},
				{
					name: 'Charkie',
					image: 'https://s-media-cache-ak0.pinimg.com/736x/85/70/e4/8570e455075f64d7db934d181c3bd51f.jpg',
				},
				{
					name: 'George',
					image: 'https://img.clipartfest.com/f50a3af42583000bc2b4fabcaabb48bf_curious-george-curious-george-characters-clipart_600-400.png',
				},
				{
					name: 'George',
					image: 'https://s-media-cache-ak0.pinimg.com/736x/90/3d/47/903d47255bebe297bc6a5c94a04f94a0.jpg',
				},
				{
					name: 'George',
					image: 'http://www.wfyi.org/files/image/curious-george.jpg',
				},
				{
					name: 'George',
					image: 'https://marchfirstweek.files.wordpress.com/2014/06/george-girls.jpg',
				},
				{
					name: 'George',
					image: 'https://s-media-cache-ak0.pinimg.com/736x/ee/ed/d9/eeedd972f1469b55f97e143ba81c984f.jpg',
				}
			]
		}
		
	];
	/*
		lego:[
		],
		hotwheels:[
			
		]
	};*/
	return (y !== undefined && data[i] && data[i][y]) ? data[i][y] : (i !== undefined && data[i] ) ? data[i] : data;
}

// ========================================




export default Game;
