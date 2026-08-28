import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({children}:{children:React.ReactNode}){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/login");
 return <div className="dashboard"><aside className="side"><div className="logo" style={{marginBottom:28}}>Ad<span>key</span></div><Link href="/dashboard">Overview</Link><Link href="/dashboard/ads">My Ads</Link><Link href="/dashboard/ads/new">Create Ad</Link><Link href="/dashboard/campaigns">Campaigns</Link><Link href="/dashboard/analytics">Analytics</Link><Link href="/dashboard/business">Business</Link><Link href="/dashboard/billing">Billing</Link></aside><section className="main">{children}</section></div>
}