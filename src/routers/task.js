const express = require('express')
const {ObjectID} = require('mongodb')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    //Add on the user's id to the request body to make the new Task instance
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }

})

//Filter: GET /tasks?completed=true/false
//Paginate: GET /tasks?limit=10&skip=20
//Sort: GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    //If the completed query exists ("true" or "false")
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    //If sortBy query exists
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        //Set to 1 for ascending, -1 for descending
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)

    } catch(e) {
        res.status(500).send(e)
    }

})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    //First check if the param can be an id
    if (!ObjectID.isValid(_id)) {
        return res.status(404).send()
    }

    //Then check if theres a match
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send()
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {
    //First check if the updates (keys in req) are allowed
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send('Invalid updates.')
    }

    console.log('hi')

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }

})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.send(500).send(e)
    }
})


module.exports = router