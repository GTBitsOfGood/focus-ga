import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from "@/lib/session";
import { decodeSAMLResponse, validateSAMLResponse } from "@/server/db/actions/sso";
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/server/db/actions/UserActions';
import { redirect } from 'next/navigation'

const SALESFORCE_CERTIFICATE = process.env["SALESFORCE_CERTIFICATE"];
if (!SALESFORCE_CERTIFICATE && process.env["NODE_ENV"] === "production")
  throw new Error("SALESFORCE_CERTIFICATE env var must be set");

const isDevelopment = process.env["NODE_ENV"] !== "production";

export async function POST(request : NextRequest) {
  const formData = await request.formData();
  const encodedSAMLResp = formData.get('SAMLResponse') as string;

  let result;
  try {
    const decodedSAMLResp = decodeSAMLResponse(encodedSAMLResp ?? "");
    result = validateSAMLResponse(decodedSAMLResp, SALESFORCE_CERTIFICATE ?? "");
    console.log(result);
  } catch (e) {
    console.error(e);
    result = { error: "Error processing SAML response" };
  }

  if (result.error) {
    return redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  await loginUser(result.username, result.userId);

  return redirect('/');
}
