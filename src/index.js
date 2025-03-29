// /Users/manavgusain/mongoDB/bin/mongod --dbpath=/Users/manavgusain/mongoDB-data

//initialising point of our app
import express from "express"
import "./db/mongoose.js"
import userRouter from "./routers/user.js"
import taskRouter from './routers/task.js '
import cors from "cors";

const app = express()
const port = process.env.PORT || 3000

//use of middleware :  new request ---> do something ---> run route handler
// app.use((req, res, next) => {
//     // console.log(req.method, req.path)
//     // next()

//     // if (req.method === 'GET') {                     //GET request will not run, others will run normally
//     //     res.send('GET requests are disabled!')
//     // } else {
//     //     next()
//     // }

//     res.status(503).send('Site is currently down. Check back soon!!')   //for when site is down for maintenance, no requests can be used
// })
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "https://taskmanager-frontend-2qcg.onrender.com", // Allow requests from your frontend
        methods: "GET,POST,PATCH,PUT,DELETE", // Allowed request methods
        credentials: true, // Allow cookies & authentication headers
    })
);

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use(express.json())         //in postman under body data was sent but in order to catch it we use this line

//router example---> how to use router
// const router = new express.Router()                 // create a router
// router.get('/test', (req, res) => {                 // setup the routes
//     res.send('this is from other router')
// })

app.use(userRouter)                                     // regsiter with express application
app.use(taskRouter)

//initially all the requests were done using promise chaining but then converted to async-await functions

//users routes moved to src/routers/user.js

//tasks routes moved to src/routers/task.js


//securely storing passwords ---> using bcryptjs

app.listen(port, () => {
    console.log('Server is up on ' + port)
})


// import bycrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

//hashing algorithms are one way algorithms

// const myFxn = async () => {
// const password = 'Red12345!'
// const hashedPassword = await bycrypt.hash(password, 8)      //8 is the number of rounds of hashing that needs to be done on the plain-text password

// console.log(password)
// console.log(hashedPassword)

// const isMatch = await bycrypt.compare('Red12345!', hashedPassword)      //true if given pass matches with hashedPass stored in databse, else false
// console.log(isMatch)

//first arg is object to check in databse, second is a string(secret),secret has to same for sign() and verify() 
// const token = jwt.sign({ _id: 'abc123' }, 'thisismynewtoken', { expiresIn: '7 days' })              //to create a new jwt token
// console.log(token)            //o/p --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
//a                            //.eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE3Mzk5NDc2ODN9
//b                            // .phqqEVAtImtHSm3IhWSisXlUbsuDPsX42tx8y4YCrbU

// const data = jwt.verify(token, 'thisismynewtoken')
// console.log(data)           //o/p -> { _id: 'abc123', iat: 1739949042 }
// }

// myFxn()


// import Task from "./models/task.js"
// import User from "./models/user.js"

// const main = async () => {
// const task = await Task.findById('67bdddaf128ccc4ccac20840')
// await task.populate('owner')
// console.log(task.owner)

// const user = await User.findById('67bddd523ca74ca822a0ebcf')
// await user.populate('tasks')
// console.log(user.tasks)
// }

// main()


// import multer from "multer"

//creating a instance of multer to upload files
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000               //has to be in bits 1mil bits = 1megabit
//     },
//     fileFilter(req, file, cb) {             //when u want a specific type of file i.e. either doc, pdf, jpg,etc
//         // if (!file.originalname.endsWith('.pdf')) {
//         if (!file.originalname.match(/\.(doc|docx)$/)) {             //using regular expression
//             return cb(new Error('Please upload a word doc!!'))
//         }

//         cb(undefined, true)

//         // cb(new Error('File must be a PDF!'))
//         // cb(undefined, true)             //undefined means no error, true means accepted, false mean rejected
//         // cb(undefined, false)
//     }
// })

// const errorMiddleware = (req, res, next) => {
//     throw new Error('From my middleware')
// }
// app.post('/upload', upload.single('upload'), (req, res) => {
//     // app.post('/upload', errorMiddleware, (req, res) => {
//     res.send()
// }, (error, req, res, next) => {                 //used to handle errors express
//     res.status(400).send({ error: error.message })
// })
