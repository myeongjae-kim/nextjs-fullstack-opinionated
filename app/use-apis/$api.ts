'use client';

import { paths } from '@/lib/api/schema';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const fetchClient = createFetchClient<paths>({
  // baseUrl: "https://myapi.dev/v1/", // 이 애플리케이션은 자기 자신에게 요청하므로 비워둔다. 실제로는 서버 URL을 넣어야 한다.
});

interface AuthToken {
  access_token: string;
  refresh_token: string;
}

// Request Interceptor: Authorization 헤더 추가
fetchClient.use({
  onRequest({ request }) {
    const authData = typeof window !== 'undefined' ? localStorage.getItem('@nextjs-fullstack-opinionated/authToken') : null;
    if (authData) {
      try {
        const { access_token } = JSON.parse(authData) as AuthToken;
        if (access_token) {
          request.headers.set('Authorization', `Bearer ${access_token}`);
        }
      } catch (e) {
        console.error('Failed to parse authToken from localStorage', e);
      }
    }
    return request;
  },
});

// Response Interceptor: 401 에러 시 토큰 갱신 로직
fetchClient.use({
  async onResponse({ response, request }) {
    if (response.status === 401 && !request.url.includes('/api/users/refresh')) {
      const authData = typeof window !== 'undefined' ? localStorage.getItem('@nextjs-fullstack-opinionated/authToken') : null;
      if (authData) {
        try {
          const { refresh_token } = JSON.parse(authData) as AuthToken;
          if (refresh_token) {
            // 토큰 갱신 시도
            const { data, error } = await fetchClient.POST('/api/users/refresh', {
              body: { refresh_token },
            });

            if (data && !error) {
              // 새 토큰 데이터 전체를 stringify해서 저장
              localStorage.setItem('@nextjs-fullstack-opinionated/authToken', JSON.stringify(data));

              // 원래 요청 재시도
              const newRequest = new Request(request.url, request.clone());
              newRequest.headers.set('Authorization', `Bearer ${data.access_token}`);
              return fetch(newRequest);
            }
          }
        } catch (e) {
          console.error('Failed to parse authToken or refresh token', e);
        }
      }
    }
    return response;
  },
});

export const $api = createClient(fetchClient);
