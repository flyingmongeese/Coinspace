import React from 'react';



class SellCard extends React.Component {

  constructor(props) {
  	super(props)
  	this.state = {
  	  total: 0
  	}
  }


  onFormEntry(volume, price) {
  	this.setState({
  	  total: volume * price
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
  
  	return (
  		<div id="dashCard3" className="ui blue raised card"> 
  		  <form id = 'buyForm' className = 'ui mini form'>
  		    <fieldset>
  		  	  <h3> Sell {coin} </h3>
  		  	  <div id = 'availableCoinBalance' className = 'field'>
	  		    <h5> Available {coin}: </h5> <span> {balance} </span>
	  		  </div>
	  		  <div className = "field">
	  		    <h5> Order Type: </h5>
	      		<div className ="ui radio checkbox">
	        		<input type="radio" name="market"/>
	        		<label>Market</label>
	      		</div>
	      		&nbsp;
	      		&nbsp;
	      	    <div className = "ui radio checkbox">
	        	  <input type="radio" name="market"/>
	        	  <label>Limit</label>
	      	    </div>
	    	  </div>

	  		  <div id = 'selectVolume' className = 'field'>
	  		  	<h5> Volume: </h5>
	  		  	<input type = 'text' id = 'sellVolume' placeholder = 'amount to sell'/>
	  		  </div>
	  		  <div id = 'selectPrice' className = 'field'>
	  		  	<h5> Price: </h5>
	  		  	<input type = 'text' id = 'sellPrice' onChange = {() => this.onFormEntry(document.getElementById('sellVolume').value,document.getElementById('sellPrice').value )}/> 
	  		  </div>
	  		  <div id = 'totalAmount' className = 'field'>
	  		  	<h5> Receive Total: </h5>
	  		  	<span id = 'totalBuyOrder'> {this.state.total} </span>
	  		  </div>
	  		  <div id = 'submitOrder'>
	  		  	<button className = 'ui primary button' > Sell {coin} </button>
	  		  </div>
	  		</fieldset>
  		  </form> 

  		</div>

  	)
  }

}














export default SellCard;