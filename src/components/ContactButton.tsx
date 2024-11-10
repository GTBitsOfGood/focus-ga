import { Mail } from "lucide-react";
import { useState } from "react";

export default function ContactButton() {
  const [hovered, setHovered] = useState(false);
  
  return (
    <a 
      href="https://focus-ga.org/contact-us/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-block fixed left-8 bottom-8"
    >
      <button
        className={`overflow-hidden h-12 transition-all duration-300 pl-2 ease-in-out border-2 border-theme-blue bg-white text-theme-blue text-lg p-2 whitespace-nowrap 
                    ${hovered ? 'w-40 rounded-full opacity-90' : 'w-12 rounded-full opacity-100'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? 'Contact FOCUS' : <Mail className="w-6 h-6 my-auto ml-[2px]" color="#475CC6" />}
      </button>
    </a>
  );
}