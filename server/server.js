require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected successfully');

        // Create admin user if not exists
        const adminPhone = '8688235701';
        const existingAdmin = await User.findOne({ phone: adminPhone });

        if (!existingAdmin) {
            await User.create({
                name: 'Abdul Lateef',
                phone: adminPhone,
                email: 'admin@bismillahchicken.com',
                password: 'zaid',
                address: 'Near Water Tank, Penjerla Road, Kothur',
                role: 'admin'
            });
            console.log('👤 Admin user created: Abdul Lateef (8688235701)');
        } else if (existingAdmin.role !== 'admin') {
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('👤 Upgraded existing user to admin: Abdul Lateef');
        } else {
            console.log('👤 Admin user exists: Abdul Lateef');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Bismillah Chicken Centre API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
