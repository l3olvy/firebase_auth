import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth";
import MainPage from "@/pages/MainPage.vue";
import RegisterPage from "@/pages/RegisterPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import UserProfileEdit from "@/pages/UserProfileEdit.vue";

const routes = [
    { path: "/", component: LoginPage },
    { path: "/main", component: MainPage, props: true }, // ✅ userDetails 전달 가능
    { path: "/register", component: RegisterPage },
    {
        path: "/profile",
        component: UserProfileEdit,
        props: true, // ✅ userDetails 전달 가능
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 🔹 인증되지 않은 사용자는 /profile 접근 불가
router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            alert("로그인이 필요합니다.");
            next("/"); // 로그인 페이지로 이동
        } else {
            next(); // 이동 허용
        }
    } else {
        next(); // 인증 필요 없는 페이지는 그대로 진행
    }
});

export default router;
