<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader />

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "DefaultLayout",
  components: {
    AppSidebar,
    AppHeader,
  },
};
</script>
