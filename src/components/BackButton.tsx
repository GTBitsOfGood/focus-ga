import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BackButton({ overrideToHome = false }) {
  const router = useRouter();
  const [isExternalReferrer, setIsExternalReferrer] = useState(false);

  useEffect(() => {
    const referrer = document.referrer;
    const isExternal = !!referrer && !referrer.includes(window.location.hostname);
    setIsExternalReferrer(isExternal);
  }, []);

  return (
    <div
      onClick={() => {
        if (window.location.pathname === '/') {
          window.location.reload();
        }
        if (overrideToHome || isExternalReferrer) {
          router.push("/");
        } else {
          router.back();
        }
      }}
      className="flex items-center gap-1 w-min p-2 cursor-pointer select-none hidden sm:inline-flex"
    >
      <ChevronLeftIcon className="w-6 h-6" /> Back
    </div>
  );
}
