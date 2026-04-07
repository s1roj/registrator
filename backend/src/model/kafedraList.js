const mongoose = require("mongoose");

const kafedraYuklamaSchema = mongoose.Schema(
  {
    departmentId: { type: Number, index: true },   
    oquvYili:     { type: String, index: true },   
    semestrTuri:  { type: String },

    itemId: { type: Number, unique: true },

    subject: {
      id:   Number,
      name: String,
      code: String,
    },

    subjectType:  { code: String, name: String },
    subjectBlock: { code: String, name: String },

    subjectDetails: [
      {
        id:            Number,
        trainingType:  { code: String, name: String },
        academic_load: Number,
      },
    ],

    subjectExamTypes: [
      {
        id:       Number,
        max_ball: Number,
        examType: { code: String, name: String },
      },
    ],

    curriculumId: Number,
    faculty: {
      id:   Number,
      name: String,
      code: String,
    },
    specialty: {
      id:   Number,
      name: String,
      code: String,
    },
    educationType: { code: String, name: String },
    educationForm: { code: String, name: String },

    semester: { code: String, name: String },

    ratingGrade: { code: String, name: String },
    examFinish:  { code: String, name: String },

    total_acload: Number,
    credit:       Number,
    active:       Boolean,
    employees:    mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

kafedraYuklamaSchema.index({ departmentId: 1, oquvYili: 1 });

module.exports = mongoose.model("KafedraYuklama", kafedraYuklamaSchema);