// api/thoughts

// GET to get all thoughts
app.get('/thoughts', (req, res) => {
    Thought.find({})
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// GET to get a single thought by its _id
app.get('/thoughts/:id', (req, res) => {
    Thought.findOne({ _id: req.params.id })
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// POST to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
app.post('/thoughts', (req, res) => {
    Thought.create(req.body)
        .then(dbThoughtData => {
            return User.findOneAndUpdate(
                { _id: req.body.userId },
                { $push: { thoughts: dbThoughtData._id } },
                { new: true}
            );
        })
        .then(() => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// PUT to update a thought by its '_id'
app.put('/thoughts/:id', ({ params, body }, res) => {
    const { id } = params;
    Thought.findOneAndUpdate(id, body, { new: true })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                console.log('No thought found with this id!');
                res.sendStatus(404);
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});
// DELETE to remove a thought by its '_id'
app.delete('/thoughts/:id', (req, res) => {
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
// /api/thoughts/:thoughtId/reactions

// POST to create a reaction stored in a single thought's reactions array field
// DELETE to pull and remove a reaction by the reaction's reactionId value
