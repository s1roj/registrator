import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
// router/index.js
import YuklamaJadval from "@/views/yuklamaJadval.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: DefaultLayout,
      children: [
        {
          path: "",
          redirect: { name: "kafedra-yuklamalari" },
        },
        {
          path: "kafedra-yuklamalari",
          name: "kafedra-yuklamalari",
          component: () => import("@/views/KafedraYuklamalari.vue"),
          meta: { breadcrumb: "Kafedra yuklamalari" },
        },
        {
          path: "talabalar",
          name: "talabalar",
          component: () => import("@/views/Talabalar.vue"),
          meta: { breadcrumb: "Talabalar" },
        },
        {
          path: "kadrlar",
          name: "kadrlar",
          component: () => import("@/views/Kadrlar.vue"),
          meta: { breadcrumb: "Kadrlar bo'limi" },
        },
        {
          path: "kafedra-taqsimoti",
          name: "kafedra-taqsimoti",
          component: () => import("@/views/KafedraTaqsimoti.vue"),
          meta: { breadcrumb: "Kafedra taqsimoti" },
        },
        {
          path: "sozlamalar",
          name: "sozlamalar",
          component: () => import("@/views/Sozlamalar.vue"),
          meta: { breadcrumb: "Sozlamalar" },
        },
        { path: "yuklama-jadval", component: YuklamaJadval },
      ],
    },
  ],
});

export default router;
