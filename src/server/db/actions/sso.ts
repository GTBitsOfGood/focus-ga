import { JSDOM } from "jsdom";
import { deflateRawSync } from "zlib";

// No great options for XML parsing that exposed required attributes,
// so pulling in JSDOM just to use the DOMParser.
const dom = new JSDOM("");
const DOMParser = dom.window.DOMParser;

const SUCCESS_VALUE = "urn:oasis:names:tc:SAML:2.0:status:Success";

export function decodeSAMLResponse(encodedSAMLResp : string) {
  const samlResp = Buffer.from(encodedSAMLResp, "base64").toString("utf-8");

  return samlResp;
}

/**
 * Validate the success of a SAML response.
 * TODO determine if there are other indicators of success/failure
 *
 * @param {String} samlResp decoded SAML response (XML)
 * @returns {Object} result        Object containing results of the validation
 * @returns {String} result.error  Message describing an error if any occurred
 * @returns {String} result.userId ID of the user that was authenticated
 */
export function validateSAMLResponse(samlResp : string, certificate : string) {
  const xml = new DOMParser().parseFromString(samlResp, "text/xml");

  const certificateElement = xml.getElementsByTagName("ds:X509Certificate")[0];
  const certificateStr = (certificateElement.textContent ?? "").replace(/\s/g, "");
  if (certificateStr !== certificate)
    return { error: "Could verify authenticity of response" };

  const statusElement = xml.getElementsByTagName("saml2p:StatusCode")[0];
  const statusStr = statusElement.getAttribute("Value");
  if (statusStr !== SUCCESS_VALUE)
    return { error: "Response was not successful" };

  const attributes = xml.getElementsByTagName("saml2:Attribute");

  let userId;
  let username;

  for (let attribute of attributes) {
    if (attribute.getAttribute("Name") === "userId")
      userId = attribute.textContent.trim();
    
    if (attribute.getAttribute("Name") == "username")
      username = attribute.textContent.trim();
  }

  if (!userId) return { error: "Could not find user ID" };
  if (!username) return { error: "Could not find username"};

  return { userId, username };
}

export function generateSAMLPayload() {
  const request = `
    <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      ID="abcd"
      Version="2.0"
      IssueInstant="${new Date().toISOString()}"
    >
      <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        abcd
      </saml:Issuer>
      <samlp:NameIDPolicy
        Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
        AllowCreate="true"
      />
    </samlp:AuthnRequest>
  `.trim();

  const deflated = deflateRawSync(request);
  const b64Encoded = Buffer.from(deflated).toString("base64");
  const uriEncoded = encodeURIComponent(b64Encoded);

  return uriEncoded;
}