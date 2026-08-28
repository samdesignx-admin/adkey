"use client";
import { useState } from "react";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { generateAdKey } from "@/lib/adkey/generate";

type Result = { code:string; url:string; qr:string };

export default function NewAd(){
 const [step,setStep]=useState(0);
 const [business,setBusiness]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [ctaLabel,setCtaLabel]=useState("Learn more");
 const [destinationUrl,setDestinationUrl]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [result,setResult]=useState<Result|null>(null);
 const steps=["Business","Details","CTA","Publish"];

 function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

 async function publish(){
  if(!business.trim()||!title.trim()){setError("Business name and ad title are required.");return;}
  setLoading(true);setError("");
  const supabase=createClient();
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user){setError("Please log in before publishing an advertisement.");setLoading(false);return;}

  let advertiserId:string;
  const {data:existing,error:existingError}=await supabase.from("advertisers").select("id").eq("owner_user_id",user.id).limit(1).maybeSingle();
  if(existingError){setError(existingError.message);setLoading(false);return;}
  if(existing){advertiserId=existing.id;}
  else {
   const base=slugify(business)||"business";
   const slug=base+"-"+user.id.slice(0,6);
   const {data,error}=await supabase.from("advertisers").insert({owner_user_id:user.id,name:business.trim(),slug}).select("id").single();
   if(error||!data){setError(error?.message||"Unable to create business.");setLoading(false);return;}
   advertiserId=data.id;
   await supabase.from("subscriptions").insert({advertiser_id:advertiserId,plan:"free",status:"active",active_adkey_limit:1});
  }

  const {count,error:countError}=await supabase.from("ad_keys").select("id",{count:"exact",head:true}).eq("status","active");
  if(countError){setError(countError.message);setLoading(false);return;}
  if((count||0)>=1){setError("Your free plan allows 1 active AdKey. Billing plans will unlock more keys.");setLoading(false);return;}

  const {data:ad,error:adError}=await supabase.from("ads").insert({
   advertiser_id:advertiserId,title:title.trim(),description:description.trim()||null,
   cta_label:ctaLabel.trim()||null,destination_url:destinationUrl.trim()||null,status:"active"
  }).select("id").single();
  if(adError||!ad){setError(adError?.message||"Unable to create advertisement.");setLoading(false);return;}

  let code="";
  let keyError:any=null;
  for(let attempt=0;attempt<5;attempt++){
   code=generateAdKey(6);
   const {error}=await supabase.from("ad_keys").insert({ad_id:ad.id,code,status:"active",activated_at:new Date().toISOString()});
   if(!error){keyError=null;break;}
   keyError=error;
  }
  if(keyError){setError(keyError.message||"Unable to generate a unique AdKey.");setLoading(false);return;}

  const url=window.location.origin+"/a/"+code;
  const qr=await QRCode.toDataURL(url,{margin:1,width:512});
  setResult({code,url,qr});setLoading(false);setStep(3);
 }

 if(result) return <div style={{maxWidth:800}}><div className="kicker">Advertisement published</div><h1 style={{fontSize:52,margin:"8px 0"}}>Your AdKey is live.</h1><div className="card"><div className="key" style={{margin:0}}>{result.code}</div><p className="lead">Place this code or QR code on your TV, print, OOH, social or any other advertisement.</p><img src={result.qr} alt={"QR code for "+result.code} style={{width:220,maxWidth:"100%",borderRadius:16}}/><p><strong>Public link:</strong><br/>{result.url}</p><a className="btn btn-yellow" href={result.url} target="_blank">Open advertisement</a></div></div>;

 return <div style={{maxWidth:800}}>
  <div className="kicker">Create advertisement</div><h1 style={{fontSize:50,margin:"8px 0 20px"}}>Build your ad.</h1>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:28}}>{steps.map((s,i)=><span key={s} className="badge" style={{background:i===step?"#ffe600":"#eee",color:"#111"}}>{i+1}. {s}</span>)}</div>
  <div className="card">
   {step===0&&<><h2>Your business</h2><p>This appears as the seller profile on the public ad page.</p><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Business name" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10}}/></>}
   {step===1&&<><h2>Advertisement details</h2><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ad title" style={{width:"100%",padding:14,marginBottom:12,border:"1px solid #ddd",borderRadius:10}}/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell people about your advertisement" style={{width:"100%",minHeight:150,padding:14,border:"1px solid #ddd",borderRadius:10}}/></>}
   {step===2&&<><h2>Call to action</h2><input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)} placeholder="CTA label" style={{width:"100%",padding:14,marginBottom:12,border:"1px solid #ddd",borderRadius:10}}/><input value={destinationUrl} onChange={e=>setDestinationUrl(e.target.value)} placeholder="https://yourwebsite.com" type="url" style={{width:"100%",padding:14,border:"1px solid #ddd",borderRadius:10}}/></>}
   {step===3&&<><h2>Ready to publish</h2><p>Publishing creates a real persistent AdKey and dynamic QR code.</p></>}
   {error&&<p style={{color:"#b00020",fontWeight:700}}>{error}</p>}
   <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}><button className="btn" disabled={step===0||loading} onClick={()=>setStep(Math.max(0,step-1))}>Back</button><button className="btn btn-yellow" disabled={loading} onClick={()=>step===3?publish():setStep(step+1)}>{loading?"Publishing...":step===3?"Publish & Generate AdKey":"Continue"}</button></div>
  </div>
 </div>
}