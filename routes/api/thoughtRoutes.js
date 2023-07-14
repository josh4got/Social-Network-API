const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Thought = require('../../models/Thought');
const User = require('../../models/User');
const Reaction = require('../../models/Reaction')

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
  let createdThought; // Declare a variable to store the created thought

  Thought.create(req.body)
    .then(dbThoughtData => {
      createdThought = dbThoughtData; // Assign the created thought to the variable
      return User.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: dbThoughtData._id } },
        { new: true }
      );
    })
    .then(dbUserData => {
      res.json({
        thought: createdThought, // Use the stored created thought
        user: dbUserData
      });
    })
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
router.delete('/thoughts/:thoughtId', (req, res) => {
  const { thoughtId } = req.params;
  
  Thought.findOneAndDelete({ _id: thoughtId })
    .then(dbThoughtData => {
      if (!dbThoughtData) {
        console.log('No thought found with this id!');
        return res.sendStatus(404);
      }

      // Delete any reactions associated with the thought
      const reactionIds = dbThoughtData.reactions.map(reaction => reaction._id);
      return Reaction.deleteMany({ _id: { $in: reactionIds } })
        .then(() => {
          console.log('Thought and reactions deleted successfully');
          res.json({ message: 'Thought and reactions deleted' });
        });
    })
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
router.delete('/reactions/:reactionId', async (req, res) => {
  const { reactionId } = req.params;

  if (!mongoose.isValidObjectId(reactionId)) {
    return res.status(400).json({ message: 'Invalid reaction ID!' });
  }

  try {
    const dbThoughtData = await Thought.findOneAndUpdate(
      { 'reactions._id': reactionId },
      { $pull: { reactions: { _id: reactionId } } },
      { new: true }
    ).populate('reactions');

    if (!dbThoughtData) {
      return res.status(404).json({ message: 'No thought found with this reaction ID!' });
    }

    console.log('Reaction deleted successfully');
    res.json({ message: 'Reaction deleted successfully' });
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

module.exports = router;