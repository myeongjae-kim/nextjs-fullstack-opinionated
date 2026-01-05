import { ApplicationContext } from "inversify-typesafe-spring-like";
import { lazy } from "../common/util/lazy";
import { beanConfig } from "./beanConfig";

export const applicationContext = lazy(() => ApplicationContext(beanConfig));