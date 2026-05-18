// ← master router — connects all routes
const express = require('express');

const router = express.Router();

const authRoutes = require('./auth');
const onboardingRoutes = require('./onboarding');
const userRoutes = require('./user');

// mount each router with its base path

router.use('/', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/user', userRoutes);

module.exports = router;