import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

type BillingStatus = {
  subscription_status: string;
  current_plan: string;
  total_amount_paid: number;
};

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  const fetchStatus = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await axiosInstance.get("/api/billing/status/");
      setBilling(response.data);
      setError("");
    } catch {
      setError("Failed to load status");
    }
  };

  const refreshSession = async () => {
    try {
      // Trigger NextAuth to refresh the token and update the session
      await update();
      // Fetch the latest billing status
      await fetchStatus();
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (router.query.session_id) {
        // User returned from checkout - refresh the session to get updated plan
        refreshSession();
        // Remove the session_id from URL to prevent repeated refreshes
        router.replace("/dashboard", undefined, { shallow: true });
      } else {
        fetchStatus();
      }
    } else if (status === "unauthenticated") {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router.query.session_id]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const startCheckout = async (path: "upgrade" | "downgrade", plan: string) => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post(`/api/billing/${path}/`, { plan });
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        await fetchStatus();
      }
    } catch {
      setError("Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>
        Logged in as <strong>{session?.username || session?.user?.name || session?.user?.email}</strong>
      </p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>

      <div style={{ marginTop: 24 }}>
        <h3>Current Plan</h3>
        <p>{billing?.current_plan || "none"}</p>
        <h4>Subscription Status: {billing?.subscription_status || "inactive"}</h4>
        <h4>Lifetime Spend: {formatCurrency(billing?.total_amount_paid || 0)}</h4>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Actions</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button disabled={loading} onClick={() => startCheckout("upgrade", "basic")}>
            Upgrade to Basic ($10)
          </button>
          <button disabled={loading} onClick={() => startCheckout("upgrade", "pro")}>
            Upgrade to Pro ($20)
          </button>
          <button disabled={loading} onClick={() => startCheckout("downgrade", "basic")}>
            Downgrade to Basic ($10)
          </button>
          <button disabled={loading} onClick={() => startCheckout("downgrade", "none")}>
            Downgrade to No Plan
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/premium" style={{ textDecoration: "none" }}>
          <button>Go to Premium Page</button>
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}