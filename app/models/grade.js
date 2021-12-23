const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

const gradeSchema = new mongoose.Schema({
	_id: ObjectId,
	classId: Number,
	studentId: Number,
	hexaId: String,
	examScore: Number,
	homeworkScore: Number,
	quizScore: Number,
})

const Grade = mongoose.model('Grade', gradeSchema)

// exports.Grade = Grade
module.exports.Grade = Grade
