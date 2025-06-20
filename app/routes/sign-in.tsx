import type { Route } from "./+types/sign-in";
import * as React from "react";
import SignInTemplate from "../components/sign-in/SignIn";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function SignIn() {
  return <SignInTemplate />;
}
