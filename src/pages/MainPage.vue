<template>
  <div>
    <h1>메인 페이지</h1>
    <p v-if="user">환영합니다, {{ user.nickname }}님!</p>
    <p v-else>로그인하지 않은 사용자입니다.</p>

    <!-- 로그인된 사용자만 프로필 수정 버튼 표시 -->
    <button v-if="user" @click="goToProfile">프로필 수정</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth } from "firebase/auth";
import { useRouter } from "vue-router";
import axios from "axios";

const user = ref(null);
const router = useRouter();

// 사용자 정보 가져오기 (서버에서 userDetails 불러오기)
const fetchUserDetails = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }

    const token = await auth.currentUser.getIdToken(true);
    const res = await axios.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 200) {
      user.value = res.data; // 서버에서 받은 userDetails 저장
    }
  } catch (error) {
    console.error("사용자 정보 가져오기 실패:", error);
    user.value = null;
  }
};

onMounted(fetchUserDetails);

// 프로필 수정 페이지 이동 (서버에서 받은 userDetails를 전달)
const goToProfile = () => {
  if (!user.value) return;
  router.push({
    path: "/profile",
    query: { userDetails: JSON.stringify(user.value) }, // userDetails를 JSON 문자열로 전달
  });
};
</script>

<style scoped>
button {
  margin-top: 10px;
  padding: 8px 15px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
