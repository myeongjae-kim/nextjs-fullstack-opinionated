/**
 * hono-docs가 생성한 openapi.json 파일에 securitySchemes 속성을 추가합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiJsonPath = path.join(__dirname, '..', 'public', 'docs', 'openapi.json');

// openapi.json 파일 읽기
const openapiJson = JSON.parse(fs.readFileSync(openapiJsonPath, 'utf8'));

// components 속성이 없으면 생성
if (!openapiJson.components) {
  openapiJson.components = {};
}

// securitySchemes 추가 또는 업데이트
openapiJson.components.securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    description: 'Token Description'
  }
};

// 파일에 다시 쓰기
fs.writeFileSync(openapiJsonPath, JSON.stringify(openapiJson, null, 2), 'utf8');

console.log('Successfully patched openapi.json with securitySchemes');

