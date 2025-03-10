import ErrorPageButtons from "@/components/ErrorPageButtons";
import Image from 'next/image';
import focusLogo from "../../public/focus-logo.png";
import { FOCUS_FONT } from "@/utils/styles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "Community page for families who are registered under FOCUS",
};

export default async function NotFound() {
  return (
    <html lang="en">
      <body className={FOCUS_FONT.className}>
        <div className="bg-[url('/Portal_Background.avif')] bg-cover bg-no-repeat h-screen w-screen">
          <a href="https://focus-ga.org/"><Image src={focusLogo} width={181} height={87} alt="focus-logo" className="mt-6 ml-14 fixed" /></a>
          <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-8xl	text-center text-opacity-80 font-extrabold">404</h1>
            <p className="text-center text-3xl font-bold">Page not found</p>
            <p className="text-2xl text-center mt-8 font-normal">Sorry, the page you are looking for doesn&apos;t exist. If you think something is broken, report a problem to administration.</p>
            <ErrorPageButtons />
          </div>
        </div>
      </body>
    </html>
  )
}