const mongoose = require('mongoose');

const privateEngagementSchema = new mongoose.Schema(
    {
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
        description: { type: String, required: true }, 
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const PrivateEngagement = mongoose.model('privateEngagement', privateEngagementSchema);

module.exports = PrivateEngagement;
