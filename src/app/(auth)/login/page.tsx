"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image';
import lock from "../../../../public/lock.png";
import user from "../../../../public/user.png";
import focusLogo from "../../../../public/focus-logo.png";
import transparencyBadge from "../../../../public/transparency-badge.png";

export default function Login() {
  const router = useRouter();
  const [credentialsError, setCredentialsError] = useState(false);

  const handleLogin = () => {}

  return (
    <div className="bg-[url('/Portal_Background.avif')] bg-cover bg-no-repeat h-screen w-screen">
      <a href="https://focus-ga.org/"><Image src={focusLogo} width={181} height={87} alt="focus-logo" className="mt-6	ml-[60px] fixed" /></a>
      <div className="flex flex-col justify-center items-center">
        <div className="mx-[24vw] flex flex-col justify-center items-center mt-[16vh]">
          <Image src={focusLogo} width={295} height={145} alt="focus-logo" />
          <div className="relative mt-3">
            <i className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"> {/* Replace with your icon */}
              <Image src={user} width={17} alt="user-icon" />
              <i className="fa fa-user"></i>
            </i>
            
            <input className="border-[1px] border-gray-300 rounded-sm pr-3.5 pl-10 h-[51px] w-[295px] placeholder-theme-med-gray text-theme-med-gray focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Username" />
          </div>

          <div className="relative mt-4">
            <i className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"> {/* Replace with your icon */}
              <Image src={lock} width={17} alt="lock-icon" />
              <i className="fa fa-lock"></i>
            </i>
            <input className="border-[1px] border-gray-300 pr-3.5 rounded-sm h-[51px] pl-10 w-[295px] placeholder-theme-med-gray text-theme-med-gray focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" />
          </div>
          {credentialsError && (
            <p className="text-red-500 text-sm mt-2">Invalid username or password. Please try again.</p>
          )}
          <button onClick={handleLogin} className="rounded-sm h-[51px] mt-5 bg-theme-blue text-white w-[295px]">Log in</button>
          <a href="https://focus-ga.my.site.com/s/login/ForgotPassword" className="mt-8 text-left w-[295px]">Forgot your password?</a>
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
          <div className="flex flex-col justify-center items-center w-[33%] ">
            <button onClick={() => {
              router.push("https://focus-ga.org/donate/");
            }} className="bg-theme-blue text-white w-[171px] h-[57px] rounded-sm">Donate</button>
            <p className="text-center mt-6">FOCUS (Families of Children Under Stress) is a 501(c)(3) nonprofit organization with tax ID&nbsp;
              <span className="whitespace-nowrap">#58-1577602</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}