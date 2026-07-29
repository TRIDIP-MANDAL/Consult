import { useState } from 'react';
import { callApi } from '../config/api.ts';

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1.Get Presigned URL
      const response = await callApi<{ url: string, fileKey: string }>('/image/upload-url', 'POST', {
          fileName: file.name,
          contentType: file.type,
      });
      
      const { url, fileKey } = response;
      // 2. upload the image
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        // Here you would typically save the fileKey in the DB along with the user profile
        alert(`Upload successful! File Key: ${fileKey}`);
      } else {
        throw new Error('Failed to upload to R2');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}