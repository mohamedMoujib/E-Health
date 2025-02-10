const mongoose = require('mongoose');
const User = require('./User');

const admin = new mongoose.Schema(
    {

    }
);

const Admin = User.discriminator('Admin', admin);

module.exports = Admin;
