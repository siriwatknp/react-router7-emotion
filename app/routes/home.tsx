import type { Route } from "./+types/home";
import type {} from "@mui/material/themeCssVarsAugmentation";
import Blog from "../components/blog/Blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Blog />;
}
