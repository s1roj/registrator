const Admin = require("../model/admin.js");
const bcrypt = require("bcryptjs");

module.exports = async function createHelper() {
  try {
    const phone = "997445218";
    const plainPassword = "siroojidd1n";

    const exists = await Admin.findOne({ phone });
    if (exists) {
      return;
    }

    const hash = await bcrypt.hash(plainPassword, 10);

    await Admin.create({
      name: "Super Admin",
      phone,
      password: hash,
      role: "admin",
      secret: "Z3JCcc_28qcwegUzOk_d-DGOHn9vJSEa",
    });
  } catch (err) {
    console.error(err);
  }
};
