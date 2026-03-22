const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// Public
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

const upload = require('../middleware/upload');

// Admin only
router.post('/', [auth(['admin']), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }])], courseController.createCourse);
router.put('/:id', [auth(['admin']), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }])], courseController.updateCourse);
router.delete('/:id', auth(['admin']), courseController.deleteCourse);

module.exports = router;
