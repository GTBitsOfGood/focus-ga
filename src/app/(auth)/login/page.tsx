"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import lock from "../../../../public/lock.png";
import user from "../../../../public/user.png";
import focusLogo from "../../../../public/focus-logo.png";
import transparencyBadge from "../../../../public/transparency-badge.png";
import { deflateRawSync } from "zlib";
import { loginUser } from "@/server/db/actions/AuthActions";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";

export default function Login() {
  const router = useRouter();
  const [credentialsError, setCredentialsError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, email);
      if (result.success) {
        const authenticatedUser = await getAuthenticatedUser();
        if (
          result.isFirstTime &&
          authenticatedUser?.childDisabilities.length === 0
        ) {
          router.push("/?setup=true");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setCredentialsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: { key: string }) => {
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
  };

  return (
    <div className="min-h-screen w-screen bg-[url('/Portal_Background.avif')] bg-cover">
      <a href="https://focus-ga.org/">
        <Image
          src={focusLogo}
          width={181}
          height={87}
          alt="focus-logo"
          className="fixed ml-[60px] mt-6"
        />
      </a>
      <div className="flex flex-col items-center justify-center">
        <div className="mx-[24vw] mt-[16vh] flex flex-col items-center justify-center">
          <Image src={focusLogo} width={295} height={145} alt="focus-logo" />
          <div className="relative mt-3">
            <i className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-500">
              <Image src={user} width={17} alt="user-icon" />
            </i>

            <input
              className="placeholder-med-gray text-med-gray h-[51px] w-[295px] rounded-sm border-[1px] border-gray-300 pl-10 pr-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown} // Submit on "Enter"
            />
          </div>

          <div className="relative mt-4">
            <i className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-500">
              <Image src={lock} width={17} alt="lock-icon" />
            </i>
            <input
              className="placeholder-med-gray text-med-gray h-[51px] w-[295px] rounded-sm border-[1px] border-gray-300 pl-10 pr-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Submit on "Enter"
            />
          </div>

          {credentialsError && (
            <p className="mt-2 text-sm text-red-500">
              Invalid username or password. Please try again.
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`mt-5 h-[51px] w-[295px] rounded-sm bg-theme-blue text-white ${
              isLoading ? "bg-opacity-80" : "hover:bg-opacity-80"
            }`}
          >
            Log in
          </button>

          <button
            onClick={handleSalesforceLogin}
            className="mt-2 h-[51px] w-[295px] rounded-sm bg-green-500 text-white"
          >
            Log in with Salesforce
          </button>
          <a
            href="https://focus-ga.my.site.com/s/login/ForgotPassword"
            className="mt-8 w-[295px] text-left"
          >
            Forgot your password?
          </a>
        </div>
        <div className="mx-[17vw] mb-0 mt-12 flex flex-row items-center justify-between">
          <div className="w-[33%] text-base">
            <p>770-234-9111 (phone)</p>
            <p>770-234-9131 (fax)</p>
            <p className="mt-2">3825 Presidential Parkway</p>
            <p>Suite 103</p>
            <p>Atlanta, GA 30340</p>
            <p className="mt-2">inquiry@focus-ga.org</p>
          </div>
          <div className="flex w-[33%] flex-row items-center justify-center">
            <div className="h-[85px] w-[85px]">
              <Image
                src={transparencyBadge}
                width={85}
                height={85}
                alt="transparency-badge"
              />
            </div>
          </div>
          <div className="flex w-[33%] flex-col items-center justify-center">
            <button
              onClick={() => router.push("https://focus-ga.org/donate/")}
              className="h-[57px] w-[171px] rounded-sm bg-theme-blue text-white hover:bg-opacity-80"
            >
              Donate
            </button>
            <p className="mb-6 mt-6 text-center">
              FOCUS (Families of Children Under Stress) is a 501(c)(3) nonprofit
              organization with tax ID&nbsp;
              <span className="whitespace-nowrap">#58-1577602</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
