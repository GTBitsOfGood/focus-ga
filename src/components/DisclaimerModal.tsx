import React from 'react';

type DisclaimerProps = {
  isOpen: boolean;
  onAccept: () => void;
};

export default function Disclaimer(props: DisclaimerProps) {
const {
    isOpen,
    onAccept,
} = props;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative z-50 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white p-11 shadow-lg">
      <div className="mb-2 flex items-center justify-center">
        <div className="text-xl font-bold text-black">Disclaimer</div>
      </div>
        <p className="mb-4">
        Lorem ipsum dolor sit amet consectetur. A in eu ullamcorper consectetur. Diam sit dui leo turpis consectetur tempus. Erat laoreet pellentesque tincidunt netus. Convallis enim tincidunt gravida dui amet a lectus auctor aliquam. Senectus dui urna sit urna lacus eu tortor scelerisque at. Donec adipiscing semper tincidunt malesuada. Mauris aliquet etiam nisl eu sollicitudin scelerisque nulla elementum. Eleifend ipsum dui eget vulputate justo ullamcorper porttitor. Massa eros volutpat consectetur et ridiculus ac magna.
        </p>
        <button
          onClick={onAccept}
          className="inline-flex text-white items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-6 py-2 transition hover:bg-blue-900 w-auto">
          I agree
        </button>
      </div>
    </div>
  );
}
