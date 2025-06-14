// src/router.js (Vue 3 style)
import { createRouter, createWebHistory } from "vue-router";

import ExamManager from "./views/ExamManager.vue";
import QuestionManager from "./views/QuestionManager.vue";
import ResultManager from "./views/ResultManager.vue";

const routes = [
  { path: "/", redirect: "/exam-manager" },
  { path: "/exam-manager", component: ExamManager },
  { path: "/question-manager", component: QuestionManager },
  { path: "/result-manager", component: ResultManager },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
