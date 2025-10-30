"use client";

import { Button } from "./ui/button";
import { signOut } from "@/lib/actions/auth.action";

const SignoutBtn = () => {
  return (
    <Button
      onClick={() => signOut()}
      variant="outline"
      className="active:scale-105 cursor-pointer"
    >
      Sign Out
    </Button>
  );
};

export default SignoutBtn;
