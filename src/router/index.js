// import { createRouter, createWebHistory } from "vue-router";
// import MainPage from "@/components/MainPage.vue";
// import RegisterPage from "@/components/RegisterPage.vue";
// import LoginButton from "@/components/LoginPage.vue";
//
// const routes = [
//     { path: "/", component: LoginButton },
//     { path: "/main", component: MainPage },
//     { path: "/register", component: RegisterPage },
// ];
//
// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });
//
// export default router;
import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/components/MainPage.vue";
import RegisterPage from "@/components/RegisterPage.vue";
import LoginPage from "@/components/LoginPage.vue";

const routes = [
    { path: "/", component: LoginPage },
    { path: "/main", component: MainPage },
    { path: "/register", component: RegisterPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

