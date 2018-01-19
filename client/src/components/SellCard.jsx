import React from 'react';



class SellCard extends React.Component {

  constructor(props) {
  	super(props)
  	this.state = {
  	  total: 0,
  	  checked: 'market'
  	}
  }

  onFormEntry(volume, price) {
  	this.setState({
  	  total: volume * price
  	})
  }

  onRadioClick(val) {
  	console.log(val);
  	this.setState({
  	  checked: val 
  	})
  }

  render() {
  	var coin = this.props.currentCoin.split('/')[0];
  	var balance = null;
  	if (coin === 'BTC') {
  	  balance = <span> {this.props.btcBalance} </span>
  	} else if (coin === 'ETH') {
  	  balance = <span> {this.props.ethBalance} </span>
  	} else if (coin === 'XRP') {
  	  balance = <span> {this.props.xrpBalance} </span>
  	}
  	var submission = null;
  	if (this.state.checked === 'market') {
  	  submission = <div>
	  		  <div id = 'selectVolume' className = 'field'>
	  		  	<h5> Amount to Sell </h5>
	  		  	<input type = 'text' id = 'sellVolume' placeholder = '0.00 USD'/>
	  		  </div>
	  		  <div id = 'submitOrder'>
	  		  	<button className = 'ui primary button' type = 'button' onClick = {() => this.props.clickFn2(document.getElementById('sellVolume').value)}> Sell {coin} </button>
	  		  </div>
	  		  </div>
  	} else {
  	  submission = <div>
	  		  <div id = 'selectVolume' className = 'field'>
	  		  	<h5> Volume: </h5>
	  		  	<input type = 'text' id = 'sellVolume' placeholder = 'amount to receive'/>
	  		  </div>
	  		  <div id = 'selectPrice' className = 'field'>
	  		  	<h5> Price: </h5>
	  		  	<input type = 'text' id = 'sellPrice' onChange = {() => this.onFormEntry(document.getElementById('sellVolume').value, document.getElementById('sellPrice').value)}/> 
	  		  </div>
	  		  <div id = 'totalAmount' className = 'field'>
	  		  	<h5> Sell Total: </h5>
	  		  	<span id = 'totalSellOrder'> {this.state.total} </span>
	  		  </div>
	  		  &nbsp;
	  		  <div id = 'submitOrder'>
	  		  	<button className = 'ui primary button' type = 'button' onClick = {() => this.props.clickFn(document.getElementById('sellVolume').value, document.getElementById('sellPrice').value)}> Sell {coin} </button>
	  		  </div>
	  		  </div>
  	}

  	return (
  		<div id="dashCard3" className="ui blue raised card"> 
  		  <form id = 'sellForm' className = 'ui mini form'>
  		    <fieldset>
  		  	  <h3> Sell {coin} </h3>
  		  	  <div id = 'availableCoinBalance' className = 'field'>
	  		    <h5> Available {coin}: </h5> <span> {balance} </span>
	  		  </div>
	  		  <div className = "field">
	  		    <h5> Order Type: </h5>
	      		<div className ="ui radio checkbox">
	        		<input type="radio" name="marketSell" value = 'market' onClick = {() => this.onRadioClick('market')}/>
	        		<label>Market</label>
	      		</div>
	      		&nbsp;
	      		&nbsp;
	      	    <div className = "ui radio checkbox">
	        	  <input type="radio" name="marketSell" value = 'limit' onClick = {() => this.onRadioClick('limit')}/>
	        	  <label>Limit</label>
	      	    </div>
	    	  </div>
	    	  {submission}
	  		 
	  		</fieldset>
  		  </form> 

  		</div>

  	)
  }

}

export default SellCard;


 // <div id = 'selectVolume' className = 'field'>
	//   		  	<h5> Volume: </h5>
	//   		  	<input type = 'text' id = 'sellVolume' placeholder = 'amount to sell'/>
	//   		  </div>
	//   		  <div id = 'selectPrice' className = 'field'>
	//   		  	<h5> Price: </h5>
	//   		  	<input type = 'text' id = 'sellPrice' onChange = {() => this.onFormEntry(document.getElementById('sellVolume').value, document.getElementById('sellPrice').value )}/> 
	//   		  </div>
	//   		  <div id = 'totalAmount' className = 'field'>
	//   		  	<h5> Receive Total: </h5>
	//   		  	<span id = 'totalBuyOrder'> {this.state.total} </span>
	//   		  </div>
	//   		  <div id = 'submitOrder'>
	//   		  	<button className = 'ui primary button' type = 'button' onClick = {() => this.props.clickFn(document.getElementById('sellVolume').value, document.getElementById('sellPrice').value,  $('input[type="radio"][name="marketSell"]:checked').val() )}> Sell {coin} </button>
	//   		  </div>