<template>
  <header
    class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0">
    <!-- Left: breadcrumb -->
    <div class="flex items-center gap-3">
      <button class="text-gray-500 hover:text-gray-800 transition">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <nav class="flex items-center gap-1 text-sm text-gray-500">
        <router-link to="/" class="hover:text-blue-600 transition"
          >Asosiy</router-link
        >
        <template v-if="breadcrumb">
          <span class="mx-1">/</span>
          <span class="text-gray-800 font-medium">{{ breadcrumb }}</span>
        </template>
      </nav>
    </div>

    <!-- Right: user -->
    <div class="flex items-center gap-3">
      <div class="text-right">
        <div class="text-sm font-semibold text-gray-800">
          {{ user.fullName }}
        </div>
        <div class="text-xs text-gray-400">{{ user.role }}</div>
      </div>
      <div
        class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "AppHeader",
  data() {
    return {
      user: {
        fullName: "TUROPOV SIROJIDDIN",
        role: "Administartor",
      },
    };
  },
  computed: {
    breadcrumb() {
      return this.$route.meta?.breadcrumb || "";
    },
    userInitials() {
      return this.user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2);
    },
  },
};
</script>
