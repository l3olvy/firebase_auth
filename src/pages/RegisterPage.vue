<template>
  <div class="register-page">
    <h2>회원가입 / 프로필 설정</h2>

    <!-- 이메일 (Firebase 로그인에서 획득) -->
    <div class="form-group">
      <label>이메일</label>
      <input v-model="email" />
    </div>

    <!-- 아이디(profileId) -->
    <div class="form-group">
      <label>아이디</label>
      <input v-model="form.profileId" placeholder="아이디를 입력해주세요" />
      <button @click="checkProfileId">중복확인</button>
      <!-- 중복 확인 결과 표시 -->
      <span v-if="profileIdAvailable === false" style="color:red;">이미 사용 중</span>
      <span v-else-if="profileIdAvailable === true" style="color:green;">사용 가능</span>
    </div>

    <!-- 닉네임 -->
    <div class="form-group">
      <label>닉네임</label>
      <input v-model="form.nickname" placeholder="닉네임 (6~20자)" />
    </div>

    <!-- 공개 여부 (isPublic) -->
    <div class="form-group">
      <label>계정 공개 범위</label>
      <div>
        <label>
          <input type="radio" value="true" v-model="publicString" />
          공개
        </label>
        <label>
          <input type="radio" value="false" v-model="publicString" />
          비공개
        </label>
      </div>
    </div>

    <!-- 링크(제목, URL) -->
    <div class="form-group">
      <label>링크</label>
      <div>
        <input v-model="linkTitle" placeholder="제목 (6~20자)" />
        <input v-model="linkUrl" placeholder="URL (6~20자)" />
      </div>
      <small>SNS나 블로그 등 공유할 주소를 설정해보세요. (선택)</small>
    </div>

    <!-- 프로필 이미지 (파일 업로드) -->
    <div class="form-group">
      <label>프로필 이미지</label>
      <input type="file" accept="image/*" @change="onFileSelect" />
      <div v-if="previewUrl">
        <img :src="previewUrl" alt="프로필 미리보기" style="max-width:100px;"/>
      </div>
    </div>

    <!-- 관심 태그 (최대 5개) -->
    <div class="form-group">
      <label>관심 태그</label>
      <div class="tag-area">
        <button
            v-for="tag in allTags"
            :key="tag"
            :disabled="isTagSelected(tag) && selectedTags.length >= 5"
            @click="toggleTag(tag)"
            :class="{ selected: isTagSelected(tag) }"
        >
          {{ tag }}
        </button>
      </div>
      <p>선택된 태그: {{ selectedTags.join(', ') }}</p>
    </div>

    <!-- 저장 버튼 -->
    <button class="save-button" @click="submitForm">변경사항 저장</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { getAuth } from 'firebase/auth'
import router from '@/router'
import api from "@/helpers/api.js";

// 서버로 보낼 Form 데이터
const form = ref({
  email: '',
  profileId: '',
  nickname: '',
  links: '',       // JSON 문자열 (단일 객체)
  isPublic: true,
  tags: ''
})

// 이메일 (Firebase에서 가져와서 표시만, 수정 불가)
const email = ref('')

// 아이디 중복 확인
const profileIdAvailable = ref(null) // null=안함, true=가능, false=중복

// 링크 데이터
const linkTitle = ref('') // 제목 입력값
const linkUrl = ref('')   // URL 입력값

// links를 단일 JSON 문자열로 업데이트
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

// 태그 데이터
const allTags = [
  'HTML','JavaScript','Java','Ruby','TypeScript','Swift','Kotlin','Python','C','C++','C#','Go','Scala','Dart','MySQL',
  'Oracle','Markdown','데이터 분석','데이터 엔지니어링','딥러닝/머신러닝','컴퓨터 비전','자연어 처리','시스템/운영체제','블록체인',
  '컴퓨터 구조','임베디드/IoT','반도체','로보공학','UX/UI'
]
const selectedTags = ref([])

// 공개여부(isPublic) → 라디오에선 문자열로 나옴, boolean으로 변환
const publicString = ref('true')
const isPublicComputed = computed({
  get() {
    return publicString.value === 'true'
  },
  set(val) {
    publicString.value = val ? 'true' : 'false'
  }
})

// 이미지 업로드 (미리보기)
const previewUrl = ref('')
let selectedFile = null

//================================
// 1) onMounted → Firebase 이메일 설정
//================================
onMounted(async () => {
  const auth = getAuth()
  if (auth.currentUser) {
    const userEmail = auth.currentUser.email || ''
    email.value = userEmail
    form.value.email = userEmail
  }
})

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

    const res = await axios.get('/api/users/check-profile-id', {
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

//================================
// 3) 태그 선택 (최대 5개)
//================================
function toggleTag(tag) {
  if (isTagSelected(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    if (selectedTags.value.length < 5) {
      selectedTags.value.push(tag)
    } else {
      alert('최대 5개까지 선택 가능합니다.')
    }
  }
}
function isTagSelected(tag) {
  return selectedTags.value.includes(tag)
}

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

//================================
// 5) 폼 전송 (회원가입)
//================================
async function submitForm() {
  form.value.isPublic = isPublicComputed.value
  form.value.tags = selectedTags.value.join(',')

  const formData = new FormData();
  formData.append("user", new Blob([JSON.stringify(form.value)], { type: "application/json" })); // JSON 데이터를 Blob으로 추가
  if (selectedFile) {
    formData.append("file", selectedFile); // 선택한 파일 추가
  }
  try {
    const auth = getAuth()
    const idToken = await auth.currentUser.getIdToken(true)

    const res = await axios.post('/api/users/register', formData, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      }
    })

    alert('회원가입(프로필 설정) 완료!')
    router.push('/main')
  } catch (err) {
    console.error(err)
    alert('회원가입 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.register-page {
  max-width: 600px;
  margin: 20px auto;
}
.form-group {
  margin-bottom: 1rem;
}
.tag-area button.selected {
  background-color: #007bff;
  color: white;
}
</style>
