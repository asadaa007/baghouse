/**
 * Utility script to fix existing projects that don't have slugs
 * Run this script once to add slugs to all existing projects
 */

import { projectService } from '../services/projectService';

export const fixAllProjectSlugs = async (): Promise<void> => {
  try {
    console.log('🔧 Starting to fix project slugs...');
    await projectService.fixProjectSlugs();
    console.log('✅ All project slugs have been fixed!');
  } catch (error) {
    console.error('❌ Error fixing project slugs:', error);
    throw error;
  }
};

// If running this script directly
if (typeof window === 'undefined') {
  fixAllProjectSlugs()
    .then(() => {
      console.log('🎉 Project slug fixing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Project slug fixing failed:', error);
      process.exit(1);
    });
}
