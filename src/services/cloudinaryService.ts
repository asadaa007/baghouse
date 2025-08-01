// Cloudinary service for client-side file uploads
// Note: This uses unsigned uploads which are safer for client-side use

export interface UploadResult {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export const cloudinaryService = {
  // Upload file to Cloudinary using unsigned upload
  async uploadFile(file: File, folder: string = 'baghous'): Promise<UploadResult> {
    try {
      // Check if Cloudinary is configured
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing. Please check your environment variables.');
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        id: result.public_id,
        url: result.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error('Failed to upload file. Please check your Cloudinary configuration.');
    }
  },

  // Delete file from Cloudinary (requires server-side implementation)
  async deleteFile(publicId: string): Promise<void> {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      
      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary configuration missing for delete operation.');
      }

      // Note: This would require a server-side endpoint for security
      // For now, we'll just log the deletion request
      console.log(`Delete request for file: ${publicId}`);
      console.warn('File deletion requires server-side implementation for security.');
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  },

  // Get file info (requires server-side implementation)
  async getFileInfo(publicId: string): Promise<any> {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing.');
      }

      // For now, return basic info
      return {
        public_id: publicId,
        secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`,
      };
    } catch (error) {
      console.error('Error getting file info from Cloudinary:', error);
      throw new Error('Failed to get file info');
    }
  },

  // List files in folder (requires server-side implementation)
  async listFiles(): Promise<any[]> {
    try {
      console.warn('File listing requires server-side implementation for security.');
      return [];
    } catch (error) {
      console.error('Error listing files from Cloudinary:', error);
      throw new Error('Failed to list files');
    }
  }
}; 