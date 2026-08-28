import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Media={path:string;name:string;type:"image"|"video";order:number};

export default async function PublicAd({params}:{params:Promise<{adKey:string}>}){
 const {adKey}=await params; const supabase=await createClient(); const code=adKey.toUpperCase();
 const {data:key}=await supabase.from("ad_keys").select("id,ad_id,code,status,expires_at").eq("code",code).eq("status","active").maybeSingle();
 if(!key||(key.expires_at&&new Date(key.expires_at)<new Date()))notFound();
 const {data:ad}=await supabase.from("ads").select("id,title,headline,description,cta_label,destination_url,advertiser_id,status,media").eq("id",key.ad_id).eq("status","active").maybeSingle(); if(!ad)notFound();
 const {data:advertiser}=await supabase.from("advertisers").select("name,description,website,phone,email,logo_url").eq("id",ad.advertiser_id).maybeSingle();
 const media=((ad.media||[]) as Media[]).sort((a,b)=>a.order-b.order);
 const signed=await Promise.all(media.map(async item=>{const {data}=await supabase.storage.from("ad-media").createSignedUrl(item.path,60*60);return {...item,url:data?.signedUrl||null};}));
 return <main className="ad-public"><div className="nav" style={{border:0}}><div className="logo">Ad<span>key</span></div><div className="badge">AdKey {code}</div></div>
 <div style={{display:"grid",gap:16,marginTop:24}}>{signed.length?signed.map(item=>item.url&&<div className="media" key={item.path}>{item.type==="video"?<video className="ad-media-content" src={item.url} controls playsInline/>:<img className="ad-media-content" src={item.url} alt={item.name||ad.title}/>}</div>):<div className="media">Advertisement media coming soon</div>}</div>
 <div style={{marginTop:26}}><div className="kicker">Advertisement</div><h1 style={{fontSize:58,letterSpacing:-3}}>{ad.headline||ad.title}</h1>{ad.description&&<p className="lead">{ad.description}</p>}{ad.destination_url&&<a className="btn btn-yellow" style={{marginTop:18}} href={ad.destination_url} target="_blank" rel="noreferrer">{ad.cta_label||"Learn more"}</a>}</div>
 <div className="card" style={{marginTop:28}}><strong>{advertiser?.name||"Seller"}</strong>{advertiser?.description&&<p>{advertiser.description}</p>}{advertiser?.website&&<a href={advertiser.website} target="_blank" rel="noreferrer">{advertiser.website}</a>}</div></main>;
}