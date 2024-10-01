import Link from "next/link";

export default function ErrorPageButtons() {
  return (
    <div className="flex flex-row justify-center space-x-16 mt-16">
      <Link href="/" className="bg-blue text-white py-4 w-44 rounded-sm text-xl font-lato hover:opacity-90 transition-colors flex items-center justify-center">
        Return Home
      </Link>
      <Link href="https://focus-ga.org/contact-us/" className="bg-white text-blue border-blue text-xl border-2 py-4 w-44 rounded-sm font-lato hover:bg-gray-100 transition-colors flex items-center justify-center">
        Contact Us
      </Link>
    </div>
  );
}