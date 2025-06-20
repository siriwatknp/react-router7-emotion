import type { Route } from "./+types/sign-in";
import * as React from "react";
import SignUpTemplate from "../components/sign-up/SignUp";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Sign up for an account" },
  ];
}

export default function SignUp() {
  return <SignUpTemplate />;
}
