import Link from "next/link";
import { ArrowRight, QrCode, BarChart3, Sparkles } from "lucide-react";

export default function Home() {
 return <main>
  <div className="container">
   <nav className="nav"><div className="logo">Ad<span>key</span></div><div className="navlinks"><Link href="/pricing">Pricing</Link><Link href="/login">Log in</Link><Link className="btn btn-yellow" href="/signup">Create an ad</Link></div></nav>
   <section className="hero">
    <div><div className="kicker">Advertising infrastructure for every channel</div><h1>Every ad.<br/><span className="highlight">One key.</span></h1><p className="lead">Create a rich digital ad experience, generate a unique AdKey and QR code, place it anywhere, and see what happens next.</p><div className="actions"><Link className="btn btn-yellow" href="/signup">Create your first ad <ArrowRight size={18}/></Link><Link className="btn btn-black" href="/search">Enter an AdKey</Link></div></div>
    <div className="hero-card"><div className="kicker">Your advertisement identity</div><div className="key">7KX92P</div><p style={{marginTop:24,color:"#bbb",fontSize:18}}>One persistent key connects your TV, print, billboard, social and physical advertising to a digital experience.</p><div className="qr"><QrCode size={68}/></div></div>
   </section>
   <div className="grid3">
    <div className="card"><QrCode size={28}/><h3>Create & generate</h3><p>Create an ad, then instantly receive a unique AdKey and dynamic QR code.</p></div>
    <div className="card"><ArrowRight size={28}/><h3>Share anywhere</h3><p>Use the same AdKey and QR on print, OOH, TV, social and more.</p></div>
    <div className="card"><BarChart3 size={28}/><h3>Track engagement</h3><p>Measure scans, views, clicks and downstream actions.</p></div>
   </div>
   <h2 className="section-title">Advertising that doesn't end when someone sees it.</h2>
  </div>
 </main>
}