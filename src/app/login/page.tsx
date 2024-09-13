"use client";

import Image from 'next/image';
import focusLogo from "../../../public/focus-logo.png";
import transparencyBadge from "../../../public/transparency-badge.png";

export default function Login() {
    return (
        <div className="bg-[url('/Portal_Background.avif')] bg-cover bg-no-repeat h-screen w-screen">
            <a href="https://focus-ga.org/"><Image src={focusLogo} width={181} height={87} alt="focus-logo" className="mt-6	ml-[60px] fixed" /></a>
            <div className="flex flex-col justify-center items-center">
                <div className="mx-[24vw] flex flex-col justify-center items-center">
                    <Image src={focusLogo} width={295} height={145} alt="focus-logo" />
                    <input className="border-[1px] border-gray-300 rounded-sm mt-3 h-14 w-[295px]" type="text" placeholder="Username" />
                    <input className="border-[1px] border-gray-300 rounded-sm h-14 mt-4 w-[295px]" type="text" placeholder="Password" />
                    <button className="rounded-sm h-14 mt-5 bg-blue text-white w-[295px]">Log in</button>
                    <a href="https://focus-ga.my.site.com/s/login/ForgotPassword" className="mt-8 text-left w-[295px]">Forgot your password?</a>
                </div>
                <div className="flex flex-row justify-between mx-[15vw] mt-12">
                    <div>
                        <p>770-234-9111 (phone)</p>
                        <p>770-234-9131 (fax)</p>
                        <p className="mt-2">3825 Presidential Parkway</p>
                        <p>Suite 103</p>
                        <p>Atlanta, GA 30340</p>
                        <p className="mt-2">inquiry@focus-ga.org</p>
                    </div>
                    <div className="w-[85px] h-[85-px]">
                        <Image src={transparencyBadge} width={85} height={85} alt="transparency-badge" />
                    </div>
                    <div className="flex flex-col justify-center items-center w-[38%]">
                        <button className="bg-blue text-white w-[171px] h-[57px] rounded-sm">Donate</button>
                        <p className="text-center mt-6">FOCUS (Families of Children Under Stress) is a 501(c)(3) nonprofit organization with tax ID&nbsp;
                            <span className="whitespace-nowrap">#58-1577602</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}