const router = require('express').Router();
const userRoutes = require('./userRoutes');
const thoughtRoutes = require('./thoughtRoutes');

router.use('/api', userRoutes);
router.use('/api', thoughtRoutes)

module.exports = router;