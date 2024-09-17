import { useRouter } from 'next/navigation';

export default function ErrorPageButtons() {
  const router = useRouter();

  return (
  <div className="flex flex-row justify-center space-x-16 mt-16">
    <button onClick={() => {
      router.push("/");
    }} className="bg-blue text-white py-4 w-44	rounded-sm text-xl font-lato">
      Return Home
    </button>
    <button onClick={() => {
      router.push("https://focus-ga.org/contact-us/");
    }} className="bg-white text-blue border-blue text-xl border-2 py-4 w-44 rounded-sm font-lato">
      Contact Us
    </button>
  </div>
  );
}