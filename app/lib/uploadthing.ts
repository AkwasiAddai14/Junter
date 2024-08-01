// Resource: https://docs.uploadthing.com/api-reference/react#generatereacthelpers
// Copy paste (be careful with imports)

import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@/pages/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();