import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 라우터를 가져옴
import {firebaseApp} from "@/firebase.js";

const app = createApp(App);

app.use(router); // 라우터 등록
app.mount("#app");
