import { AuthContext } from '@/core/auth/domain/AuthContext';
import { OpenAPIHono } from '@hono/zod-openapi';

export const Controller = <T extends object>() => new OpenAPIHono<{ Variables: AuthContext & T }>()