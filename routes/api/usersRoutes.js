const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Thought = require('../../models/Thought');

// GET all users
router.get('/users', (req, res) => {
    User.find({})
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// GET a single user by its `_id` and populated thought and friend data
router.get('/users/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
        .populate('thoughts')
        .populate('friends')
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// POST a new user:
router.post('/users', (req, res) => {
    User.create(req.body)
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// Put to update a user by its `_id`
router.put('/users/:id', ({ params, body }, res) => {
    const { id } = params;
    User.findOneAndUpdate({ _id: id }, body, { new: true })
        .then(dbUserData => {
            if (!dbUserData) {
                console.log('No user found with this id!');
                res.sendStatus(404);
            } else {
                res.json(dbUserData);
            }
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// DELETE to remove user by its `_id`
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    User.findOneAndDelete({ _id: id })
        .then(dbUserData => {
            if (!dbUserData) {
                console.log('No user found with this id!');
                res.sendStatus(404);
            }
            // Remove a user's associated thoughts when deleted.
            return Thought.deleteMany({ _id: { $in: dbUserData.thoughts } });
        })
        .then(() => {
            res.json({ message: 'User and associated thoughts deleted!' });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

// /api/users/:userId/friends/:friendId

// POST to add a new friend to a user's friend list
// DELETE to remove a friend from a user's friend list