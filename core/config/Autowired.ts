import { Beans } from '@/core/config/beanConfig.js';
import { returnAutowired } from 'inversify-typesafe-spring-like';

export const { Autowired } = returnAutowired<Beans>();