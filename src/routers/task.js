import express from 'express'
import Task from '../models/task.js'
import auth from '../middleware/auth.js'

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {     //create task
    // console.log(req.body)                //this will show in terminal in VS code
    // res.send('tasks testing!!')          //this will show in postman terminal

    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    // task.save().then(() => {
    //     res.status(201)
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(400)
    //     res.send(e)
    // })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})


//GET /tasks?completed=false (? = query string, used to apply filters just like we used in weather-app)

//GET /tasks?limit=10&skip=20 (limit tells how many items per page & skip will skip that many items i.e. used for pagination)

//GET /tasks?sortBy=createdAt_desc/asc              can also use ':' to seprate field and order, will be separating them anyways
//----------------- (field)-&-(order)
router.get('/tasks', auth, async (req, res) => {          //search tasks
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'        //query will either have true or false, but we will get that as a string thats why we need to convert it to boolean
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')               //parts is an array containing the field(part[0]) that needs to be sorted and in which order (part[1])
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1           //
    }
    try {
        // const tasks = await Task.find({})
        // const tasks = await Task.find({ owner: req.user._id })
        // await req.user.populate('tasks')
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                // limit: 2,
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                // sort: {
                //     // createdAt: -1,              //1->asc, -1->desc
                //     completed: -1
                // }
                sort: sort
            }
        })
        // res.send(tasks)
        res.send(req.user.tasks)

    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {          //search a particular task
    const _id = req.params.id
    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send()
    //     }

    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send()
    // })

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {            //update task

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!!' })
    }

    try {

        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        return res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})


router.delete('/tasks/:id', auth, async (req, res) => {           //delete task
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

export default router 