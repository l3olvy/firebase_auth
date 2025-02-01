<template>
  <div class="profile-edit">
    <h2>프로필 수정</h2>

    <form @submit.prevent="updateProfile">
      <!-- 이메일 (Firebase 로그인 정보, 수정 불가) -->
      <div class="form-group">
        <label>이메일</label>
        <input v-model="form.email" disabled />
      </div>

      <!-- 아이디 (중복 확인) -->
      <div class="form-group">
        <label>아이디</label>
        <input v-model="form.profileId" placeholder="아이디를 입력해주세요" />
        <button type="button" @click="checkProfileId">중복확인</button>
        <span v-if="profileIdAvailable === false" style="color:red;">이미 사용 중</span>
        <span v-else-if="profileIdAvailable === true" style="color:green;">사용 가능</span>
      </div>

      <!-- 닉네임 -->
      <div class="form-group">
        <label>닉네임</label>
        <input v-model="form.nickname" placeholder="닉네임을 입력하세요" />
      </div>

      <!-- 공개 여부 -->
      <div class="form-group">
        <label>계정 공개 여부</label>
        <div>
          <label><input type="radio" value="true" v-model="publicString" /> 공개</label>
          <label><input type="radio" value="false" v-model="publicString" /> 비공개</label>
        </div>
      </div>

      <!-- 링크 -->
      <div class="form-group">
        <label>링크</label>
        <input v-model="linkTitle" placeholder="링크 제목" />
        <input v-model="linkUrl" placeholder="URL" />
      </div>

      <!-- 프로필 이미지 (파일 업로드) -->
      <div class="form-group">
        <label>프로필 이미지</label>
        <input type="file" accept="image/*" @change="onFileSelect" />
        <div v-if="previewUrl">
          <img :src="previewUrl" alt="프로필 미리보기" style="max-width:100px;"/>
        </div>
      </div>

      <!-- 관심 태그 -->
      <div class="form-group">
        <label>관심 태그</label>
        <div class="tag-area">
          <button
              v-for="tag in allTags"
              :key="tag"
              :disabled="isTagSelected(tag) && selectedTags.length >= 5"
              @click.prevent="toggleTag(tag)"
              :class="{ selected: isTagSelected(tag) }"
          >
            {{ tag }}
          </button>
        </div>
        <p style="color: red" v-if="selectedTags.length < 1">태그를 최소 1개 이상 선택해야 합니다.</p>
        <p>선택된 태그: {{ selectedTags.join(', ') }}</p>
      </div>

      <button type="button" class="save-button" :disabled="selectedTags.length < 1" @click="updateProfile">
        변경사항 저장
      </button>
    </form>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, defineProps, watch} from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { getAuth } from "firebase/auth";

// props에서 userDetails 받아오기
const props = defineProps(["userDetails"]);
const router = useRouter();
const profileIdAvailable = ref(null);

const form = ref({
  profileId: "",
  nickname: "",
  links: "",
  isPublic: true,
  tags: "",
});
const publicString = ref("true");
// 링크 데이터
const linkTitle = ref('') // 제목 입력값
const linkUrl = ref('')   // URL 입력값

watch(
    [linkTitle, linkUrl],
    ([newTitle, newUrl]) => {
      if (newTitle && newUrl) {
        form.value.links = JSON.stringify({ title: newTitle, url: newUrl });
      } else {
        form.value.links = '' // 제목이나 URL이 비어 있으면 links 초기화
      }
    },
    { immediate: true }
)
//================================
// 2) 아이디 중복확인
//================================
async function checkProfileId() {
  if (!form.value.profileId) {
    alert('아이디를 입력해주세요.')
    return
  }
  try {
    const auth = getAuth()
    const idToken = await auth.currentUser.getIdToken(true)

    const res = await axios.get('/api/users/check-profile-id/authenticated', {
      headers: { Authorization: `Bearer ${idToken}` },
      params: { profileId: form.value.profileId }
    })
    // 서버 응답이 Boolean 값을 직접 반환한다고 가정
    profileIdAvailable.value = res.data // 응답이 true 또는 false
    if (profileIdAvailable.value) {
      alert('사용 가능한 아이디입니다.')
    } else {
      alert('이미 사용 중인 아이디입니다.')
    }
  } catch (err) {
    console.error(err)
    profileIdAvailable.value = null // 오류 시 상태 초기화
    alert('중복확인 중 오류 발생')
  }
}

// 공개 여부
const isPublicComputed = computed({
  get: () => publicString.value === "true",
  set: (val) => (publicString.value = val ? "true" : "false"),
});

// 태그 데이터
const allTags = [
  "HTML", "JavaScript", "Java", "Ruby", "TypeScript", "Swift", "Kotlin", "Python",
  "C", "C++", "C#", "Go", "Scala", "Dart", "MySQL", "Oracle", "Markdown",
  "데이터 분석", "딥러닝/머신러닝", "자연어 처리", "블록체인", "UX/UI"
];
const selectedTags = ref([]);

// 태그 선택
function toggleTag(tag) {
  if (isTagSelected(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  } else {
    if (selectedTags.value.length < 5) {
      selectedTags.value.push(tag);
    } else {
      alert("최대 5개까지 선택 가능합니다.");
    }
  }
}
function isTagSelected(tag) {
  return selectedTags.value.includes(tag);
}

// 이미지 업로드 (미리보기)
const previewUrl = ref('')
let selectedFile = null

//================================
// 4) 프로필 이미지 선택 (미리보기)
//================================
function onFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// 기존 데이터 설정
onMounted(() => {
  const queryParams = router.currentRoute.value.query;
  if (queryParams.userDetails) {
    const parsedUser = JSON.parse(queryParams.userDetails);

    form.value = { ...parsedUser };
    if (form.value.links) {
      const parsedLinks = JSON.parse(form.value.links)

      linkTitle.value = parsedLinks.title || "";
      linkUrl.value = parsedLinks.url || "";
    }
    selectedTags.value = parsedUser.tags ? parsedUser.tags.split(",") : [];
  }
});

// 프로필 수정 요청
async function updateProfile() {
  form.value.isPublic = isPublicComputed.value;
  form.value.tags = selectedTags.value.join(",");

  const formData = new FormData();
  formData.append("user", new Blob([JSON.stringify(form.value)], { type: "application/json" })); // JSON 데이터를 Blob으로 추가
  if (selectedFile) {
    formData.append("file", selectedFile); // 선택한 파일 추가
  }

  try {
    const auth = getAuth();
    const idToken = await auth.currentUser.getIdToken(true);

    await axios.patch("/api/users/me", formData, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      }
    });

    alert("프로필이 수정되었습니다!");
    router.push("/main");
  } catch (err) {
    console.error(err);
    alert("프로필 수정 중 오류가 발생했습니다.");
  }
}
</script>
