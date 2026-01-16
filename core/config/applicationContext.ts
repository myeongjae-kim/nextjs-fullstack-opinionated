import { lazy } from '@/core/common/util/lazy.js';
import { beanConfig } from '@/core/config/beanConfig.js';
import { ApplicationContext } from 'inversify-typesafe-spring-like';

export const applicationContext = lazy(() => ApplicationContext(beanConfig));