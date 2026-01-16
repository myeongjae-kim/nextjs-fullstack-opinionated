import { Beans } from '@/core/config/beanConfig';
import { returnAutowired } from 'inversify-typesafe-spring-like';

export const { Autowired } = returnAutowired<Beans>();