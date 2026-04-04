const mongoose = require("mongoose");

const kafedraYuklamaSchema = mongoose.Schema(
  {
    kafedra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kafedra",
      required: true,
    },
    itemId: { type: Number, unique: true },
    subject: { id: Number, name: String, code: String },
    subjectType: { code: String, name: String },
    subjectBlock: { code: String, name: String },

    subjectDetails: [
      {
        id: Number,
        trainingType: { code: String, name: String },
        academic_load: Number,
      },
    ],
    subjectExamTypes: [
      {
        id: Number,
        max_ball: Number,
        examType: { code: String, name: String },
      },
    ],

    faculty: { id: Number, name: String, code: String }, 
    specialty: { id: Number, name: String, code: String }, 

    semester: { code: String, name: String },
    curriculum: Number,
    total_acload: Number,
    credit: Number,
    active: Boolean,
    employees: [Number],
  },
  { timestamps: true },
);

module.exports = mongoose.model("KafedraYuklama", kafedraYuklamaSchema);
