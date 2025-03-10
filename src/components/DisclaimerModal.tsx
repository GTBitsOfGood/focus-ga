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
        <div className="mb-4 w-full">
          <div className="mb-4 flex justify-center">
            <div className="text-2xl font-bold text-black">Disclaimer:</div>
          </div>
          <p className="text-lg text-gray-600 text-center">
          <p><strong>    Welcome to the FOCUS Community Page!</strong> <br />This forum is designed to allow FOCUS families to share ideas, resources, 
                and questions with one another. Families are encouraged to make posts, 
                comment, and share anything related to their current journey.


                We kindly ask that you keep discussions civil and treat other FOCUS families 
                with respect. Since the Community Page is an open forum, <u>FOCUS does not 
                condone harmful or inappropriate content</u>. 
                Any such posts can be reported, and the admin may take necessary action.
                Thank you for your understanding.
            </p>
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
