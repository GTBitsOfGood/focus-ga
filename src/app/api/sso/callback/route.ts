import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

import { decodeSAMLResponse, validateSAMLResponse } from "@/server/db/actions/sso";
import { NextResponse } from 'next/server';


const SALESFORCE_CERTIFICATE = process.env["SALESFORCE_CERTIFICATE"];
if (!SALESFORCE_CERTIFICATE && process.env["NODE_ENV"] === "production")
  throw new Error("SALESFORCE_CERTIFICATE env var must be set");

export async function POST(request : NextResponse) {
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

  const session = await getIronSession(request, {
    cookieName: "your-session-cookie-name",
    password: process.env.SESSION_SECRET,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Assuming result.userId and result.username are available
  session.user = {
    id: result.userId,
    username: result.username,
  };

  // Save the session
  await session.save();

  return NextResponse.json({ message: "Session created successfully", user: session.user }, { status: 200 });
}