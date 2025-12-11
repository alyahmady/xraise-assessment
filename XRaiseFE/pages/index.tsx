import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/router";

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [authError, setAuthError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      setAuthError("Login failed");
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("reg_username") as HTMLInputElement).value;
    const email = (form.elements.namedItem("reg_email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("reg_password") as HTMLInputElement).value;
    try {
      await axios.post(`${backendBase}/api/users/register/`, { username, email, password });
      await signIn("credentials", { username, password, redirect: false });
      router.push("/dashboard");
    } catch {
      setAuthError("Registration failed");
    }
  };

  if (session) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container">
      <h2>Welcome to Billing Portal</h2>
      <div>
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="Username" required />
          <input name="password" placeholder="Password" type="password" required />
          <button type="submit">Login</button>
        </form>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Register</h3>
        <form onSubmit={handleRegister}>
          <input name="reg_username" placeholder="Username" required />
          <input name="reg_email" placeholder="Email" type="email" required />
          <input name="reg_password" placeholder="Password" type="password" required />
          <button type="submit">Register</button>
        </form>
      </div>
      {authError && <p style={{ color: "red" }}>{authError}</p>}
    </div>
  );
}