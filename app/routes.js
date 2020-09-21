module.exports = function(app, passport, db, ObjectId) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // SIGN UP SECTION =========================
    app.get('/signupForm', isLoggedIn, function(req, res) {
        res.render('signupForm.ejs', {
          user : req.user,
          message: req.flash('signupMessage')
        });
    });

    // process the signup form//
    app.post('/signupForm', (req, res) => {
      db.collection('profile').save({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          who: req.body.who,
          goals: req.body.goals,
          username: req.body.name
        }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    // PROFILE SECTION =======================================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
          if (err) return console.log(err)
          //Use uID to link to specific users and also create different profile page for "business" type profiles //
              res.render('profile.ejs', {
                  user : req.user,
                  profile: result
              })
            // }
        })
    });

    // JOBS / OPPORTUNITIES ------------------------------------
    app.get('/jobs', function(req, res) {
    db.collection('profile').find().toArray((err, result) => {
         if (err) return console.log(err)
        res.render('jobs.ejs', {
          user : req.user,
          profile: result
            })
        })
    });

    // MEET OTHER USERS ------------------------------------
    app.get('/meet', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
            res.render('meet.ejs', {
              user : req.user,
              profile: result
                })
            })
        });

    // FIND EVENTS ------------------------------------
    app.get('/events', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
            res.render('events.ejs', {
              user : req.user,
              profile: result
                })
            })
        });

    // PRIVATE MESSAGES ------------------------------------
    app.get('/messages', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
            res.render('messages.ejs', {
              user : req.user,
              profile: result
                })
            })
        });


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/profile', (req, res) => {
      db.collection('profile').save({name: req.body.name, src: req.body.src, msg: req.body.msg, value: 0, arrowUp:"", arrowDown: ""}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/profile', (req, res) => {
      if(req.body.arrowUp == "yes"){
        db.collection('profile')
        .findOneAndUpdate({name: req.body.name, src: req.body.src, msg: req.body.msg}, {
          $set: {
            value:req.body.value + 1,
            arrowUp: req.body.arrowUp,
            arrowDown: req.body.arrowDown
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
    } else if((req.body.arrowDown == "yes") && (req.body.value!=0)){
        db.collection('profile')
        .findOneAndUpdate({name: req.body.name, src: req.body.src, msg: req.body.msg}, {
        $set: {
            value:req.body.value -1,
            arrowUp: req.body.arrowUp,
            arrowDown: req.body.arrowDown
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
        })
      }
    })

    app.delete('/profile', (req, res) => {
      db.collection('profile').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash profile
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

            // process the signup form//
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/signupForm', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash profile
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
