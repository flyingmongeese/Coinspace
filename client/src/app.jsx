import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SmallCurrencyToggle from './components/SmallCurrencyToggle.jsx';
import TriComponentRow from './components/TriComponentRow.jsx';
import CoinChart from './components/CoinChart.jsx';
import Chat from './components/Chat.jsx';
import Login from './components/Login.jsx';
import FBLogin from './components/FacebookLogin.jsx';
import moment from 'moment';
import PortfolioPage from './components/PortfolioPage.jsx';
import Modal from 'react-responsive-modal';
import { Header, Input, Menu, Segment, Container, Divider, Grid } from 'semantic-ui-react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCoin: 1,
      currentTimePeriod: '1Y',
      hourlyData: [],
      dailyData: [],
      weeklyData: [],
      monthlyData: [],
      yearlyData: [],
      historicalData: [],
      chartData: {},
      coins: [
        ['Bitcoin', 'rgba(79, 232, 255, 0.1)', '#4FC7FF'],
        ['Ethereum', 'rgba(241, 245, 125, 0.1)', '#f2b632'],
        ['Litecoin', 'rgba(125, 245, 141, 0.1)', '#2ECC71'],
        ['Ripple', 'rgba(255, 148, 180, 0.1)','#FF4A4A']
      ],
      labels: {
        //'1H': ['hourlyData', 'minutes', 'hh:mm a', 'Past Hour'],
        '1D': ['dailyData', 'hours', 'hh:mm a', 'Since Yesterday'],
        '1W': ['weeklyData', 'days', 'MMM DD', 'Since Last Week'],
        '1M': ['monthlyData', 'days', 'MMM DD', 'Since Last Month'],
        '1Y': ['yearlyData', 'months', 'MMM DD', 'Since Last Year'],
        //'ALL': ['historicalData', 'days', 'MMM YYYY', 'Since Forever'

      },
      renderedPage: 'Charts',
      userLogin: false
    };
    this.changePage = this.changePage.bind(this);
    this.addData = this.addData.bind(this);
  }

  componentDidMount() {
    axios.get('/init')
      .then(results => {
        this.setState({
          hourlyData: results.data[1],
          dailyData: results.data[1],
          weeklyData: results.data[2],
          monthlyData: results.data[1],
          yearlyData: results.data[0],
          historicalData: results.data[0]
        });
      }).then(()=> {
        this.getChartData();
        // React Cronjob
        let minute = new Date().getMinutes() % 15;
        console.log(15 - minute, 'minutes left get update from server');
        new Promise(() => {
          setTimeout(this.getUpdate, 900000 - 60000 * minute);
        }).then(() => {
          // setInterval(this.getUpdate, 1800000);
        }).catch(err => {
          console.log('set interval err', err);
        });
      }).catch(err => {
        console.log('init client', err);
      });
  }

  getChartData(){
    // Define the initial labels.
    var inputLabel = [];
    for (let i = 0; i < 365; i++) {
      inputLabel.push(moment().subtract(i, 'days').format('MMM YYYY'));
    }
    this.setState({
      chartData:{
        labels: inputLabel.reverse(),
        datasets:[
          {
            label:'Price',
            data: this.state.historicalData.filter((allCoins) => allCoins.coin_id === this.state.currentCoin).map((entry) => entry.price),
            backgroundColor:[this.state.coins[0][1]],
            borderColor: [this.state.coins[0][2]]
          }
        ]
      }
    });
  }

  onSetCoin(coinID) {
    let currentDataSet = this.state[this.state.labels[this.state.currentTimePeriod][0]];
    let inputData = currentDataSet.filter((allCoins) => allCoins.coin_id === parseInt(coinID)).map((entry) => entry.price);
    this.setState({
      currentCoin: +coinID,
      chartData: {
        labels: this.state.chartData.labels,
        datasets:[
          {
            label:'Price',
            data: inputData,
            backgroundColor:[this.state.coins[coinID - 1][1]],
            borderColor: [this.state.coins[coinID - 1][2]]
          }
        ]
      }
    });
  }

  onSetTimePeriod(e, { value }) {
    let label = this.state.labels[value];
    let currentDataSet = this.state[label[0]];
    let inputData = currentDataSet.filter((allCoins) => +allCoins.coin_id === +this.state.currentCoin).map((entry) => entry.price);
    let inputLabel = inputData.map((data, index) => moment().subtract(index, label[1]).format(label[2]));
    this.setState({
      currentTimePeriod: value,
      chartData: {
        labels: inputLabel.reverse(),
        datasets:[
          {
            label:'Price',
            data: inputData,
            backgroundColor:[this.state.coins[this.state.currentCoin - 1][1]],
            borderColor: [this.state.coins[this.state.currentCoin - 1][2]]
          }
        ]
      }
    });
  }

  addData(data) {
    this.setState({
      hourlyData: [...this.state.hourlyData, ...data],
      dailyData: [...this.state.dailyData, ...data],
      weeklyData: [...this.state.weeklyData, ...data],
      monthlyData: [...this.state.monthlyData, ...data],
      yearlyData: [...this.state.yearlyData, ...data],
      historicalData: [...this.state.historicalData, ...data]
    });
  }

  getUpdate() {
    // axios call to server
    // on success, set timeout(at the 00 minute, set the state)
    axios.get('/update')
      .then(results => {
        let minute = new Date().getMinutes() % 30;
        console.log(`Half hour update in ${30 - minute} minutes`);
        console.log(results.data.rows);
        // this.addData(results.data.rows);
        setTimeout(()=>{
          this.addData(results.data.rows);
        }, 1800000 - 60000 * minute);
      }).catch(err => {
        console.log('update err', err);
      });
  }

  changePage(e, { name }) {
    this.setState({
      renderedPage: name
    });
    console.log(name)
  }

  userLogin() {
    this.setState({
      userLogin: true
    })
  }

  userLogout() {
    this.setState({
      userLogin: false,
      renderedPage: 'Charts'
    })
  }

  render() {

    const { renderedPage } = this.state

    if (this.state.weeklyData.length === 0) {
      return <div/>;
    } else if (!this.state.chartData.datasets) {
      return <div/>;
    }

    return (
      <div id="mainWrapper">
      <Container fluid>
      <Menu color='blue' inverted>
      <p id="companyTitle1">coin</p>
      <img id="coinRebase" src={require('../dist/img/CoinRebase.gif')}/>
      <p id="companyTitle2">rebase</p>
      <Menu.Menu position='right'>
        <Menu.Item name='Charts' active={renderedPage === 'Charts'} onClick={this.changePage}/>
        {this.state.userLogin ? null : <Login userLogin={this.userLogin.bind(this)} userLogout={this.userLogout.bind(this)}/>}
        {this.state.userLogin ? <Menu.Item name='Portfolio' active={renderedPage === 'Portfolio'} onClick={this.changePage}/> : null}
        {this.state.userLogin ? <Menu.Item name='Logout' onClick={this.userLogout.bind(this)}/> : null}
      </Menu.Menu>
        </Menu>
        </Container>

        {this.state.renderedPage === 'Charts' ? (
          <div className="ui grid">
            <div className="three column row"></div>
            <div className="sixteen column row">
              <div className="one wide column"></div>
              {this.state.coins.map((coin, index) =>
                <SmallCurrencyToggle key={index} currentCoin={this.state.currentCoin} onSetCoin={this.onSetCoin.bind(this)} coin_id={index + 1} name={coin[0]} coin={this.state.historicalData.filter((allCoins) => {return allCoins.coin_id === index + 1}).reverse()[0].price} />
              )}
              <div className="four wide column"></div>
              {Object.keys(this.state.labels).map((label, index) =>
                <Menu pointing secondary>
                <Menu.Menu position='right'>
                <Menu.Item active={this.state.currentTimePeriod === label} name={label} onClick={this.onSetTimePeriod.bind(this)} key={index} value={label}/>
                </Menu.Menu>
                </Menu>
              )}

            <div className="one cloumn row">
              <div className="one wide column">
                <TriComponentRow state={this.state}/>
              </div>
            </div>
            <CoinChart chartData={this.state.chartData} onSetCoin={this.onSetCoin.bind(this)} onSetTimePeriod={this.onSetTimePeriod.bind(this)}/>
          <Chat/>
          </div>
          </div>
          ) : (<PortfolioPage chartData={this.state.chartData} onSetCoin={this.onSetCoin.bind(this)} onSetTimePeriod={this.onSetTimePeriod.bind(this)}/>)
      }
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
