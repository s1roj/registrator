<template>
  <aside
    class="w-52 bg-gray-900 text-white flex flex-col shrink-0 h-screen overflow-y-auto">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-4 py-4 border-b border-gray-700">
      <div
        class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
        RO
      </div>
      <span class="text-sm font-semibold tracking-wide">Registrator ofis</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-3 px-2 space-y-0.5">
      <template v-for="item in menuItems" :key="item.name">
        <!-- Has children -->
        <div v-if="item.children">
          <a
            href="#"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>{{ item.icon }}</span>
            <span class="flex-1 truncate">{{ item.label }}</span>
            <svg
              class="w-3 h-3 opacity-50"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <div class="ml-4 mt-0.5 space-y-0.5 border-l border-gray-700 pl-3">
            <template v-for="child in item.children" :key="child.name">
              <!-- active route -->
              <router-link
                v-if="child.to"
                :to="child.to"
                class="block text-xs py-1.5 px-2 rounded transition-all duration-150"
                :class="
                  isActive(child.to)
                    ? 'text-white bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                ">
                {{ child.label }}
              </router-link>
              <!-- placeholder # -->
              <a
                v-else
                href="#"
                class="block text-xs py-1.5 px-2 rounded transition-all duration-150 text-gray-400 hover:text-white hover:bg-gray-800">
                {{ child.label }}
              </a>
            </template>
          </div>
        </div>

        <!-- No children - active route -->
        <router-link
          v-else-if="item.to"
          :to="item.to"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150"
          :class="
            isActive(item.to)
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ">
          <span>{{ item.icon }}</span>
          <span class="flex-1 truncate">{{ item.label }}</span>
        </router-link>

        <!-- No children - placeholder # -->
        <a
          v-else
          href="#"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 text-gray-400 hover:bg-gray-800 hover:text-white">
          <span>{{ item.icon }}</span>
          <span class="flex-1 truncate">{{ item.label }}</span>
        </a>
      </template>
    </nav>

    <!-- Version -->
    <div class="px-4 py-3 text-xs text-gray-500 border-t border-gray-700">
      Dastur versiyasi 1.0.5 / Yadro 2.0.1
    </div>
  </aside>
</template>

<script>
export default {
  name: "AppSidebar",
  data() {
    return {
      menuItems: [
        {
          name: "talabalar",
          icon: "👥",
          label: "Talabalar",
          to: null,
        },
        {
          name: "kadrlar",
          icon: "🏢",
          label: "Kadrlar bo'limi",
          to: null,
        },
        {
          name: "akademik",
          icon: "📚",
          label: "Akademik qarzdorlik",
          to: null,
        },
        {
          name: "kochirish",
          icon: "🔄",
          label: "Ko'chirish va tiklash",
          to: null,
        },
        {
          name: "yuklamalar",
          icon: "📋",
          label: "Yuklamalar",
          to: null,
          children: [
            { name: "ishchi-oquv", label: "Ishchi o'quv rejalar", to: null },
            { name: "yuklama-turlari", label: "Yuklama turlari", to: null },
            { name: "oquv-grafik", label: "O'quv jarayon grafigi", to: null },
            { name: "oqimlar", label: "Oqimlar", to: null },
            {
              name: "kafedra-yuklamalari",
              label: "Kafedra yuklamalari",
              to: { name: "kafedra-yuklamalari" },
            },
            { name: "kafedra-taqsimoti", label: "Kafedra taqsimoti", to: null },
            { name: "shaxsiy-ish", label: "Shaxsiy ish reja", to: null },
          ],
        },
        {
          name: "sozlamalar",
          icon: "⚙️",
          label: "Sozlamalar",
          to: null,
        },
        {
          name: "qarzdorlik",
          icon: "💳",
          label: "Qarzdorlik yuklash",
          to: null,
        },
        {
          name: "tizim",
          icon: "🖥️",
          label: "Tizim",
          to: null,
        },
      ],
    };
  },
  methods: {
    isActive(to) {
      if (!to) return false;
      if (to.name) return this.$route.name === to.name;
      return this.$route.path === to;
    },
  },
};
</script>
