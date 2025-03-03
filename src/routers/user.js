import express from 'express'
import User from '../models/user.js'
import auth from "../middleware/auth.js"
import { sendWelcomeEmail, sendDeletionEmail } from '../../emails/accout.js'
import multer from 'multer'
import sharp from 'sharp'
const router = new express.Router()

// router.get('/test', (req, res) => {
//     res.send('from a new file')
// })
//initially all these were inside index.js with app.post, app.get,...
// router



router.post('/users', async (req, res) => {          //creating a new user here
    // console.log(req.body)               //save code here and send req in postman, in terminal you'll see the data that you provided in postman
    // res.send('testing!!')           //used in postman using POST request and 'testing' was seen

    // const user = new User(req.body)          //this code works when no async is used
    // user.save().then(() => {
    //     res.status(201)                      //201 status is for creation
    //     res.send(user)                       //providing the updated user to the console, can view in postman console
    // }).catch((e) => {
    //     res.status(400)                   //provided the relevant status - change password to length less than 7 and press send, and see status code
    //     res.send(e)                      //we need to provide error and also change the status code
    // })

    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user: user, token: token })
    } catch (e) {
        res.status(400).send(e)
    }

})

//JSON WEB TOKENS WILL BE USED TO AUTHENTICATE USER FOR LOGIN AND USE OTHER REQUESTS
//npm i jsonwebtokenn

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)             //this is custom method made by us, to check credentials
        const token = await user.generateAuthToken()

        // res.send({ user: user.getPublicProfile(), token: token })        1st method to remove pass & token sending back
        res.send({ user, token })                                       //2nd method
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//req ---> auth middleware ---> route handler(the callback fxn)
//in Read users req, check header -> key(authorization) & value(Bearer [token value])
//above method was changed , check authorisation tab in there(postman)

router.get('/users/me', auth, async (req, res) => {           //fetch all users ---> (changed to fetch profile on user that is logged in)
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((e) => {
    //     res.status(500).send()
    // })

    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }

    res.send(req.user)  //req.user is coming from the auth middleware :D
})



//not required as one cant be able to see other guy's profile
// router.get('/users/:id', async (req, res) => {       //fetch unique users by "id"
//     // console.log(req.params)
//     const _id = req.params.id

//     // User.findById(_id).then((user) => {
//     //     if (!user) {                        //when you are unable to find a user
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)                      //return that user

//     // }).catch((e) => {                       //to catch any other error
//     //     res.status(500).send()
//     // })

//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }

// })

router.patch('/users/me', auth, async (req, res) => {           //if you try to update a property that doesnt exist, 200 status(i.e no error) but wont reflect in databse

    //['name','password','address']
    const updates = Object.keys(req.body)                           //done to check if updating property already exists or not
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {        //isValOpe is a boolean var, if one single value is false, .every() will return false overall
        return allowedUpdates.includes(update)                   //false means, the update property does exist in database
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!!' })
    }

    try {
        //change done so mongoose doesnt bypass the update request()
        // const user = await User.findById(req.params.id)
        updates.forEach((update) => {                       // (user koi si bhi property update kar skta hai, isliye bracket notation)
            req.user[update] = req.body[update]                 //square brackets notaion used instead of dot notation, bcoz of dynamic input
        })

        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // if (!user) {                             //no need for this because the user will be already logged in
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)         //id was attached to request from the auth middleware
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.deleteOne()
        sendDeletionEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})

// if u use dest in upload, the file will be saved in the directory, but if u dont use it, the file will be passed to the route handler
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // console.log(req.file)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

export default router