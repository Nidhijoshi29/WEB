const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require('bcryptjs');

    
const userSchema = new Schema({
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    loginHistory: [{
        dateTime: {
            type: Date,
        },
        userAgent: {
            type: String,
        }
    }]
  });

  let User;

  function Initialize(){
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err)=>{
            reject(err); 
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           console.log("connected to Mongo DB")
           resolve();
        });
    });

}

function registerUser(userData){
    return new Promise((resolve, reject)=> {
        if(userData.password !== userData.password2){
            reject(new Error("Passwords do not match"));
        }else{
            bcrypt
  .hash(userData.password, 10)
  .then((hash) => {
    userData.password = hash;
    let newUser = new User(userData);
            newUser.save()
            .then(() =>{
                resolve();
                console.log("Successfully reg")
            })
            .catch((err)=>{
                if(err.code === 11000){
                    reject(new Error("User Name already taken"));
                }else{
                    reject(new Error(`There was an error creating the user: ${err}`));
                }
            })
          })
          .catch((err) => {
            console.log(err); 
            reject(new Error(`There was an error encrypting the password`));
          });

        }
    });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName }).exec()
      .then((users) => {
        if (users.length === 0) {
          reject(new Error(`Unable to find user: ${userData.userName}`));
        } else {
          bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
              if (result) {
                if (users[0].loginHistory && users[0].loginHistory.length === 8) {
                  users[0].loginHistory.pop();
                }
                users[0].loginHistory.unshift({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });
                User.updateOne(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } }
                )
                .exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject(new Error(`There was an error updating user login history: ${err}`));
                  });
              } else {
                reject(new Error(`Incorrect Password for user: ${userData.userName}`));
              }
            })
            .catch((err) => {
              reject(new Error(`Error comparing passwords: ${err}`));
            });
        }
      })
      .catch((err) => {
        reject(new Error(`Error finding user: ${err}`));
      });
  });
}

  
  
  module.exports = {
    Initialize,
    registerUser,
    checkUser,
  };