// config/online database.js
module.exports = {

    'url' : "mongodb+srv://dbDemoRC:DEMODAY@cluster0.kqqhw.mongodb.net/demoDB?retryWrites=true&w=majority",
    // 'url':"mongodb://localhost:27017/demoDB",

    'dbName': 'demoDB'
};


//command to start mongodb-community
// sudo mongod --config /usr/local/etc/mongod.conf

//conenct local db
// use demoDB

//create a user 
// db.createUser(
//    {
//      user: "dbDemoRC",
//      pwd: "DEMODAY",
//      roles: [
//        { role: "readWrite", db: "demoDB" }
//     ]
//   }
//  )

//NOT IN MONGOSHELL!!!!
// to export DB to local

// mongodump --uri="mongodb+srv://dbDemoRC:DEMODAY@cluster0.kqqhw.mongodb.net/demoDB?retryWrites=true&w=majority"

//mongorestore dump/
