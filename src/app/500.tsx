"use client";

import ErrorPageButtons from "@/components/ErrorPageButtons";
import Image from 'next/image';
import focusLogo from "../../public/focus-logo.png";

export default function NotFound() {
  return (
    <div className="bg-[url('/Portal_Background.avif')] bg-cover bg-no-repeat h-screen w-screen">
      <a href="https://focus-ga.org/"><Image src={focusLogo} width={181} height={87} alt="focus-logo" className="mt-6	ml-[60px] fixed" /></a>
      <div className="mx-[24vw] flex flex-col justify-center items-center h-screen">
        <h1 className="text-8xl	text-center text-opacity-80 font-extrabold">500</h1>
        <p className="text-center text-3xl font-bold">Internal Server Error</p>
        <p className="text-2xl text-center mt-8 font-normal">Our fault! We are having a problem with our system. In the meantime, you can try refreshing the page.</p>
        <ErrorPageButtons />
      </div>
    </div>
  )
}