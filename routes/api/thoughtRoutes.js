const express = require('express');
const router = express.Router();
const Thought = require('../../models/Thought');
const User = require('../../models/User');

// GET to get all thoughts
router.get('/thoughts', (req, res) => {
    Thought.find({})
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

// GET to get a single thought by its _id
router.get('/thoughts/:id', (req, res) => {
    Thought.findOne({ _id: req.params.id })
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

// POST to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
router.post('/thoughts', (req, res) => {
    Thought.create(req.body)
        .then(dbThoughtData => {
            return User.findOneAndUpdate(
                { _id: req.body.userId },
                { $push: { thoughts: dbThoughtData._id } },
                { new: true}
            );
        })
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

// PUT to update a thought by its '_id'
router.put('/thoughts/:id', ({ params, body }, res) => {
    const { id } = params;
    Thought.findOneAndUpdate({ _id: id }, body, { new: true })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                console.log('No thought found with this id!');
                res.sendStatus(404);
            } else {
                res.json(dbThoughtData);
            }
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

// DELETE to remove a thought by its '_id'
router.delete('/thoughts/:id', (req, res) => {
    const { id: thoughtId } = req.params;
    Thought.findOneAndDelete({ _id: thoughtId })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          console.log('No thought found with this id!');
          return res.sendStatus(404);
        }
        return User.findOneAndUpdate(
          { _id: dbThoughtData.userId },
          { $pull: { thoughts: thoughtId } },
          { new: true }
        );
      })
      .then(() => res.json({ message: 'Thought deleted!' }))
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
});

// POST to create a reaction stored in a single thought's reactions array field
router.post('/thoughts/:thoughtId/reactions', (req, res) => {
    const { thoughtId } = req.params;
    Thought.findOneAndUpdate(
      { _id: thoughtId },
      { $push: { reactions: req.body } },
      { new: true }
    )
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          console.log('No thought found with this id!');
          res.sendStatus(404);
        } else {
          res.json(dbThoughtData);
        }
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
});

// DELETE to pull and remove a reaction by the reaction's reactionId value
router.delete('/thoughts/:thoughtId/reactions/:reactionId', (req, res) => {
    const { thoughtId, reactionId } = req.params;
    Thought.findOneAndUpdate(
      { _id: thoughtId },
      { $pull: { reactions: { reactionId } } },
      { new: true }
    )
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          console.log('No thought found with this id!');
          return res.sendStatus(404);
        }
        if (dbThoughtData.reactions.length === 0) {
          console.log('No reaction found with this id!');
        }
        res.json(dbThoughtData);
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
});

module.exports = router;