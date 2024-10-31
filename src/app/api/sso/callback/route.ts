import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

import { decodeSAMLResponse, validateSAMLResponse } from "@/server/db/actions/sso";
import { NextResponse } from 'next/server';


const SALESFORCE_CERTIFICATE = process.env["SALESFORCE_CERTIFICATE"];
if (!SALESFORCE_CERTIFICATE && process.env["NODE_ENV"] === "production")
  throw new Error("SALESFORCE_CERTIFICATE env var must be set");

export async function POST(request : NextResponse) {
  const formData = await request.formData();
  const encodedSAMLResp = formData.get('SAMLResponse');

  let result;
  try {
    const decodedSAMLResp = decodeSAMLResponse(encodedSAMLResp);
    // result = validateSAMLResponse(decodedSAMLResp, SALESFORCE_CERTIFICATE);
    console.log(decodedSAMLResp);
  } catch (e) {
    console.error(e);
    result = { error: "Error processing SAML response" };
  }

  // const session : any = await getIronSession(cookies(), { password: "...", cookieName: "..." });
  // session.username = "Alison";

  // await session.save();
}