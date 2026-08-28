import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, adTitle, code, url, qr } = body;

    if (!email || !code || !url) {
      return NextResponse.json({ error: "Missing required email data." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Email is not configured yet." }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const qrHtml = qr
      ? '<p style="margin:24px 0"><img src="' + qr + '" width="220" alt="QR code for ' + code + '" style="display:block;border:0;border-radius:12px"/></p>'
      : "";

    const { error } = await resend.emails.send({
      from: "Adkey <hello@uxnest.ai>",
      to: [email],
      replyTo: "samdesignx@gmail.com",
      subject: "Your AdKey " + code + " is live!",
      html: '<!DOCTYPE html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:32px 16px"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:18px"><tr><td style="padding:40px"><p style="font-size:16px;font-weight:800;margin:0 0 24px">ADKEY</p><h1 style="font-size:32px;line-height:1.2;margin:0 0 16px">Your AdKey is live.</h1><p style="font-size:16px;line-height:1.6">Your advertisement <strong>' + (adTitle || "Advertisement") + '</strong> is ready to share.</p><p style="font-size:42px;line-height:1;font-weight:900;letter-spacing:4px;background:#ffe600;padding:18px 20px;border-radius:12px;text-align:center">' + code + '</p>' + qrHtml + '<p><a href="' + url + '" style="display:inline-block;background:#ffe600;color:#111;font-weight:800;text-decoration:none;padding:14px 22px;border-radius:10px">Open advertisement</a></p><p style="font-size:14px;line-height:1.6;color:#666">Need help? Reply to this email or contact samdesignx@gmail.com.</p></td></tr></table></td></tr></table></body></html>',
      text: "Your AdKey is live!\n\nAd: " + (adTitle || "Advertisement") + "\nAdKey: " + code + "\nOpen: " + url,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to send email." }, { status: 500 });
  }
}
