import { type Beans } from '@/core/config/beanConfig.ts';
import { returnAutowired } from 'inversify-typesafe-spring-like';

export const { Autowired } = returnAutowired<Beans>();