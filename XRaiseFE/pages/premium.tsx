import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Premium() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      router.push("/dashboard");
    }
  }, [session?.error, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="container">
      <h2>Premium Content</h2>
      <p>This page is restricted to active subscribers (Basic or Pro).</p>
    </div>
  );
}