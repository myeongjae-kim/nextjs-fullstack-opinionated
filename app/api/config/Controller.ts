import { AuthContext } from '@/core/auth/domain/AuthContext.js';
import type { HttpBindings } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';

export const Controller = <T extends object>() => new OpenAPIHono<{ Variables: AuthContext & T, Bindings: HttpBindings }>()