<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="openModal"
        class="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700 transition">
        + Kafedra qo'shish
      </button>
      <select
        v-model="selectedYear"
        class="border border-gray-200 text-sm text-gray-500 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
        <option value="">O'quv yilini tanlang</option>
        <option v-for="year in oquvYillar" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
    <div
      class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50">
            <th class="text-left text-gray-500 font-medium px-5 py-3 w-10">
              #
            </th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">Nomi</th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">
              O'quv yili
            </th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">
              Semester turi
            </th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">
              Tasdiqlash (Kuzgi)
            </th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">
              Tasdiqlash (Bahorgi)
            </th>
            <th class="text-left text-gray-500 font-medium px-5 py-3">
              Tasdiq
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-8 text-gray-400">
              Yuklanmoqda...
            </td>
          </tr>
          <tr v-else-if="filteredKafedraList.length === 0">
            <td colspan="7" class="text-center py-8 text-gray-400">
              Ma'lumot yo'q
            </td>
          </tr>
          <tr
            v-for="(row, index) in filteredKafedraList"
            :key="row._id"
            class="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
            @click="openItems(row)">
            <td class="px-5 py-3 text-gray-400">{{ index + 1 }}</td>
            <td class="px-5 py-3">
              <span class="text-blue-500 hover:underline">{{ row.name }}</span>
            </td>
            <td class="px-5 py-3 text-gray-600">{{ row.oquvYili || "—" }}</td>
            <td class="px-5 py-3">
              <span
                v-if="row.semestrTuri === 'kuzgi'"
                class="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-600">
                Kuzgi
              </span>
              <span
                v-else-if="row.semestrTuri === 'bahorgi'"
                class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-600">
                Bahorgi
              </span>
              <div v-else class="flex gap-1">
                <span
                  class="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-600"
                  >Kuzgi</span
                >
                <span
                  class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-600"
                  >Bahorgi</span
                >
              </div>
            </td>
            <td class="px-5 py-3" @click.stop>
              <button
                @click="toggleTasdiq(row, 'tasdiqKuzgi')"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                :class="row.tasdiqKuzgi ? 'bg-purple-500' : 'bg-gray-200'">
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                  :class="
                    row.tasdiqKuzgi ? 'translate-x-6' : 'translate-x-1'
                  " />
              </button>
            </td>
            <td class="px-5 py-3" @click.stop>
              <button
                @click="toggleTasdiq(row, 'tasdiqBahorgi')"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                :class="row.tasdiqBahorgi ? 'bg-purple-500' : 'bg-gray-200'">
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                  :class="
                    row.tasdiqBahorgi ? 'translate-x-6' : 'translate-x-1'
                  " />
              </button>
            </td>
            <td class="px-5 py-3">
              <span
                v-if="row.tasdiqKuzgi && row.tasdiqBahorgi"
                class="text-green-500 text-lg font-bold"
                >✓</span
              >
              <span v-else class="text-red-500 text-lg font-bold">✕</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click.self="closeModal">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-gray-800">
            Kafedra qo'shish
          </h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-xs text-gray-500 mb-1">Kafedra</label>
          <select
            v-model="form.departmentId"
            class="w-full border border-gray-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Kafedrani tanlang</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
          <p v-if="deptLoading" class="text-xs text-gray-400 mt-1">
            Yuklanmoqda...
          </p>
          <p v-if="deptError" class="text-xs text-red-400 mt-1">
            {{ deptError }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-xs text-gray-500 mb-1">O'quv yili</label>
          <select
            v-model="form.oquvYili"
            class="w-full border border-gray-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">O'quv yilini tanlang</option>
            <option v-for="year in oquvYillar" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div class="mb-6">
          <label class="block text-xs text-gray-500 mb-1">Semester turi</label>
          <select
            v-model="form.semestrTuri"
            class="w-full border border-gray-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Ikkalasi ham (kuzgi + bahorgi)</option>
            <option v-for="s in oquvSemestrlar" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <p v-if="syncError" class="text-xs text-red-400 mb-3">
          {{ syncError }}
        </p>

        <div class="flex gap-3 justify-end">
          <button
            @click="closeModal"
            class="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Bekor qilish
          </button>
          <button
            @click="submitSync"
            :disabled="syncLoading || !form.departmentId || !form.oquvYili"
            class="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {{ syncLoading ? "Saqlanmoqda..." : "Yaratish" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showItems"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click.self="closeItems">
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-800">
            {{ selectedKafedra?.name }} — fanlar ro'yxati
          </h2>
          <button
            @click="closeItems"
            class="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <div class="overflow-y-auto flex-1">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-white">
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left text-gray-500 font-medium px-4 py-2 w-10">
                  #
                </th>
                <th class="text-left text-gray-500 font-medium px-4 py-2">
                  Fan nomi
                </th>
                <th class="text-left text-gray-500 font-medium px-4 py-2">
                  Semestr
                </th>
                <th class="text-left text-gray-500 font-medium px-4 py-2">
                  Soat
                </th>
                <th class="text-left text-gray-500 font-medium px-4 py-2">
                  Kredit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="itemsLoading">
                <td colspan="5" class="text-center py-6 text-gray-400">
                  Yuklanmoqda...
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-6 text-gray-400">
                  Ma'lumot yo'q
                </td>
              </tr>
              <tr
                v-for="(item, i) in items"
                :key="item._id"
                class="border-b border-gray-50 hover:bg-gray-50">
                <td class="px-4 py-2 text-gray-400">{{ i + 1 }}</td>
                <td class="px-4 py-2 text-gray-700">
                  {{ item.subject?.name }}
                </td>
                <td class="px-4 py-2 text-gray-500">
                  {{ item.semester?.name }}
                </td>
                <td class="px-4 py-2 text-gray-500">{{ item.total_acload }}</td>
                <td class="px-4 py-2 text-gray-500">{{ item.credit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const API = "http://10.1.100.230:3300/api";

export default {
  name: "KafedraYuklamalari",
  data() {
    return {
      token: "token",

      loading: false,
      kafedraList: [],
      selectedYear: "",
      oquvYillar: [
        "2025-2026",
        "2024-2025",
        "2023-2024",
        "2022-2023",
        "2021-2022",
        "2020-2021",
      ],

      showModal: false,
      deptLoading: false,
      deptError: "",
      syncLoading: false,
      syncError: "",
      departments: [],
      form: {
        departmentId: "",
        oquvYili: "",
        semestrTuri: "", 
      },

      showItems: false,
      selectedKafedra: null,
      items: [],
      itemsLoading: false,

      oquvSemestrlar: [
        { value: "kuzgi", label: "Kuzgi semestr" },
        { value: "bahorgi", label: "Bahorgi semestr" },
      ],
    };
  },
  computed: {
    filteredKafedraList() {
      if (!this.selectedYear) return this.kafedraList;
      return this.kafedraList.filter((k) => k.oquvYili === this.selectedYear);
    },
  },
  methods: {
    async fetchKafedraList() {
      this.loading = true;
      try {
        const res = await axios.get(`${API}/kafedra`);
        this.kafedraList = res.data.data;
      } catch (err) {
        console.error("Kafedra list xato:", err);
      } finally {
        this.loading = false;
      }
    },

    async openModal() {
      this.showModal = true;
      this.form = { departmentId: "", oquvYili: "", semestrTuri: "" };
      this.syncError = "";
      this.deptError = "";
      this.departments = [];
      await this.fetchDepartments();
    },

    closeModal() {
      this.showModal = false;
    },

    async fetchDepartments() {
      this.deptLoading = true;
      this.deptError = "";
      try {
        const res = await axios.get(`${API}/departments`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.departments = res.data.data?.data?.items || res.data.data || [];
      } catch (err) {
        this.deptError = "Kafedra ma'lumotlarini yuklab bo'lmadi";
      } finally {
        this.deptLoading = false;
      }
    },

    async submitSync() {
      if (!this.form.departmentId || !this.form.oquvYili) return;
      this.syncLoading = true;
      this.syncError = "";
      try {
        const body = {
          departmentId: this.form.departmentId,
          oquvYili: this.form.oquvYili,
          token: this.token,
        };
        if (this.form.semestrTuri) {
          body.semestrTuri = this.form.semestrTuri;
        }

        await axios.post(`${API}/kafedra-yuklamalar/sync`, body);
        this.closeModal();
        setTimeout(() => {
          this.fetchKafedraList();
        }, 2000);
      } catch (err) {
        this.syncError = err.response?.data?.error || "Xatolik yuz berdi";
      } finally {
        this.syncLoading = false;
      }
    },

    async toggleTasdiq(row, field) {
      const prev = row[field];
      row[field] = !row[field];
      try {
        await axios.patch(`${API}/kafedra/${row._id}/tasdiq`, {
          [field]: row[field],
        });
      } catch (err) {
        row[field] = prev;
        console.error(err);
      }
    },

    async openItems(row) {
      this.selectedKafedra = row;
      this.showItems = true;
      this.items = [];
      this.itemsLoading = true;
      try {
        const res = await axios.get(`${API}/kafedra-yuklamalar`, {
          params: {
            departmentId: row.departmentId,
            limit: 10000,
          },
        });
        this.items = res.data.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.itemsLoading = false;
      }
    },

    closeItems() {
      this.showItems = false;
      this.selectedKafedra = null;
      this.items = [];
    },
  },
  mounted() {
    this.fetchKafedraList();
  },
};
</script>
