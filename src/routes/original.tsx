import type { Route } from "./+types/original";
import App from "../App";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Original Dashboard" }];
}

export default function OriginalRoute() {
  return <App />;
}








