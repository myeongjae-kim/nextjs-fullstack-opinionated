"use client";

import { paths } from "@/lib/api/schema";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  // baseUrl: "https://myapi.dev/v1/", // 이 애플리케이션은 자기 자신에게 요청하므로 비워둔다. 실제로는 서버 URL을 넣어야 한다.
});

// Request Interceptor: Authorization 헤더 추가
fetchClient.use({
  onRequest({ request }) {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return request;
  },
});

// Response Interceptor: 401 에러 시 토큰 갱신 로직
fetchClient.use({
  async onResponse({ response, request }) {
    if (response.status === 401 && !request.url.includes("/api/users/refresh")) {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (refreshToken) {
        // 토큰 갱신 시도
        const { data, error } = await fetchClient.POST("/api/users/refresh", {
          body: { refresh_token: refreshToken },
        });

        if (data && !error) {
          // 새 토큰 저장
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // 원래 요청 재시도
          const newRequest = new Request(request.url, request.clone());
          newRequest.headers.set("Authorization", `Bearer ${data.access_token}`);
          return fetch(newRequest);
        }
      }
    }
    return response;
  },
});

export const $api = createClient(fetchClient);
