import { createRouter, createWebHistory } from "vue-router";

// Layout
import MainLayout from "./layouts/MainLayout.vue";

// Auth views
import Login from "./components/Login.vue";
import Register from "./components/RegisterView.vue";
import Verify from "./pages/verify/Verify.vue";
import ForgotPassword from "./pages/forgot-password/ForgotPassword.vue";
import PopupNewPassword from "./pages/forgot-password/PopupNewPassword.vue";

// Main views
import ExamManager from "./views/ExamManager.vue";
import QuestionManager from "./views/QuestionManager.vue";
import ResultManager from "./views/ResultManager.vue";
import EditQuestionSetPage from "./views/EditQuestionSetPage.vue";
import GeneratedExam from "./views/GeneratedExam.vue";
import QuestionBank from "./views/QuestionBank.vue";

const routes = [
  // { path: "/", redirect: "/login" },

  // Auth
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/verify", component: Verify },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: PopupNewPassword },

  // Main views wrapped in layout
  {
    path: "/exam-manager",
    component: MainLayout,
    children: [{ path: "", component: ExamManager }],
  },
  {
    path: "/result-manager",
    component: MainLayout,
    children: [{ path: "", component: ResultManager }],
  },
  {
    path: "/question-manager",
    component: MainLayout,
    children: [{ path: "", component: QuestionManager }],
  },
  {
    path: "/edit-question-set/:id",
    component: MainLayout,
    children: [{ path: "", component: EditQuestionSetPage }],
  },

  {
    path: "/generated",
    component: MainLayout,
    children: [{ path: "", component: GeneratedExam }],
  },
  {
    path: "/question",
    component: MainLayout,
    children: [{ path: "", component: QuestionBank }],
  },

  // fallback
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
