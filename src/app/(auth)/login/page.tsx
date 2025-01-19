"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image';
import lock from "../../../../public/lock.png";
import user from "../../../../public/user.png";
import focusLogo from "../../../../public/focus-logo.png";
import transparencyBadge from "../../../../public/transparency-badge.png";
import { deflateRawSync } from "zlib";
import { loginUser } from "@/server/db/actions/AuthActions";

export default function Login() {
  const router = useRouter();
  const [credentialsError, setCredentialsError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const result = await loginUser(email, email);
      if (result.success) {
        router.push("/");
      }
    } catch (error) {
      setCredentialsError(true);
    }
  };

  const handleKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  function generateEncodedRequest() {
    const request = `
    <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      ID="http://localhost:3000/"
      Version="2.0"
      IssueInstant="${new Date().toISOString()}"
    >
      <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        http://localhost:3000/
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

  const handleSalesforceLogin = () => {
    window.location.href = `https://focus-ga.my.site.com/idp/endpoint/HttpRedirect?SAMLRequest=${generateEncodedRequest()}`; // Replace with actual Salesforce login URL
  }

  return (
    <div className="bg-[url('/Portal_Background.avif')] bg-cover min-h-screen w-screen">
      <a href="https://focus-ga.org/">
        <Image src={focusLogo} width={181} height={87} alt="focus-logo" className="mt-6 ml-[60px] fixed" />
      </a>
      <div className="flex flex-col justify-center items-center">
        <div className="mx-[24vw] flex flex-col justify-center items-center mt-[16vh]">
          <Image src={focusLogo} width={295} height={145} alt="focus-logo" />
          <div className="relative mt-3">
            <i className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Image src={user} width={17} alt="user-icon" />
            </i>
            
            <input
              className="border-[1px] border-gray-300 rounded-sm pr-3.5 pl-10 h-[51px] w-[295px] placeholder-med-gray text-med-gray focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown} // Submit on "Enter"
            />
          </div>

          <div className="relative mt-4">
            <i className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Image src={lock} width={17} alt="lock-icon" />
            </i>
            <input
              className="border-[1px] border-gray-300 rounded-sm pr-3.5 pl-10 h-[51px] w-[295px] placeholder-med-gray text-med-gray focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Submit on "Enter"
            />
          </div>

          {credentialsError && (
            <p className="text-red-500 text-sm mt-2">Invalid username or password. Please try again.</p>
          )}

          <button
            onClick={handleLogin}
            className="rounded-sm h-[51px] mt-5 bg-theme-blue text-white w-[295px] hover:bg-opacity-80"
          >
            Log in
          </button>

          <button onClick={handleSalesforceLogin} className="rounded-sm h-[51px] mt-2 bg-green-500 text-white w-[295px]">Log in with Salesforce</button>
          <a href="https://focus-ga.my.site.com/s/login/ForgotPassword" className="mt-8 text-left w-[295px]">
            Forgot your password?
          </a>
        </div>
        <div className="flex flex-row justify-between mx-[17vw] mt-12 mb-0 items-center">
          <div className="w-[33%] text-base">
            <p>770-234-9111 (phone)</p>
            <p>770-234-9131 (fax)</p>
            <p className="mt-2">3825 Presidential Parkway</p>
            <p>Suite 103</p>
            <p>Atlanta, GA 30340</p>
            <p className="mt-2">inquiry@focus-ga.org</p>
          </div>
          <div className="w-[33%] flex flex-row justify-center items-center">
            <div className="w-[85px] h-[85px]">
              <Image src={transparencyBadge} width={85} height={85} alt="transparency-badge" />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-[33%]">
            <button
              onClick={() => router.push("https://focus-ga.org/donate/")}
              className="bg-theme-blue text-white w-[171px] h-[57px] rounded-sm hover:bg-opacity-80"
            >
              Donate
            </button>
            <p className="text-center mt-6 mb-6">
              FOCUS (Families of Children Under Stress) is a 501(c)(3) nonprofit organization with tax ID&nbsp;
              <span className="whitespace-nowrap">#58-1577602</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
