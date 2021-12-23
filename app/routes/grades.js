const dbConfig = require("../config/db.config.js");
const { Grade } = require("../models/grade")
const router = require("express").Router()
var ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Mongoose connected to DB."))
.catch((error) => console.error("Mongoose DB connection failed: ", error.message))

router.get("/", async(req, res) => {
  try {
    const grades = await Grade.find().limit(10).sort({ examScore: -1 })
    res.send(grades)
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
});

router.post("/", async(req, res) => {

  const {_id, classId, studentId, hexaId, examScore, homeworkScore, quizScore} = req.body;

  let grade = new Grade({
    _id, classId, studentId, hexaId, examScore, homeworkScore, quizScore
  });

  try {
    grade = await grade.save();
    res.send(grade)
  } catch (error) {
    res.status(500).send(error.message)
    console.error(error.message);
  }

});

router.delete("/:id", async (req, res) => {
  try {
    const grade = await Grade.findById(new ObjectId(req.params.id));
    if(! grade) return res.status(404).send("Grade not found");

    const deletedGrade = await Grade.findByIdAndDelete(new ObjectId(req.params.id));
    res.send(deletedGrade)
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const grade = await Grade.findById(new ObjectId(req.params.id));
    if(! grade) return res.status(404).send("Grade not found");

    const {classId, studentId, examScore, homeworkScore, quizScore} = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(
      new ObjectId(req.params.id),
      {
        classId, studentId, examScore, homeworkScore, quizScore
      },
      {new: true}
    );

    res.send(updatedGrade);
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const grade = await Grade.findById(new ObjectId(req.params.id));
    if(! grade) return res.status(404).send("Grade not found");

    const {examScore} = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(
      new ObjectId(req.params.id),
      {
        examScore: 50
      }
    );

    res.send(updatedGrade);
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error.message);
  }
});

module.exports = router
