import { decodeSAMLResponse, validateSAMLResponse } from "@/server/db/actions/sso";
import { NextRequest } from 'next/server';
import { loginUser } from '@/server/db/actions/AuthActions';
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";

const SALESFORCE_CERTIFICATE = process.env["SALESFORCE_CERTIFICATE"];
if (!SALESFORCE_CERTIFICATE && process.env["NODE_ENV"] === "production")
  throw new Error("SALESFORCE_CERTIFICATE env var must be set");

const isDevelopment = process.env["NODE_ENV"] !== "production";

export async function POST(request: NextRequest) {
  // 🚨 Log request headers
  if (isDevelopment) {
    console.log("🔍 Request Headers:");
    request.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
  }

  const formData = await request.formData();
  const encodedSAMLResp = formData.get('SAMLResponse') as string;

  // 🚨 Log the raw encoded SAML response
  if (isDevelopment) {
    console.log("🔐 Encoded SAML Response:");
    console.log(encodedSAMLResp);
  }

  let result;
  try {
    const decodedSAMLResp = decodeSAMLResponse(encodedSAMLResp ?? "");

    // 🚨 Log decoded SAML Response
    if (isDevelopment) {
      console.log("📜 Decoded SAML Response:");
      console.log(decodedSAMLResp);
    }

    result = validateSAMLResponse(decodedSAMLResp, SALESFORCE_CERTIFICATE ?? "");

    // 🚨 Log validation result
    if (isDevelopment) {
      console.log("✅ SAML Validation Result:");
      console.log(result);
    }

  } catch (e) {
    console.error("❌ Error processing SAML response:", e);
    result = { error: "Error processing SAML response" };
  }

  if (result.error) {
    return redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  if (!result.username) {
    return redirect(`/login?error=${encodeURIComponent("Could not determine username")}`);
  }

  const userLogin = await loginUser(result.username, result.userId);

  if (userLogin.success) {
    const authenticatedUser = await getAuthenticatedUser();

    if (isDevelopment) {
      console.log("👤 Authenticated User:");
      console.log(authenticatedUser);
    }

    if (
      userLogin.isFirstTime &&
      authenticatedUser?.childDisabilities.length === 0
    ) {
      return redirect('/?setup=true');
    }
  }

  return redirect('/');
}
