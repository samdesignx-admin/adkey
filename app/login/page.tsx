"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
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
    if (error) return setMessage("We couldn't sign you in. Please check your email and password and try again.");
    router.push("/dashboard");
    router.refresh();
  }

  return <main className="container" style={{maxWidth:520,paddingTop:80}}>
    <div className="logo">Ad<span>key</span></div>
    <div className="kicker" style={{marginTop:42}}>Advertiser portal</div>
    <h1 style={{fontSize:50,marginTop:12}}>Welcome back.</h1>
    <p className="lead">Sign in to manage your ads, AdKeys and campaigns.</p>
    <form className="card" onSubmit={submit}>
      <label style={{display:"block",fontWeight:800,marginBottom:7}}>Email</label>
      <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" type="email" autoComplete="email" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:14}}/>
      <label style={{display:"block",fontWeight:800,marginBottom:7}}>Password</label>
      <input required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:16}}/>
      <button disabled={loading} className="btn btn-yellow" style={{width:"100%"}}>{loading ? "Signing in..." : "Log in to Adkey"}</button>
      {message && <p role="alert" style={{color:"#b00020",lineHeight:1.5}}>{message}</p>}
      <div style={{display:"flex",justifyContent:"space-between",gap:16,marginTop:20,fontSize:14}}>
        <Link href="/forgot-password" style={{fontWeight:800}}>Forgot password?</Link>
        <span>New to Adkey? <Link href="/signup" style={{fontWeight:800}}>Create account</Link></span>
      </div>
    </form>
  </main>;
}