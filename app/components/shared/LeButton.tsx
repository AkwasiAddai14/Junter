import React from 'react';
import { useRouter } from 'next/navigation';

type LeButtonProps = {
  link: string;
  buttonText: string;
};

const LeButton: React.FC<LeButtonProps> = ({ link, buttonText }) => {
  const router = useRouter();

  return (
    <button
      className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 focus:opacity-100 group-hover:opacity-100"
      onClick={() => router.push(link)} // Pass link as a string
    >
      {buttonText}
    </button>
  );
};

export default LeButton;