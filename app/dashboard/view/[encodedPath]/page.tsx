// app/dashboard/view/[encodedPath]/page.tsx
import { redirect } from 'next/navigation';
import { decodePath } from '@/app/lib/utils';

export default function EncodedPathPage({ params }: { params: { encodedPath: string } }) {

  const cleanString = (str: string): string => {
        return str.replace(/[\r\n]+/g, ''); // Remove carriage returns and newlines
      };

  const { encodedPath } = params;
  const originalPath = decodePath(encodedPath);
  console.log('Encoded Path:', encodedPath);
  console.log('Decoded Path:', decodePath(encodedPath));


  if (!originalPath || originalPath.includes('%')) {
    console.error('Invalid or broken link');
    return <div>Invalid or broken link</div>;
  }

  // Safe redirect
  redirect(encodeURI(originalPath));
  return null;
}
