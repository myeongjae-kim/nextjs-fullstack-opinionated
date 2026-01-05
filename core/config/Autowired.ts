import { returnAutowired } from "inversify-typesafe-spring-like";
import { Beans } from "./beanConfig";

export const { Autowired } = returnAutowired<Beans>();