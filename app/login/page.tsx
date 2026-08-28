"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMessage(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return <main className="container" style={{maxWidth:520,paddingTop:80}}>
    <div className="logo">Ad<span>key</span></div>
    <h1 style={{fontSize:50,marginTop:45}}>Welcome back.</h1>
    <form className="card" onSubmit={submit}>
      <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:12}}/>
      <input required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:16}}/>
      <button disabled={loading} className="btn btn-yellow" style={{width:"100%"}}>{loading ? "Logging in..." : "Log in"}</button>
      {message && <p style={{color:"#b00020"}}>{message}</p>}
    </form>
  </main>;
}