const mongoose = require("mongoose");

const kafedraYuklamaSchema = mongoose.Schema(
  {
    kafedra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kafedra",
      required: true,
    },

    itemId: { type: Number, unique: true },

    subject: {
      id:   Number,
      name: String,
      code: String,
    },

    subjectType: {
      code: String,
      name: String,
    },

    subjectBlock: {
      code: String,
      name: String,
    },

    subjectDetails: [
      {
        id: Number,
        trainingType: { code: String, name: String },
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

    ratingGrade: {
      code:       String,
      name:       String,
      template:   String,
      updated_at: Number,
    },

    examFinish: {
      code: String,
      name: String,
    },

    semester: {
      code: String,
      name: String,
    },

    curriculum:     Number,
    total_acload:   Number,
    resource_count: Number,
    in_group:       mongoose.Schema.Types.Mixed,
    at_semester:    Boolean,
    active:         Boolean,
    employees:      [Number],
    credit:         Number,
    created_at:     Number,
    updated_at:     Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("KafedraYuklama", kafedraYuklamaSchema);