<!--<template>-->
<!--  <div>-->
<!--    <h1>메인 페이지</h1>-->
<!--    <p>환영합니다! 로그인에 성공하셨습니다.</p>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  setup() {-->
<!--    return {};-->
<!--  },-->
<!--};-->
<!--</script>-->
<template>
  <div>
    <h1>메인 페이지</h1>
    <p v-if="user">환영합니다, {{ user.nickname }}님!</p>
    <p v-else>로그인하지 않은 사용자입니다.</p>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth } from "@/firebase";

export default {
  setup() {
    const user = ref(null);

    const fetchUserDetails = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch("http://localhost:8080/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data !== "Anonymous User") {
            user.value = data; // 로그인된 사용자 정보
          } else {
            user.value = null; // ROLE_ANONYMOUS 사용자
          }
        } else {
          user.value = null; // 인증 실패 또는 비로그인 상태
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        user.value = null;
      }
    };

    onMounted(fetchUserDetails);

    return { user };
  },
};
</script>

