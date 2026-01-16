import { lazy } from '@/core/common/util/lazy';
import { beanConfig } from '@/core/config/beanConfig';
import { ApplicationContext } from 'inversify-typesafe-spring-like';

export const applicationContext = lazy(() => ApplicationContext(beanConfig));