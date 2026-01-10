import { minimatch } from "minimatch";

type AuthType = 'AUTHORIZE' | 'PERMIT_ALL';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type Pattern = string
type HttpPath = [HttpMethod | 'ALL', Pattern, AuthType]

const paths: HttpPath[] = [
  ['GET', '/api/swagger', 'PERMIT_ALL'],
  ['GET', '/api/articles', 'PERMIT_ALL'],
  ['POST', '/api/articles', 'AUTHORIZE'],
  ['GET', '/api/articles/*', 'PERMIT_ALL'],
  ['PUT', '/api/articles/*', 'AUTHORIZE'],
  ['DELETE', '/api/articles/*', 'AUTHORIZE'],
  ['ALL', '/api/**', 'AUTHORIZE'],
]

export const isApiAuthRequired = (method: string, pathname: string) => {
  for (const [httpMethod, pattern, authType] of paths) {
    if ((httpMethod === method || httpMethod === 'ALL') && minimatch(pathname, pattern)) {
      return authType === 'AUTHORIZE';
    }
  }

  return false;
}