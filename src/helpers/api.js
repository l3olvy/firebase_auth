// src/helpers/api.js (예시: axios 인스턴스와 에러 처리)

import axios from 'axios'
import router from '../router'

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    // timeout, headers 등 설정 가능
})

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.log('401 Unauthorized');
                    router.push('/login'); // 로그인 페이지로 이동
                    break;
                case 404:
                    console.log('User Not Found (404)');
                    router.push('/register'); // 회원가입 페이지로 이동
                    break;
                case 409:
                    console.log('409 Conflict');
                    alert('이미 가입된 계정입니다. 로그인 해주세요.');
                    break;
                default:
                    console.log('Other error:', error.response.status);
                    alert(`에러 발생: ${error.response.status}`);
            }
        } else {
            console.error('No response from server', error);
        }
        return Promise.reject(error);
    }
);

export default instance
