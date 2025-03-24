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
      <div className="relative z-50 flex sm:max-h-[80vh] max-w-3xl flex-col rounded-lg bg-white p-8 shadow-lg">
      <div className="p-4 w-full space-y-4 text-center">
  <h2 className="text-2xl font-bold text-gray-800">
    Welcome to the FOCUS Community Page!
  </h2>

  <p className="text-lg text-gray-600">
    This forum is designed to allow FOCUS families to share ideas, resources, 
    and questions. Families are encouraged to make posts, 
    comment, and share anything related to their journey.
    We kindly ask that you keep discussions civil and treat other FOCUS families 
    with respect. FOCUS does not condone harmful or inappropriate content; any 
    such posts can be reported, and the admin may take necessary action.
  </p>

  <p className="text-lg text-gray-600">
    Thank you for your understanding.
  </p>
</div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              onAccept();
            }}
            className="text-bold inline-flex items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-8 py-2 text-white transition hover:opacity-90"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
