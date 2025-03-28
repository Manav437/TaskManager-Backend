///87 structuring  a REST API
//      -Create  POST    /tasks
//
//      -Read    GET     /tasks
//               GET     /tasks/:id
//
//      -Update  PATCH   /tasks/:id
//
//      -Delete  DELETE  /tasks/:id 


//npm i nodemon --save-dev  (installed as dev dependency)

//npm i express

import mongoose, { mongo } from "mongoose"
import validator from 'validator'
mongoose.connect(process.env.MONGODB_URL)
// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api')
//npm validator is a famous library that you can use for email, cards, etc validation :) 

//const User = mongoose.model('', {...}) was cut and pasted in /db/user.js


//const task = mongoose.model(...) cut and pasted in/db/task.js


// const me = new User({
//     name: 'Danav',
//     email: 'manav.gussain@gmail.com',
//     password: '    xqyzbac1123   '
// })


// const taskMe = new Task({
//     description: '    eat lunch   ',
//     //completed: true,
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log(error)
// })

// taskMe.save().then(() => {
//     console.log(taskMe)
// }).catch((error) => {
//     console.log(error)
// })