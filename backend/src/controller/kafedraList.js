const axios = require("axios");
const Kafedra = require("../model/kafedra");
const KafedraYuklama = require("../model/kafedraList");

const BASE_URL = "https://student.tdmau.uz/rest/v1/data";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function parseItems(resData) {
  if (resData?.data?.[0]?.items) {
    return {
      items: resData.data[0].items,
      pageCount: resData.data[0].pagination?.[0]?.pageCount || 1,
    };
  }
  if (resData?.data?.items) {
    return {
      items: resData.data.items,
      pageCount: resData.data.pagination?.pageCount || 1,
    };
  }
  return { items: [], pageCount: 1 };
}

async function fetchAllCurriculums(token) {
  let page = 1;
  let all = [];

  while (true) {
    const res = await axios.get(`${BASE_URL}/curriculum-list`, {
      headers: authHeaders(token),
      params: { limit: 200, page },
    });
    const parsed = parseItems(res.data);
    all = [...all, ...parsed.items];
    if (page >= parsed.pageCount) break;
    page++;
  }

  return all;
}

function isSemestrMatched(semesterCode, semestrTuri) {
  if (!semestrTuri) return true;
  const parts = String(semesterCode).split("-");
  const position = Number(parts[parts.length - 1]);
  const isKuzgi = position % 2 !== 0;
  const isBahorgi = position % 2 === 0;

  if (semestrTuri === "kuzgi") return isKuzgi;
  if (semestrTuri === "bahorgi") return isBahorgi;
  return true;
}

async function syncFromApi(departmentId, oquvYili, semestrTuri, token) {
  const allCurriculums = await fetchAllCurriculums(token);

  const matchedCurriculums = allCurriculums.filter((c) => {
    const code = String(c.educationYear?.code || "");
    return code === String(oquvYili) || code === oquvYili.split("-")[0];
  });

  const matchedCurriculumMap = Object.fromEntries(
    matchedCurriculums.map((c) => [c.id, c]),
  );

  const firstRes = await axios.get(`${BASE_URL}/curriculum-subject-list`, {
    headers: authHeaders(token),
    params: { _department: departmentId, page: 1 },
  });

  const firstParsed = parseItems(firstRes.data);
  if (firstParsed.items.length === 0) {
    throw new Error("Ushbu kafedrada fanlar topilmadi!");
  }

  const deptData = firstParsed.items[0].department;
  const kafedraDoc = await Kafedra.findOneAndUpdate(
    {
      departmentId: deptData.id,
      oquvYili,
      semestrTuri: semestrTuri || "hammasi",
    },
    {
      $set: {
        departmentId: deptData.id,
        name: deptData.name,
        code: deptData.code,
        structureType: deptData.structureType,
        localityType: deptData.localityType,
        parent: deptData.parent,
        active: deptData.active,
        oquvYili,
        semestrTuri: semestrTuri || "hammasi",
      },
      $setOnInsert: { tasdiqKuzgi: false, tasdiqBahorgi: false },
    },
    { upsert: true, new: true },
  );

  let page = 1;
  let totalSaved = 0;
  const totalPages = firstParsed.pageCount;

  while (page <= totalPages) {
    const res =
      page === 1
        ? firstRes
        : await axios.get(`${BASE_URL}/curriculum-subject-list`, {
            headers: authHeaders(token),
            params: { _department: departmentId, page },
          });

    const { items } = parseItems(res.data);

    const filtered = items.filter((item) => {
      const currMatched = matchedCurriculumMap[item._curriculum];
      const semMatched = isSemestrMatched(item.semester?.code, semestrTuri);
      return currMatched && semMatched;
    });

    if (filtered.length > 0) {
      const ops = filtered.map((item) => {
        const curr = matchedCurriculumMap[item._curriculum];
        return {
          updateOne: {
            filter: { itemId: item.id },
            update: {
              $set: {
                departmentId: deptData.id,
                oquvYili,
                semestrTuri: semestrTuri || "hammasi",
                itemId: item.id,
                subject: item.subject,
                subjectType: item.subjectType,
                subjectBlock: item.subjectBlock,
                subjectDetails: item.subjectDetails,
                subjectExamTypes: item.subjectExamTypes,
                ratingGrade: item.ratingGrade,
                examFinish: item.examFinish,
                semester: item.semester,
                curriculumId: item._curriculum,
                faculty: curr
                  ? {
                      id: curr.department?.id,
                      name: curr.department?.name,
                      code: curr.department?.code,
                    }
                  : null,
                specialty: curr
                  ? {
                      id: curr.specialty?.id,
                      name: curr.specialty?.name,
                      code: curr.specialty?.code,
                    }
                  : null,
                educationType: curr?.educationType || null,
                educationForm: curr?.educationForm || null,
                total_acload: item.total_acload,
                credit: item.credit,
                active: item.active,
                employees: item._employees,
              },
            },
            upsert: true,
          },
        };
      });

      await KafedraYuklama.bulkWrite(ops);
      totalSaved += filtered.length;
    }

    page++;
  }

  console.log(
    `Sync tugadi: ${kafedraDoc.name}, ${oquvYili}, ${totalSaved} ta fan`,
  );
  return { totalSaved };
}

module.exports.getDepartments = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(400).json({ error: "Authorization header majburiy!" });
    }

    const response = await axios.get(
      `${BASE_URL}/department-list?_structure_type=12`,
      { headers: { Authorization: authHeader } },
    );

    const raw = response.data;
    let items = [];
    if (raw?.data?.[0]?.items) items = raw.data[0].items;
    else if (raw?.data?.items) items = raw.data.items;
    else if (Array.isArray(raw?.data)) items = raw.data;

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.sync = async (req, res) => {
  try {
    const { departmentId, oquvYili, semestrTuri, token } = req.body;

    if (!departmentId || !oquvYili || !token) {
      return res
        .status(400)
        .json({ error: "departmentId, oquvYili va token majburiy!" });
    }

    syncFromApi(departmentId, oquvYili, semestrTuri || null, token).catch((e) =>
      console.error("Sync xatosi:", e.message),
    );

    res.json({ success: true, message: "Sync boshlandi!" });
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
    const { departmentId, oquvYili, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (departmentId) filter.departmentId = Number(departmentId);
    if (oquvYili) filter.oquvYili = oquvYili;

    const total = await KafedraYuklama.countDocuments(filter);

    const data = await KafedraYuklama.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data,
      total,
      page: Number(page),
      pageCount: Math.ceil(total / Number(limit)),
    });
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

    if (!updated) return res.status(404).json({ error: "Topilmadi" });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
