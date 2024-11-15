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
  } catch (e) {
    result = { error: "Error processing SAML response" };
  }

  if (result.error) {
    return redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  if (!result.username) {
    return redirect(`/login?error=${encodeURIComponent("Could not determine username")}`);
  }

  await loginUser(result.username, result.userId);

  return redirect('/');
}
