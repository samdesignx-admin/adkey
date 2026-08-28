"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage("Account created. Check your email to confirm your account.");
    }
  }

  return <main className="container" style={{maxWidth:520,paddingTop:80}}>
    <div className="logo">Ad<span>key</span></div>
    <h1 style={{fontSize:50,marginTop:45}}>Create your account.</h1>
    <form className="card" onSubmit={submit}>
      <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:12}}/>
      <input required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (8+ characters)" type="password" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10,marginBottom:16}}/>
      <button disabled={loading} className="btn btn-yellow" style={{width:"100%"}}>{loading ? "Creating account..." : "Create account"}</button>
      {message && <p style={{color:"#555"}}>{message}</p>}
    </form>
  </main>;
}