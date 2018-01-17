const passport = require('passport');
var db = require('../database/index.js');
var router = require('express').Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/up', (req, res) => {
	res.send(200);
});

router.post('/up', (req, res) => {
	db.insertNewUser(req, (error, result) => {
		if (error) {
			res.status(401).send({msg: error});
		} else {
      req.login(result, (error) => {
				db.getUserData(req.user, function(error, userData) {
					if (error) {
						console.error(error);
					} else {
						console.log('user data: ', userData.rows[0]);
						res.status(201).json(userData.rows[0]);
					}
				});
			})
		}
	})
})


router.get('/in', (req, res) => {
	res.send(200);
});

// router.post('/in', (req, res) => {
// 	// console.log('INSIDE LOGIN', req.body.email)
// 	db.findExistingUser()
// 	.then((data) => {
// 		return data.filter((entry) => {
// 			return (entry.email === req.body.email);
// 		})
// 	})
// 	.then((results) => {
// 		if(results.length === 0) {
// 			res.json('Username or Password Incorrect!');
// 		} else {
// 			bcrypt.compare(req.body.password, results[0].password)
// 			.then(function(validation) {
// 				if(validation) {
// 					res.json('Success!');
// 				} else {
// 					res.json('Username or Password Incorrect!');
// 				}
// 			})
// 		}
// 	})
// 	.catch((error) => {
//     	console.log('There is an error in routes.js sign in', error);
// 	})
// });

router.post('/in', (req, res) => {
	console.log('trying to log in: ', req.body);
	passport.authenticate('local', function(error, user, info) {
		if (error) {
			res.status(500).end();
		} else if (!user) {
			res.status(400).send('Username or Password not found, please try again');
		} else {
			req.login(user, (error) => {
				if (error) {
					res.status(500).end();
				} else {
					db.getUserData(req.user, function(error, userData) {
						if (error) {
							console.error(error);
						} else {
							console.log('user data: ', userData.rows[0]);
							res.status(201).json(userData.rows[0]);
						}
					});
				}
			})
		}
	})(req, res);
})

router.get('/out', (req, res) => {
  req.logout();
  req.session.destroy();
  res.status(200).end();
})

router.get('/auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({authRes: true});
  } else {
    res.status(200).json({authRes: false});
  }
})

// router.get('/balance', (req, res) => {
//   console.log('NEW EMAIL IS', req.body.email);
//   db.getBalancesOfUser(req.body.email, (err, results) => {
// 	if (err) {
// 	  console.log(err);
// 	} else {
// 	  console.log('RESULTS ARE', results);
// 	  // res.send('hello world');
// 	  res.send(results);
// 	}
//   })
// })

module.exports = router;