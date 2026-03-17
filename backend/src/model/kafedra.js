const mongoose = require("mongoose");

const kafedraSchema = mongoose.Schema(
  {
    departmentId: { type: Number, unique: true },
    name: { type: String, required: true },
    code: { type: String },
    structureType: { code: String, name: String },
    localityType: { code: String, name: String },
    parent: Number,
    active: Boolean,

    oquvYili: { type: String, default: "" },
    semestrTuri: { type: String, default: "" },
    tasdiqKuzgi: { type: Boolean, default: false },
    tasdiqBahorgi: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Kafedra", kafedraSchema);
