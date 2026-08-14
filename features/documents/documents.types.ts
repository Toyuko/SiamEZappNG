export type ClientDocument = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  url?: string;
  downloadUrl?: string;
  fileUrl?: string;
};
