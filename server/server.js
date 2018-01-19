const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cryptoAPI = require('../BitFinexAPI/BitFinexAPI.js');
const newsAPI = require('../NewsApi/newsapi.js');
const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');
const db = require('../database/index.js');
const favicon = require('express-favicon');
const socket = require('socket.io');
const path = require('path');
const router = require('./routes.js');
const expressValidator = require('express-validator');

//// PASSPORT LIBRARIES ////
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const authentication = require('./authentication.js');
//// PASSPORT CONFIGURATION ////
app.use(session({
  secret: 'coinface',
  resave: false,
  saveUninitialized: false,
  store: new pgSession({
    pool: db.pool
  })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
  db.findUser(username, (error, result) => {
    if (error) {
      done(error);
    } else {
      if (result.rows.length === 0) {
        done(null, false);
      } else {
        authentication.verifyPassword(password, result.rows[0].password, (error, pwCheck) => {
          if (error) {
            console.error(error);
          } else {
            if (pwCheck === true) {
              return done(null, result.rows[0].id)
            } else {
              return done(null, false);
            }
          }
        })
      }
    }
  })
}))

//// Server Initialization ////
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server, listening on port ${port}`);
});
const io = socket(server);

//passport + facebook
// passport.use(new FacebookStrategy({
//   clientID: '142468679794360',
//   clientSecret: 'dc9b545b3bf20babe315f1757594edf0',
//   callbackURL: "http://localhost:3008/auth/facebook/callback"
// },
// function(accessToken, refreshToken, profile, cb) {
//   User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }
// ));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/authenticate', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({loggedin: true});
  } else {
    res.status(200).json({loggedin: false});
  }
})

//rest of the app
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(favicon(path.join(__dirname, '../client/dist/img/favicon.ico')));

app.use(express.static(path.join(__dirname, '../client/dist')));

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(allowCrossDomain);
//

// Dillon Experimental Route for SignUp UserPassword
app.use('/sign', router);

new CronJob('00 */1 * * *', () => {
  // API call
  cryptoAPI.BitfinexAPI()
    .then((data) => {
      let now = moment(new Date()).tz('America/Los_Angeles').format(`MM/DD/YYYY HH`);
      Promise.all(data.map((coin, index) => {
        // then write to dB
        return db.client.query(`insert into price_history (coin_id, time_stamp, price) values (${index + 1}, '${now}', ${coin[1]}) on conflict(coin_id, time_stamp) do nothing`);
      })).then(result => {
        // send to client
        db.client.query(`select *, to_timestamp(time_stamp, 'MM/DD/YY HH24') as date from price_history order by date desc limit 4`)
          .then(results => {
            io.emit('new data', results.rows);
          }).catch(err => {
            console.log('get current price err', err);
          });
      }).catch(err => {
        console.log('insert err', err);
      });
    }).catch(err => {
      console.log('api err', err);
    });
// sample result [[ 'tBTCUSD', // SYMBOL
//                 14721, // BID
//                 192.76423686, // BID_SIZE
//                 14722, // ASK
//                 51.69043092, // ASK_SIZE
//                 -348.49653855, // DAILY_CHANGE
//                 -0.0231, // DAILY_CHANGE_PERC
//                 14719.50346145, // LAST_PRICE
//                 45888.69199867, // VOLUME
//                 15355, // HIGH
//                 14122 // LOW]]
}, null, true, 'America/Los_Angeles');

app.get('/init', (req, res) => {
  // load historical data into client
  db.getData()
    .then(results => {
      res.json(results);
    }).catch(err => {
      console.log('init err', err);
    });
});

app.get('/news', (req, res) => {
  newsAPI.CryptoNewsAPI()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log('News API call error', err);
    });
});

app.get('/balance', (req, res) => {
  console.log(req);
  console.log('EMAIL IS', req.body.email);
  db.getBalancesOfUser(req.body.email, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log('RESULTS ARE', results);
      // res.send('hello world');
      res.send(results);
    }
  })
})
//

app.get('/buys/:pair', (req, res) => {
  console.log('GETTING BUYS FROM', req.params.pair);
  db.getBuyOrders(req.params.pair, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
});


app.get('/sells/:pair', (req, res) => {
  db.getSellOrders(req.params.pair, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
});


app.get('/user', (req, res) => {
  console.log('userId is',  req.user);
  // res.send(req.user)
  db.getBalancesOfUser(req.user, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
  // res.send(req.user.toString())
})

app.post('/userBalance', (req, res) => {
  console.log(req.body);
  // res.send('yo')
  db.updateUserBalance(req.user, req.body.coin, req.body.newCoinBalance, req.body.newUsdBalance, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
});


app.get('/completedOrders/:pair', (req, res) => {
  db.getCompletedOrders(req.params.pair, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  });
})
//

app.post('/newOrder', (req, res) => {
  var order = req.body;
  console.log('ORDER IS', order);
  db.insertOrder(order, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
})

app.post('/newUserOrder', (req, res) => {
  var order = req.body;
  order.userid = req.user;
  console.log('ORDER IS', order);
  db.insertOrder(order, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
})


app.post('/orders', (req, res) => {
  db.updateOrders(req.body.orderId, req.body.quantity, req.body.price, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results);
    }
  })
})

//// USER SERIALIZATION PROCESS ////
passport.serializeUser(function(userid, done) {
  done(null, userid);
});

passport.deserializeUser(function(userid, done) {
  done(null, userid);
});

io.on('connection', socket => {
  io.emit('new message', 'A new user joined the chat');
  socket.on('message', data => {
    io.emit('new message', data);
  });
  socket.on('disconnect', () => {
    io.emit('new message', 'A user disconnected');
  });
});

module.exports = app;
