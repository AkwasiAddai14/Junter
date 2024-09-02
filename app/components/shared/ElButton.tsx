import React from 'react';
import { useRouter } from 'next/navigation';

type ElButtonProps = {
    link: string;
    buttonText: string;
  };

const ElButton: React.FC<ElButtonProps> = ({ link, buttonText }) => {
    const router = useRouter();
  return (
    <button
    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
      onClick={() => router.push(link)} // Pass link as a string
    >
      {buttonText}
    </button>
  )
}

export default ElButton