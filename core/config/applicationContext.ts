import { ApplicationContext } from "inversify-typesafe-spring-like";
import { lazy } from "../common/util/lazy.ts";
import { beanConfig } from "./beanConfig.ts";

export const applicationContext = lazy(() => ApplicationContext(beanConfig));