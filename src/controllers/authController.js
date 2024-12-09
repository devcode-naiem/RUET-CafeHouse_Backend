// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');
const { validateSignupData } = require('../utils/validators');
const { generateToken, setTokenCookie, } = require('../utils/jwt')


const signup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate input data
        const validationErrors = validateSignupData({ name, email, phone, password });
        if (validationErrors.length > 0) {
            logger.warn('Signup validation failed');
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmailOrPhone(email, phone);
        if (existingUser) {
            logger.warn('Signup attempt with existing email/phone');
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone number already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        logger.info(`New user registered: ${email}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        logger.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user account'
        });
    }
};


const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            logger.warn('Signin attempt with missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
            const payload = {
                userId: 'admin',
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
                phone: 'admin',
                role: 'admin'
            }
            // Generate JWT token
            const token = generateToken(payload);
            setTokenCookie(res, token);

            logger.info(`Admin signed in successfully: ${email}`);
            return res.status(200).json({
                success: true,
                message: 'Admin signed in successfully',
                admin: true,
                data: {
                    userId: 0,
                    name: 'Admin',
                    email: process.env.ADMIN_EMAI,
                    phone: '0000000000',
                    role: 'admin',
                    token
                }
            });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            logger.warn(`Signin attempt with non-existent email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn(`Invalid password attempt for user: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const payload = {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: 'user'
        }
        // Generate JWT token
        const token = generateToken(payload);
        setTokenCookie(res, token);

        logger.info(`User signed in successfully: ${email}`);

        // Send response with user data and token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: 'user',
                token
            }
        });

    } catch (error) {
        console.log(error);
        logger.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during sign in'
        });
    }
};

const logout = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });

        res.json({
            success: true,
            message: 'User logout successful'
        });
    } catch (error) {
        logger.error('User logout error:', error);
        res.status(500).json({
            success: false,
            message: 'User logout failed'
        });
    }
};


module.exports = {
    signup,
    signin,
    logout
};