const axios = require("axios");
const Kafedra = require("../model/kafedra");
const KafedraYuklama = require("../model/kafedraList");

const BASE_URL = "https://student.tdmau.uz/rest/v1/data";

module.exports.getDepartments = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(400).json({ error: "Authorization header majburiy!" });
    }

    const response = await axios.get(
      `${BASE_URL}/department-list?_structure_type=12`,
      {
        headers: { Authorization: authHeader },
      },
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.sync = async (req, res) => {
  try {
    const { departmentId, oquvYili, semestrTuri, token } = req.body;

    if (!departmentId || !oquvYili || !token) {
      return res.status(400).json({
        error: "departmentId, oquvYili va token majburiy!",
      });
    }

    if (semestrTuri && !["kuzgi", "bahorgi"].includes(semestrTuri)) {
      return res.status(400).json({
        error: "semestrTuri faqat 'kuzgi' yoki 'bahorgi' bo'lishi mumkin!",
      });
    }

    syncFromApi(departmentId, oquvYili, semestrTuri || null, token).catch(
      (err) => {
        console.error("Sync xatosi:", err.message);
      },
    );

    res.json({
      success: true,
      message: "Sync boshlandi!",
      departmentId,
      oquvYili,
      semestrTuri: semestrTuri || "hammasi",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.getKafedraList = async (req, res) => {
  try {
    const data = await Kafedra.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.getAll = async (req, res) => {
  try {
    const { departmentId, oquvYili, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (oquvYili) filter.oquvYili = oquvYili;

    if (departmentId) {
      const kafedra = await Kafedra.findOne({
        departmentId: Number(departmentId),
      });
      if (kafedra) filter.kafedra = kafedra._id;
    }

    const data = await KafedraYuklama.find(filter)
      .populate("kafedra", "name code departmentId")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await KafedraYuklama.countDocuments(filter);

    res.json({ success: true, data, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.updateTasdiq = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasdiqKuzgi, tasdiqBahorgi } = req.body;

    const updateFields = {};
    if (tasdiqKuzgi !== undefined) updateFields.tasdiqKuzgi = tasdiqKuzgi;
    if (tasdiqBahorgi !== undefined) updateFields.tasdiqBahorgi = tasdiqBahorgi;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "tasdiqKuzgi yoki tasdiqBahorgi kerak!" });
    }

    const updated = await Kafedra.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Topilmadi" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function getMatchedSemesterCodes(
  curriculumIds,
  educationYear,
  semestrTuri,
  token,
) {
  const matchedCodes = [];

  for (const currId of curriculumIds) {
    const semRes = await axios.get(`${BASE_URL}/semester-list`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { _curriculum: currId },
    });

    const semesters = semRes.data?.data?.items || [];

    semesters.forEach((s) => {
      if (s._education_year !== educationYear) return;

      const isKuzgi = s.position % 2 !== 0;
      const isBahorgi = s.position % 2 === 0;

      if (!semestrTuri) matchedCodes.push(s.code); 
      if (semestrTuri === "kuzgi" && isKuzgi) matchedCodes.push(s.code);
      if (semestrTuri === "bahorgi" && isBahorgi) matchedCodes.push(s.code);
    });
  }

  return [...new Set(matchedCodes)];
}
async function syncFromApi(departmentId, oquvYili, semestrTuri, token) {
  const educationYear = oquvYili.split("-")[0];

  console.log(
    `Sync boshlandi: department=${departmentId}, oquvYili=${oquvYili}, semestrTuri=${semestrTuri}`,
  );

  const firstRes = await axios.get(`${BASE_URL}/curriculum-subject-list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { _department: departmentId, page: 1 },
  });

  const firstItems = firstRes.data.data.items;

  if (firstItems.length === 0) {
    console.error("Fanlar topilmadi");
    return;
  }

  const curriculumIds = [...new Set(firstItems.map((i) => i._curriculum))];
  console.log(`Curriculum ID lar:`, curriculumIds);

  const matchedCodes = await getMatchedSemesterCodes(
    curriculumIds,
    educationYear,
    semestrTuri,
    token,
  );

  console.log(`Mos semester code lar (${semestrTuri}):`, matchedCodes);

  if (matchedCodes.length === 0) {
    console.error(`${oquvYili} uchun ${semestrTuri} semestrlar topilmadi`);
    return;
  }

  const dept = firstItems[0].department;
  const kafedraDoc = await Kafedra.findOneAndUpdate(
    { departmentId: dept.id },
    {
      $set: {
        departmentId: dept.id,
        name: dept.name,
        code: dept.code,
        structureType: dept.structureType,
        localityType: dept.localityType,
        parent: dept.parent,
        active: dept.active,
        oquvYili,
        semestrTuri,
      },
      $setOnInsert: {
        tasdiqKuzgi: false,
        tasdiqBahorgi: false,
      },
    },
    { upsert: true, new: true },
  );

  console.log(`Kafedra: ${kafedraDoc.name}`);

  let page = 1;
  let totalPages = firstRes.data.data.pagination.pageCount;

  while (page <= totalPages) {
    console.log(`Sahifa: ${page} / ${totalPages}`);

    let items;
    if (page === 1) {
      items = firstItems;
    } else {
      const res = await axios.get(`${BASE_URL}/curriculum-subject-list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { _department: departmentId, page },
      });
      items = res.data.data.items;
    }

    const filteredItems = items.filter((item) =>
      matchedCodes.includes(item.semester?.code),
    );

    console.log(`Jami: ${items.length}, mos: ${filteredItems.length}`);

    if (filteredItems.length > 0) {
      const operations = filteredItems.map((item) => ({
        updateOne: {
          filter: { itemId: item.id },
          update: {
            $set: {
              kafedra: kafedraDoc._id,
              itemId: item.id,
              subject: item.subject,
              subjectType: item.subjectType,
              subjectBlock: item.subjectBlock,
              subjectDetails: item.subjectDetails,
              subjectExamTypes: item.subjectExamTypes,
              ratingGrade: item.ratingGrade,
              examFinish: item.examFinish,
              semester: item.semester,
              curriculum: item._curriculum,
              total_acload: item.total_acload,
              resource_count: item.resource_count,
              in_group: item.in_group,
              at_semester: item.at_semester,
              active: item.active,
              employees: item._employees || [],
              credit: item.credit,
              created_at: item.created_at,
              updated_at: item.updated_at,
            },
          },
          upsert: true,
        },
      }));

      await KafedraYuklama.bulkWrite(operations);
      console.log(`${filteredItems.length} ta yozuv saqlandi`);
    }

    page++;
  }

  console.log(
    `Sync tugadi! Kafedra: ${kafedraDoc.name}, ${oquvYili} ${semestrTuri}`,
  );
}
