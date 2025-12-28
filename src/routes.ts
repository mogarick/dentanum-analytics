import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("original", "routes/original.tsx"),
  route("procedures/:procedureCode", "routes/procedure-detail.tsx"),
] satisfies RouteConfig;

