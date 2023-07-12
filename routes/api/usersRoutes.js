const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Thought = require('../../models/Thought');

// GET all users
// GET a single user by its `_id` and populated thought and friend data
// POST a new user:
// Put to update a user by its `_id`
// DELETE to remove user by its `_id`
// BONUS: Remove a user's associated thoughts when deleted.

// /api/users/:userId/friends/:friendId

// POST to add a new friend to a user's friend list
// DELETE to remove a friend from a user's friend list