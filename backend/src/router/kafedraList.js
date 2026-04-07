const express = require("express");
const router = express.Router();
const ctrl = require("../controller/kafedraList");

router.get("/api/departments", ctrl.getDepartments);
router.get("/api/kafedra", ctrl.getKafedraList);
router.post("/api/kafedra-yuklamalar/sync", ctrl.sync);
router.get("/api/kafedra-yuklamalar", ctrl.getAll);
router.patch("/api/kafedra/:id/tasdiq", ctrl.updateTasdiq);

module.exports = router;
