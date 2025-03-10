import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProfanityModalProps {
  flaggedWords: string[];
  onCancel: () => void;
  onSubmitReview: () => void;
  isOpen: boolean;
}

/**
 * ProfanityModal Component (Tailwind CSS)
 *
 * Displays a modal informing the user that profanity or disallowed words have
 * been detected. Shows the list of flagged words, and provides two actions:
 * "Cancel & Edit Post" and "Submit for Review."
 */
const ProfanityModal: React.FC<ProfanityModalProps> = ({
  flaggedWords,
  onCancel,
  onSubmitReview,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-md bg-white p-10 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Profanity Detected</h2>
        <div className="px-2">
          <div className="flex justify-center mb-6">
            <AlertTriangle size={64} className="text-red-500" />
          </div>

          <p className="mb-2 ">
            Your post contains words that violate our community guidelines. Please review the 
            flagged words below and either remove them or submit your post for admin review.
          </p>

          <p className="font-bold">
            Flagged Words:
          </p>

          <ul className="mb-4 list-disc pl-6">
            {flaggedWords.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>

          <p className="mb-10">
            You can edit your post and remove these words to publish it immediately.
            If you believe this is a mistake, you can submit the post for admin
            review.
          </p>
        </div>
        

        <div className="flex justify-end space-x-4">
          <button
            className="rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400 px-4"
            onClick={onCancel}
          >
            Cancel &amp; Edit Post
          </button>
          <button
            className="rounded-md bg-theme-blue px-4 py-2 text-white transition hover:opacity-90 font-bold"
            onClick={onSubmitReview}
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfanityModal;
