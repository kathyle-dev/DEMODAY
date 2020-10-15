module.exports = function(app, passport, db, multer, ObjectId, NewsAPI, configAPI, fetch, nodemailer) {

// Image Upload Code =========================================================================
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});
var upload = multer({storage: storage});

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
    app.post('/signupform', upload.single('file-to-upload'), (req, res, next) => {
    let uId = ObjectId(req.session.passport.user)
      db.collection('profile').save({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          bizname: req.body.bizname,
          imgPath: 'images/uploads/' + req.file.filename,
          who: req.body.who,
          field: req.body.field,
          goals: req.body.goals,
          username: req.user.local.email,
          userId: uId,
          connections: [],
          sentRequests: [],
          receivedRequests: []
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
          // getting all users other than the logged-in user //
          const otherUsers = result.filter(function(result) {
              if(req.user.local.email != result.username){
                  return true
              }
          })
          // getting random users for "discover new users" feature //
          const l = otherUsers.length -1
          function randomNumber(min, max) {
              return Math.floor(Math.random() * (max - min) + min)
          }
          const rand1 = randomNumber(0, (0.33)*l)
          const rand2 = randomNumber((0.34)*l, (0.66)*l)
          const rand3 = randomNumber((0.67)*l, l)
          let otherResult = [otherUsers[rand1], otherUsers[rand2], otherUsers[rand3]]

          // getting logged-in user's profile to display //
          const userFilter = result.filter(function(result) {
              if(req.user.local.email == result.username){
                  return true
              }
          })

          // ---------News API------------------ //

              fetch(`https://newsapi.org/v2/everything?q=${userFilter[0].field[0]}&pageSize=5${configAPI.key}`)
                .then(res => res.json())
                .then(data => {
                        res.render('profile.ejs', {
                            user : req.user,
                            profile: userFilter,
                            discover: otherResult,
                            news: data.articles
                        })
                    })
                .catch(err => alert("Out of news! Try another search."))
            // getting Business' profile & other user information //
            db.collection('profile').find({field:userFilter[0].field}).toArray((err, bizRes) => {
                if (err) return console.log(err)
                const bizResults = bizRes.filter(function(bizRes) {
                    if(bizRes.username!==req.user.local.email){
                        return true
                    }
                })
                // // getting random users for "discover new users" feature //
                // const l2 = bizResults.length -1
                // function randomNumber(min, max) {
                //     return Math.floor(Math.random() * (max - min) + min)
                // }
                // const rand1 = randomNumber(0, (0.33)*l2)
                // const rand2 = randomNumber((0.34)*l2, (0.66)*l2)
                // const rand3 = randomNumber((0.67)*l2, l2)
                // let bizFilter = [bizResults[rand1], bizResults[rand2], bizResults[rand3]]
                if(userFilter[0].who === "Business"){
                    res.render('profileBis.ejs', {
                        user : req.user,
                        profile: userFilter,
                        discover: bizResults
                    })
                }
            })
        })
    });
    //--------GET INDIVIDUAL USER PROFILE --------------------
    app.get('/profile/:username', function(req, res) {
        let username= req.params.username
        let status = ""
        // getting logged-in user's information
        db.collection('profile').find().toArray((err, result) => {
            if (err) return console.log(err)
            var userFilter = result.filter(function(result) {
                if(req.user.local.email == result.username){
                    return true
                }
            })

            // getting other User's information
            var otherUser = result.filter((e) =>{
             return e.username.includes(req.params.username)
            })

            // getting other user's connections information
             var otherConnectionUsers = result.filter((e) =>{
                        return otherUser[0].connections.includes(e.username)
            })


            if(userFilter[0] == otherUser[0]){
                status = "true"
            }else{
                status = "false"
            }

        console.log(status, "THIS IS STATUS")
                          res.render('userProfile.ejs', {
                              user : req.user,
                              profile: userFilter,
                              discover: otherUser[0],
                              connections: otherConnectionUsers,
                              status: status
                              })

        })

})

    // JOBS / OPPORTUNITIES ------------------------------------
    app.get('/jobs', function(req, res) {
    db.collection('profile').find().toArray((err, result) => {
         if (err) return console.log(err)
         const userFilter = result.filter(function(result) {
             if(req.user.local.email == result.username){
                 return true
             }
         })
        res.render('jobs.ejs', {
            user : req.user,
            profile: userFilter,
            discover: result
            })
        })
    });

    // MEET OTHER USERS ------------------------------------
    app.get('/meet', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
             const userFilter = result.filter(function(result) {
                 if(req.user.local.email == result.username){
                     return true
                 }
             })
            res.render('meet.ejs', {
                user : req.user,
                profile: userFilter,
                discover: result
                })
            })
        });

    // MEET OTHER USERS BY INTEREST ------------------------------------
    app.get('/meet/:field', function(req, res) {
        let field = req.params.field
        db.collection('profile').find().toArray((err, result) => {
            if (err) return console.log(err)
            const userFilter = result.filter(function(result) {
                if(req.user.local.email == result.username){
                    return true
                }
            })
            db.collection('profile').find({field:field}).toArray((err, discoverRes) => {
             if (err) return console.log(err)
            res.render('meet.ejs', {
                user : req.user,
                profile: userFilter,
                discover: discoverRes
                })
            })
        })
    });
    // MEET OTHER USERS BY FILTER ------------------------------------
    app.post('/search', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
            if (err) return console.log(err)
            const userFilter = result.filter(function(result) {
                if(req.user.local.email == result.username){
                    return true
                }
            })
            db.collection('profile').find({who:req.body.whoFilter, field: req.body.fieldFilter}).toArray((err, discoverRes) => {
             if (err) return console.log(err)
            res.render('meet.ejs', {
                user : req.user,
                profile: userFilter,
                discover: discoverRes
                })
            })
        })
    });

    //  connection routes ========================================================

    //go to connections tab that has list of pending connection requests
    app.get('/connections', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
             var userFilter = result.filter(function(result) {
                 if(req.user.local.email == result.username){
                     return true
                 }
             })
            const receivedUsers = result.filter((e) =>{
            return userFilter[0].receivedRequests.includes(e.username)})

            const sentUsers = result.filter((e) =>{
            return userFilter[0].sentRequests.includes(e.username)})

                res.render('connections.ejs', {
                    user : req.user,
                    profile: userFilter,
                    sentRequests: sentUsers,
                    receivedRequests: userFilter[0].receivedRequests,
                    discover: receivedUsers
                    })

            })
        });

    //sending connection requests
        app.put('/connect', (req, res) => {

            //update SENDER PROFILE
            db.collection('profile')
            .findOneAndUpdate({username:req.user.local.email}, {
              $push: {
                sentRequests:req.body.username
                }
            }, {
            sort: {_id: 1},
             upsert: false
            }, (err, result) => {
              if (err) return res.send(err)
              //update RECEIVER PROFILE
              db.collection('profile')
              .findOneAndUpdate({username:req.body.username}, {
                $push: {
                  receivedRequests:req.user.local.email
              }
              }, {
              sort: {_id: 1},
               upsert: false
           }, (err, result) => {
                if (err) return res.send(err)
                console.log(result)
                res.send(result)
              })
            })
        })

    //accepting connection requests
        app.put('/accept', (req, res) => {
            //nodemailer = service (NPM package) configuration
            var transport = nodemailer.createTransport({
              service: "hotmail",
              auth: {
                user: "general.diversify@outlook.com", //where we're sending emails from
                pass: "diversify180!"
              }
            });

          //OBJECT {} -> template/configuration for creating a message
            const message = {
                from: 'general.diversify@outlook.com', // Sender address
                to: req.user.local.email,         // List of recipients
                subject: `You are now a connection with ${req.body.username}!`, // Subject line
                text: `Your connection request has been accepted! Go to your Messages to start chatting with ${req.body.username}.`, // Plain text body of the email i.e.
                // html: `Embedded image: <img src="${req.body.pic}"/>`,
                // attachments: [{
                //     filename: 'image.png',
                //     path: `./public/img/${fileName}`,
                //     cid: 'unique@nodemailer.com' //same cid value as in the html img src
                // }]
            };
              transport.sendMail(message, function(err, info) { //using transport variable to use sendmail method -> send approved email to client, message is parameter
                if (err) {
                  console.log(err)
                } else {
                  console.log(info);
                }
            });

            //accept and update RECEIVER PROFILE
            db.collection('profile')
            .findOneAndUpdate({username:req.user.local.email}, {
              $push: {
                connections:req.body.username
            },
            $pull:{
                receivedRequests:req.body.username
            }
            }, {
            sort: {_id: 1},
             upsert: false
            }, (err, result) => {
              if (err) return res.send(err)
              //update SENDER PROFILE
              db.collection('profile')
              .findOneAndUpdate({username:req.body.username}, {
                $push: {
                  connections:req.user.local.email
              },
              $pull:{
                  sentRequests:req.user.local.email
              }
              }, {
              sort: {_id: 1},
               upsert: false
              }, (err, result) => {
                if (err) return res.send(err)
                res.send(result)
              })
            })
        })

        //declining connection requests
            app.put('/decline', (req, res) => {

                //accept and update RECEIVER PROFILE
                db.collection('profile')
                .findOneAndUpdate({username:req.user.local.email}, {
                  $push: {
                    declinedRequests:req.body.username
                },
                $pull:{
                    receivedRequests:req.body.username
                }
                }, {
                sort: {_id: 1},
                 upsert: false
                }, (err, result) => {
                  if (err) return res.send(err)
                  //update SENDER PROFILE
                  db.collection('profile')
                  .findOneAndUpdate({username:req.body.username}, {
                    $push: {
                      connections:req.user.local.email
                  },
                  $pull:{
                      sentRequests:req.user.local.email
                  }
                  }, {
                  sort: {_id: 1},
                   upsert: false
                  }, (err, result) => {
                    if (err) return res.send(err)
                    res.send(result)
                  })
                })
            })

    // PRIVATE MESSAGES ------------------------------------
    app.get('/messages', function(req, res) {
        db.collection('profile').find().toArray((err, result) => {
             if (err) return console.log(err)
             var userFilter = result.filter((e) => {
                 return e.username.includes(req.user.local.email)
             })
            var connectionUsers = result.filter((e) =>{
              return userFilter[0].connections.includes(e.username)})
            db.collection('messages').find({receiver:req.user.local.email }).toArray((err, msg) => {
                   if (err) return console.log(err)
                res.render('messages.ejs', {
                    user : req.user,
                    profile: userFilter,
                    receivedMessages:msg,
                    connections: connectionUsers
                    })

            })
        })
    });
        // ----------GO TO INDIVIDUAL PRIVATE MESSAGE ---------------------
        app.get('/messages/:username', function(req, res) {
            let username = req.params.username
            db.collection('profile').find().toArray((err, users) => {
                if (err) return console.log(err)
                const userFilter = users.filter(function(users) {
                    if(req.user.local.email == users.username){
                        return true
                    }
                })
                const otherUser = users.filter((e)=>{
                    return e.username.includes(req.params.username)
                })

            db.collection('messages').find(
                {
        $and : [
            { $or : [ { sender : req.user.local.email }, { sender : username } ] },
            { $or : [ { receiver : username }, { receiver: req.user.local.email } ] }
                ]
                }

                ).toArray((err, result) => {
                    console.log(result, "THESE ARE MSGS -- PLZ")
                  if (err) return console.log(err)
                  res.render('userMessage.ejs', {
                    user : req.user,
                    profile: userFilter,
                    messages: result,
                    otherUser: otherUser
                  })
                })
        })
    })
    // ----------POST INDIVIDUAL PRIVATE MESSAGE -------------------
app.post('/messages', function(req, res) {
    let message = req.body.messages
    let sender = req.user.local.email
    message.sender = sender
db.collection('messages').insertOne( message, (err, result) => {
  if (err) return console.log(err)
  let success = {test:"strings"}
  res.send(success)
})

})


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // app.delete('/profile', (req, res) => {
    //   db.collection('profile').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    //     if (err) return res.send(500, err)
    //     res.send('Message deleted!')
    //   })
    // })

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
