const axios = require("axios");
const Kafedra = require("../model/kafedra");
const KafedraYuklama = require("../model/kafedraList");

const BASE_URL = "https://student.tdmau.uz/rest/v1/data";

async function getMatchedSemesterCodes(
  curriculumIds,
  educationYear,
  semestrTuri,
  token,
) {
  const matchedCodes = [];
  const headers = { Authorization: `Bearer ${token}` };

  for (const currId of curriculumIds) {
    try {
      const semRes = await axios.get(`${BASE_URL}/semester-list`, {
        headers,
        params: { _curriculum: currId },
      });

      const semesters = semRes.data?.data?.items || [];

      semesters.forEach((s) => {
        const sYear = s.educationYear?.code || s._education_year;
        if (String(sYear) !== String(educationYear)) return;

        const position = Number(s.position);
        const isKuzgi = position % 2 !== 0;
        const isBahorgi = position % 2 === 0;

        const type = semestrTuri ? semestrTuri.toLowerCase() : null;

        if (!type) {
          matchedCodes.push(s.code);
        } else if (type === "kuzgi" && isKuzgi) {
          matchedCodes.push(s.code);
        } else if (type === "bahorgi" && isBahorgi) {
          matchedCodes.push(s.code);
        }
      });
    } catch (e) {
      console.error(`Semester API xatosi (Curriculum: ${currId}):`, e.message);
    }
  }

  return [...new Set(matchedCodes)];
}

async function syncFromApi(departmentId, oquvYili, semestrTuri, token) {
  const educationYearCode = oquvYili.split("-")[0];
  const headers = { Authorization: `Bearer ${token}` };

  console.log(`Sync boshlandi: Yil=${educationYearCode}, Turi=${semestrTuri}`);

  const currListRes = await axios.get(`${BASE_URL}/curriculum-list`, {
    headers,
    params: { limit: 500 },
  });
  const allCurriculums = currListRes.data?.data?.items || [];
  const firstRes = await axios.get(`${BASE_URL}/curriculum-subject-list`, {
    headers,
    params: { _department: departmentId, page: 1 },
  });

  const firstItems = firstRes.data?.data?.items || [];
  if (firstItems.length === 0)
    throw new Error("Ushbu kafedrada fanlar topilmadi!");
  const curriculumIds = [...new Set(firstItems.map((i) => i._curriculum))];
  const matchedCodes = await getMatchedSemesterCodes(
    curriculumIds,
    educationYearCode,
    semestrTuri,
    token,
  );

  if (matchedCodes.length === 0) {
    throw new Error(
      `${oquvYili} yil uchun mos ${semestrTuri} semestrlari topilmadi!`,
    );
  }

  const deptData = firstItems[0].department;
  const kafedraDoc = await Kafedra.findOneAndUpdate(
    { departmentId: deptData.id },
    {
      $set: {
        departmentId: deptData.id,
        name: deptData.name,
        oquvYili,
        semestrTuri,
      },
    },
    { upsert: true, new: true },
  );

  let page = 1;
  let totalPages = firstRes.data.data.pagination.pageCount;
  let totalSaved = 0;

  while (page <= totalPages) {
    const res =
      page === 1
        ? firstRes
        : await axios.get(`${BASE_URL}/curriculum-subject-list`, {
            headers,
            params: { _department: departmentId, page },
          });

    const items = res.data.data.items;
    const filteredItems = items.filter((item) =>
      matchedCodes.includes(item.semester?.code),
    );

    if (filteredItems.length > 0) {
      const operations = filteredItems.map((item) => {
        const plan = allCurriculums.find((c) => c.id === item._curriculum);
        return {
          updateOne: {
            filter: { itemId: item.id },
            update: {
              $set: {
                kafedra: kafedraDoc._id,
                itemId: item.id,
                subject: item.subject,
                subjectDetails: item.subjectDetails,
                subjectExamTypes: item.subjectExamTypes,
                semester: item.semester,
                faculty: plan
                  ? { id: plan.department?.id, name: plan.department?.name }
                  : null,
                specialty: plan
                  ? { id: plan.specialty?.id, name: plan.specialty?.name }
                  : null,
                total_acload: item.total_acload,
                credit: item.credit,
              },
            },
            upsert: true,
          },
        };
      });
      await KafedraYuklama.bulkWrite(operations);
      totalSaved += filteredItems.length;
    }
    page++;
  }

  return { totalSaved };
}

module.exports.sync = async (req, res) => {
  try {
    const { departmentId, oquvYili, semestrTuri, token } = req.body;
    syncFromApi(departmentId, oquvYili, semestrTuri, token).catch((e) =>
      console.log(e),
    );
    res.json({ success: true, message: "Sync jarayoni boshlandi..." });
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
