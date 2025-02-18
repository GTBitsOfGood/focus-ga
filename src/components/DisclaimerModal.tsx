import React, { useEffect } from "react";
type DisclaimerProps = {
  isOpen: boolean;
  onAccept: () => void;
};

export default function Disclaimer(props: DisclaimerProps) {
  const { isOpen, onAccept } = props;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative z-50 flex max-h-[80vh] max-w-3xl flex-col rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 w-full">
          <div className="mb-4 flex justify-center">
            <div className="text-2xl font-bold text-black">Disclaimer</div>
          </div>
          <p className="text-base text-gray-500">
            Lorem ipsum dolor sit amet consectetur. A in eu ullamcorper
            consectetur. Diam sit dui leo turpis consectetur tempus. Erat
            laoreet pellentesque tincidunt netus. Convallis enim tincidunt
            gravida dui amet a lectus auctor aliquam. Senectus dui urna sit urna
            lacus eu tortor scelerisque at. Donec adipiscing semper tincidunt
            malesuada. Mauris aliquet etiam nisl eu sollicitudin scelerisque
            nulla elementum. Eleifend ipsum dui eget vulputate justo ullamcorper
            porttitor. Massa eros volutpat consectetur et ridiculus ac magna.
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              onAccept();
            }}
            className="text-bold inline-flex items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-12 py-2 text-white transition hover:opacity-90"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
