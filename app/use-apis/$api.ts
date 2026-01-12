"use client";

import { paths } from "@/lib/api/schema";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  // baseUrl: "https://myapi.dev/v1/", // 이 애플리케이션은 자기 자신에게 요청하므로 비워둔다. 실제로는 서버 URL을 넣어야 한다.
});
export const $api = createClient(fetchClient);