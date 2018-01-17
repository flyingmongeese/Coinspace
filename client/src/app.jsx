import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SmallCurrencyToggle from './components/SmallCurrencyToggle.jsx';
import TimeIntervalToggle from './components/TimeIntervalToggle.jsx';
import TriComponentRow from './components/TriComponentRow.jsx';
import CoinChart from './components/CoinChart.jsx';
import Chat from './components/Chat.jsx';
import Login from './components/Login.jsx';
import FBLogin from './components/FacebookLogin.jsx';
import moment from 'moment';
import TradingPage from './components/TradingPage.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import Modal from 'react-responsive-modal';
import { Header, Input, Menu, Segment, Container, Divider, Grid, Sticky, Button, Icon, Image, Statistic } from 'semantic-ui-react';
import io from "socket.io-client";

const coins = [
  ['Bitcoin', 'rgba(79, 232, 255, 0.1)', '#4FC7FF'],
  ['Ethereum', 'rgba(241, 245, 125, 0.1)', '#f2b632'],
  ['Litecoin', 'rgba(125, 245, 141, 0.1)', '#2ECC71'],
  ['Ripple', 'rgba(255, 148, 180, 0.1)','#FF4A4A']
];
const labels = {
  // console.log(lastyear > lastweek); // false
  //'1H': [new Date(new Date() - (1000*60*60)), 'minutes', 'hh:mm a', 'Past Hour'],
  '1D': [new Date(new Date() - (1000*60*60*24)), 'hours', 'hh:mm a', 'Since Yesterday'],
  '1W': [new Date(new Date() - (1000*60*60*24*7)), 'days', 'MMM DD', 'Since Last Week'],
  '1M': [new Date(new Date() - (1000*60*60*24*30)), 'days', 'MMM DD', 'Since Last Month'],
  '1Y': [new Date(new Date() - (1000*60*60*24*365)), 'months', 'MMM DD', 'Since Last Year'],
  //'ALL': ['allData', 'days', 'MMM YYYY', 'Since Forever']
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCoin: 1,
      currentTimePeriod: '1Y',
      allData: [],
      latestPrices: [],
      chartLabels: [],
      chartDataSet:[],
      chartBGcolor:'',
      chartBorderColor: '',
      renderedPage: 'Markets',
      openLogin: false,
      userLogin: false,
      chatOpen: false,
      currentUser: '',
      loggedInUser: {}
    };
    this.socket = io('http://localhost:3000');
    this.changePage = this.changePage.bind(this);
    this.addData = this.addData.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.socket.on('new data', (results) =>{
      this.addData(results);
    });
  }

  componentWillMount() {
    var app = this;
    axios.get('/sign/auth')
      .then(response => {
        app.setState({userLogin: response.data.authRes});
      })
  }

  componentDidMount() {
    axios.get('/init')
      .then(results => {
        this.setState({
          allData: results.data,
          latestPrices: results.data.slice(-4).sort((a,b) => (+a.coin_id - +b.coin_id))
        }, () => {
          this.getChartData();
        });
      }).catch(err => {
        console.log('init client', err);
      });
  }

  getChartData (coinID = this.state.currentCoin, time = this.state.currentTimePeriod) {
    let label = labels[time];
    // filter by current time period and coin and map to prices
    let inputData = this.state.allData.filter((allCoins) => new Date(allCoins.date) > label[0] && +allCoins.coin_id === +coinID).map((entry) => entry.price);
    let inputLabels = inputData.map((data, index) => moment().subtract(index, label[1]).format(label[2]));
    this.setState({
      currentCoin: +coinID,
      currentTimePeriod: time,
      chartLabels: inputLabels.reverse(),
      chartDataSet: inputData,
      chartBGcolor: [coins[coinID - 1][1]],
      chartBorderColor: [coins[coinID - 1][2]]
    });
  }

  addData(data) {
    this.setState({
      allData: [...this.state.allData, ...data],
      latestPrices: data.sort((a,b) => (+a.coin_id - +b.coin_id)),
    }, () => {
      this.getChartData();
    });
  }

  changePage(e, { name }) {
    this.setState({
      renderedPage: name
    });
    console.log(name);
  }

  openLoginModal() {
    this.setState({
      openLogin: true
    });
  }

  closeLoginModal() {
    this.setState({
      openLogin: false
    });
  }

  userLogin(userData) {
    this.setState({
      userLogin: true,
      openLogin: false,
      loggedInUser: userData
    });
  }

  userLogout() {
    var app = this;
    axios.get('/sign/out')
      .then(response => {
        app.setState({
          userLogin: false,
          renderedPage: 'Charts',
          loggedInUser: {}
        });
      })
  }

  onChatOpen() {
    this.setState({
      chatOpen: true
    });
  }

  onChatClose() {
    this.setState({
      chatOpen: false
    })
  }

  render() {

    const { renderedPage } = this.state;

    if (this.state.allData.length === 0) {
      return <div/>;
    }

    var displayDiv = null;
    if (this.state.renderedPage === 'Charts') {
            displayDiv = 
            <div className="ui grid">
               <div className="three column row"></div>
               <div className="sixteen column row">
                 <div className="one wide column"></div>
                 {coins.map((coin, index) =>
                  <SmallCurrencyToggle key={index} name={coin[0]} currentCoin={this.state.currentCoin} currentTimePeriod={this.state.currentTimePeriod} coin={this.state.latestPrices[index]} onSetCoin={this.getChartData.bind(this)} />
                )}
                <Menu pointing secondary>
                  <Menu.Item active={this.state.chatOpen} name='chat' onClick={this.onChatOpen.bind(this)}><Icon name='comments' size='big'/></Menu.Item>
                </Menu>
                {this.state.chatOpen ? <Chat socket={this.socket} chatOpen={this.state.chatOpen} onChatClose={this.onChatClose.bind(this)} currentUser={this.state.currentUser}/> : null}
                <div className="four wide column"></div>
                {Object.keys(labels).map((label, index) =>
                  <TimeIntervalToggle key={index} label={label} currentCoin={this.state.currentCoin} currentTimePeriod={this.state.currentTimePeriod} onSetTimePeriod={this.getChartData.bind(this)}/>
                )}

                <div className='column'></div>
              </div>
              <TriComponentRow coins={coins} labels={labels} state={this.state}/>
              <CoinChart state={this.state} />
            </div>
            
          } 
          else if (this.state.renderedPage === 'Portfolio') {
            displayDiv = <PortfolioPage state={this.state}/>
          }

          else if (this.state.renderedPage === 'Markets') {
            displayDiv = <TradingPage state={this.state}/>
          }

    return (
      <div id="mainWrapper" className="mainBackground">
        <Grid width={16}><Grid.Row style={{"height": 73}}><Grid.Column color='blue'>
          <Menu color='blue' borderless inverted>
          <Header as='h2' id="companyLogo">
          <Image id="coinRebase" src={require('../dist/img/sfkiwi.gif')}/>
            coin <b><font color="black">re</font></b>base
          </Header>
            <Menu.Menu position='right'>
              <Menu.Item name='Markets' active={renderedPage === 'Markets'} onClick={this.changePage}><Icon name='line chart'/>Markets</Menu.Item>
              <Menu.Item name='Charts' active={renderedPage === 'Charts'} onClick={this.changePage}><Icon name='line chart'/>Charts</Menu.Item>
              {this.state.userLogin ? null : <Menu.Item name='Login' active={this.state.openLogin} onClick={this.openLoginModal.bind(this)}><Icon name='key'/>Login</Menu.Item>}
              {this.state.openLogin ? <Login userLogin={this.userLogin.bind(this)} userLogout={this.userLogout.bind(this)} openLogin={this.state.openLogin} closeLoginModal={this.closeLoginModal.bind(this)}/> : null}
              {this.state.userLogin ? <Menu.Item name='Portfolio' active={renderedPage === 'Portfolio'} onClick={this.changePage}><Icon name='dashboard'/>Portfolio</Menu.Item> : null}
              {this.state.userLogin ? <Menu.Item name='Logout' onClick={this.userLogout.bind(this)}><Icon name='power'/>Logout</Menu.Item> : null}
            </Menu.Menu>
          </Menu>
          </Grid.Column></Grid.Row></Grid>

        {displayDiv}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
