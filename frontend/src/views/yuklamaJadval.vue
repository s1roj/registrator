<template>
  <div class="yuklama-page">
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="$router.back()">← Orqaga</button>
        <h1>{{ kafedraName || "Kafedra yuklamasi" }}</h1>
        <p v-if="filters.oquvYili">O'quv yili: {{ filters.oquvYili }}</p>
      </div>
    </div>

    <div class="table-wrapper">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Ma'lumotlar yuklanmoqda...</span>
      </div>

      <div class="table-scroll">
        <table class="yuklama-table">
          <thead>
            <tr>
              <th rowspan="3" class="th-base th-num">#</th>
              <th rowspan="3" class="th-base th-fan">Fanlar</th>
              <th rowspan="3" class="th-base th-fak">Fakultet</th>
              <th rowspan="3" class="th-base th-yon">Ta'lim yo'nalishi</th>
              <th rowspan="3" class="th-base">Kurs</th>
              <th rowspan="3" class="th-base">Talabalar soni</th>
              <th rowspan="3" class="th-base">Oqim soni</th>
              <th rowspan="3" class="th-base">Guruh soni</th>
              <th rowspan="3" class="th-base">Kichik guruh soni</th>
              <th colspan="5" class="th-group th-audit">
                Auditoriya mashg'uloti
              </th>
              <th colspan="8" class="th-group th-tashqari">
                Auditoriyadan tashqari mashg'ulotlar
              </th>
              <th colspan="4" class="th-group th-tashqari2">
                Auditoriyadan tashqari mashg'ulotlar
              </th>
            </tr>
            <tr>
              <th rowspan="2" class="th-base th-audit-cell">Ma'ruza</th>
              <th rowspan="2" class="th-base th-audit-cell">Amaliy</th>
              <th rowspan="2" class="th-base th-audit-cell">Seminar</th>
              <th rowspan="2" class="th-base th-audit-cell">Laboratoriya</th>
              <th rowspan="2" class="th-base th-audit-cell th-jami">
                Jami auditoriya soati
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Kurs ishiga rahbarlik - (X 2.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                K/l himoyasi - (X 0.4)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Kurs loyihasiga rahbarlik - (X 3.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                K/L himoyasi - (X 0.6)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Nazorat ishi - (X 1.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Hisob chizma ishi - (X 0.3)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Oraliq nazorat - (X 0.2)
              </th>
              <th rowspan="2" class="th-base th-tashqari-cell">
                Yakuniy nazorat - (X 0.3)
              </th>
              <th rowspan="2" class="th-base th-tashqari2-cell">
                Bitiruv ishiga rahbarlik - (X 25.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari2-cell">
                Magistrlik dissertatsiyasiga rahbarlik - (X 25.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari2-cell">
                Magistrning IPisiga rahbarlik - (X 25.0)
              </th>
              <th rowspan="2" class="th-base th-tashqari2-cell">
                Doktorant izlanuvchi ishiga rahbarlik - (X 100.0)
              </th>
            </tr>
            <tr></tr>
          </thead>
          <tbody>
            <tr v-if="!loading && rows.length === 0">
              <td colspan="25" class="td-empty">Ma'lumot topilmadi</td>
            </tr>
            <tr
              v-for="(row, i) in rows"
              :key="row.itemId || i"
              class="data-row">
              <td class="td-center td-num">
                {{ (currentPage - 1) * limit + i + 1 }}
              </td>
              <td class="td-left td-fan">
                {{ row.subject?.name }}
                <span class="fan-code" v-if="row.subject?.code"
                  >| {{ row.subject.code }}</span
                >
              </td>
              <td class="td-left">{{ row.faculty?.name || "—" }}</td>
              <td class="td-left td-yon">{{ row.specialty?.name || "—" }}</td>
              <td class="td-center">{{ row.kurs || "—" }}</td>
              <td class="td-center">—</td>
              <td class="td-center">—</td>
              <td class="td-center">{{ row.guruhSoni || "—" }}</td>
              <td class="td-center">—</td>
              <td class="td-center td-audit">{{ getLoad(row, "1") }}</td>
              <td class="td-center td-audit">{{ getLoad(row, "2") }}</td>
              <td class="td-center td-audit">{{ getLoad(row, "3") }}</td>
              <td class="td-center td-audit">{{ getLoad(row, "4") }}</td>
              <td class="td-center td-audit td-jami-val">
                {{ row.total_acload || 0 }}
              </td>
              <td class="td-center td-tashqari">—</td>
              <td class="td-center td-tashqari">—</td>
              <td class="td-center td-tashqari">—</td>
              <td class="td-center td-tashqari">—</td>
              <td class="td-center td-tashqari">
                {{ getExam(row, "nazorat") }}
              </td>
              <td class="td-center td-tashqari">—</td>
              <td class="td-center td-tashqari">
                {{ getExam(row, "oraliq") }}
              </td>
              <td class="td-center td-tashqari">
                {{ getExam(row, "yakuniy") }}
              </td>
              <td class="td-center td-tashqari2">—</td>
              <td class="td-center td-tashqari2">—</td>
              <td class="td-center td-tashqari2">—</td>
              <td class="td-center td-tashqari2">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="total > 0">
        <span class="total-info">Jami: {{ total }} ta</span>
        <div class="page-btns">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn">
            ‹
          </button>
          <span class="page-info">{{ currentPage }} / {{ pageCount }}</span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= pageCount"
            class="page-btn">
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API = "http://localhost:3300/api";

export default {
  name: "YuklamaJadval",
  data() {
    return {
      loading: false,
      rows: [],
      total: 0,
      currentPage: 1,
      pageCount: 1,
      limit: 50,
      kafedraName: "",
      filters: {
        departmentId: "",
        oquvYili: "",
      },
    };
  },
  mounted() {
    const q = this.$route.query;
    this.filters.departmentId = q.departmentId || "";
    this.filters.oquvYili = q.oquvYili || "";
    this.kafedraName = q.name || "";

    if (this.filters.departmentId) {
      this.fetchData();
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.rows = [];
      try {
        const res = await axios.get(`${API}/kafedra-yuklamalar`, {
          params: {
            departmentId: this.filters.departmentId,
            oquvYili: this.filters.oquvYili,
            page: this.currentPage,
            limit: this.limit,
          },
        });
        this.rows = res.data.data || [];
        this.total = res.data.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    changePage(page) {
      if (page < 1 || page > this.pageCount) return;
      this.currentPage = page;
      this.fetchData();
    },

    getLoad(row, code) {
      if (!row.subjectDetails?.length) return "—";
      const found = row.subjectDetails.find(
        (d) => String(d.trainingType?.code) === code,
      );
      return found?.academic_load || "—";
    },

    getExam(row, type) {
      if (!row.subjectExamTypes?.length) return "—";
      const keywords = {
        oraliq: ["oraliq", "1"],
        yakuniy: ["yakuniy", "final", "2"],
        nazorat: ["nazorat", "3"],
      };
      const keys = keywords[type] || [];
      const found = row.subjectExamTypes.find((e) =>
        keys.some(
          (k) =>
            String(e.examType?.name).toLowerCase().includes(k) ||
            String(e.examType?.code) === k,
        ),
      );
      return found?.max_ball || "—";
    },
  },
};
</script>

<style scoped>
.yuklama-page {
  padding: 20px;
  font-family: "Segoe UI", sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
}

.page-header {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.btn-back {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
  color: #555;
  margin-bottom: 8px;
  transition: background 0.2s;
}
.btn-back:hover {
  background: #f0f0f0;
}

.page-header h1 {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 2px;
}
.page-header p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.table-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  font-size: 14px;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #4361ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.table-scroll {
  overflow-x: auto;
}

.yuklama-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  min-width: 1800px;
}

.th-base {
  background: #1a1a2e;
  color: #fff;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
  padding: 6px 4px;
  border: 1px solid #2d2d4e;
  font-size: 10px;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
}

.th-group {
  text-align: center;
  font-weight: 700;
  font-size: 11px;
  padding: 8px 4px;
  border: 1px solid #fff;
}

.th-audit {
  background: #b8860b;
  color: #fff;
}
.th-tashqari {
  background: #3a7a4a;
  color: #fff;
}
.th-tashqari2 {
  background: #2a5a8e;
  color: #fff;
}
.th-audit-cell {
  background: #fdf6dc;
  color: #5a4000;
}
.th-jami {
  background: #b8860b;
  color: #fff;
}
.th-tashqari-cell {
  background: #e8f4ec;
  color: #2a5a38;
}
.th-tashqari2-cell {
  background: #dce8f5;
  color: #1a3a5c;
}

.th-num {
  width: 36px;
}
.th-fan {
  width: 200px;
  min-width: 160px;
}
.th-fak {
  width: 130px;
  min-width: 110px;
}
.th-yon {
  width: 190px;
  min-width: 150px;
}

.data-row:hover {
  background: #f8f9ff;
}
.data-row:nth-child(even) {
  background: #fafafa;
}
.data-row:nth-child(even):hover {
  background: #f0f2ff;
}

td {
  padding: 6px 5px;
  border: 1px solid #e8e8e8;
  vertical-align: middle;
  color: #333;
  font-size: 11px;
}

.td-center {
  text-align: center;
}
.td-left {
  text-align: left;
}
.td-num {
  color: #aaa;
}
.td-fan {
  font-weight: 500;
  color: #1a1a2e;
  max-width: 200px;
}
.td-yon {
  max-width: 190px;
}
.fan-code {
  color: #999;
  font-size: 10px;
  font-weight: 400;
}

.td-audit {
  background: #fffdf0;
}
.td-jami-val {
  background: #fff3cd;
  font-weight: 700;
  color: #856404;
}
.td-tashqari {
  background: #f6fbf7;
}
.td-tashqari2 {
  background: #f0f6fc;
}

.td-empty {
  text-align: center;
  color: #aaa;
  padding: 60px;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}
.total-info {
  font-size: 13px;
  color: #888;
}
.page-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: #4361ee;
  color: #fff;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-info {
  font-size: 13px;
  color: #555;
}
</style>
