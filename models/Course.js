const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: [{
        title: String,
        videoUrl: String,
        text: String,
        type: {
            type: String,
            enum: ['video', 'pdf'],
            default: 'video'
        }
    }],
    price: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
