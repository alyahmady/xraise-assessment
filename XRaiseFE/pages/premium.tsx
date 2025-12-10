import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Premium() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  return (
    <div className="container">
      <h2>Premium Content</h2>
      <p>This page is restricted to active subscribers (Basic or Pro).</p>
    </div>
  );
}

