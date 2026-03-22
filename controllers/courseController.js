const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, description, price, contentType } = req.body;
        let videoUrl = req.body.videoUrl;
        let imageUrl = '';

        if (req.files) {
            if (req.files.file) {
                videoUrl = `http://localhost:5000/uploads/${req.files.file[0].filename}`;
            }
            if (req.files.image) {
                imageUrl = `http://localhost:5000/uploads/${req.files.image[0].filename}`;
            }
        }

        const course = new Course({
            title,
            description,
            price,
            imageUrl,
            content: [{
                title: 'Main Content',
                videoUrl: videoUrl,
                text: 'Course Material',
                type: contentType || 'video'
            }]
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const { title, description, price, contentType } = req.body;
        let videoUrl = req.body.videoUrl;

        // This simplistic update replaces the content array. In a real app, you'd update specific indices.
        const updateData = {
            title,
            description,
            price,
            content: [{
                title: 'Main Content',
                videoUrl: videoUrl,
                text: 'Course Material',
                type: contentType || 'video'
            }]
        };

        if (req.files) {
            if (req.files.file) {
                videoUrl = `http://localhost:5000/uploads/${req.files.file[0].filename}`;
                updateData.content[0].videoUrl = videoUrl;
            }
            if (req.files.image) {
                updateData.imageUrl = `http://localhost:5000/uploads/${req.files.image[0].filename}`;
            }
        }

        const course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
