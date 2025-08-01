import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export const cloudinaryService = {
  // Upload file to Cloudinary
  async uploadFile(file: File, folder: string = 'baghous'): Promise<UploadResult> {
    try {
      // Convert file to base64
      const base64File = await this.fileToBase64(file);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64File, {
        folder: folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });

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
      throw new Error('Failed to upload file');
    }
  },

  // Convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  },

  // Delete file from Cloudinary
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  },

  // Get file info
  async getFileInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Error getting file info from Cloudinary:', error);
      throw new Error('Failed to get file info');
    }
  },

  // List files in folder
  async listFiles(folder: string = 'baghous'): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 100,
      });
      return result.resources;
    } catch (error) {
      console.error('Error listing files from Cloudinary:', error);
      throw new Error('Failed to list files');
    }
  }
}; 