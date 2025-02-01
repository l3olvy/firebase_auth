<!--<template>-->
<!--  <div>-->
<!--    <button @click="googleLogin">Google로 로그인</button>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { auth, provider, signInWithPopup } from "@/firebase";-->
<!--import { useRouter } from "vue-router";-->

<!--export default {-->
<!--  setup() {-->
<!--    const router = useRouter();-->

<!--    const googleLogin = async () => {-->
<!--      try {-->
<!--        // Firebase에서 JWT 가져오기-->
<!--        const result = await signInWithPopup(auth, provider);-->
<!--        const token = await result.user.getIdToken();-->

<!--        // 로그인 요청-->
<!--        const response = await fetch("http://localhost:8080/api/users", {-->
<!--          method: "POST",-->
<!--          headers: {-->
<!--            "Content-Type": "application/json",-->
<!--            Authorization: `Bearer ${token}`,-->
<!--          },-->
<!--        });-->

<!--        if (response.ok) {-->
<!--          router.push("/main");-->
<!--        } else if (response.status === 419) {-->
<!--          router.push("/register");-->
<!--        } else {-->
<!--          throw new Error("로그인 실패");-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Google 로그인 실패:", error);-->
<!--      }-->
<!--    };-->

<!--    return { googleLogin };-->
<!--  },-->
<!--};-->
<!--</script>-->
<template>
  <div>
    <h1>Login Page</h1>
    <button @click="loginWithGoogle">Login with Google</button>
  </div>
</template>

<script setup>
import { auth, provider, signInWithPopup } from "@/firebase";
import api from '../helpers/api'
import router from "@/router/index.js";  // 위에서 만든 axios instance

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken(true)
    // 서버에 /api/users/me (or /api/auth/verify) 호출 → DB에 유저가 있나 확인
    const res = await api.get('/api/users/me', {
      headers: { Authorization: `Bearer ${idToken}` }
    })
    console.log('Login success! user:', res)
    // 여기까지 오면 DB에 유저가 존재하는 것 → 메인 페이지나 홈으로 이동


    await router.push('/main')
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(error)
      console.error('User not found. Redirecting to register page.');
      router.push('/register');
    } else if (error.response?.status === 409) {
      console.error('User already exists.');
      alert('User already exists. Please log in.');
    } else {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }
}
</script>
