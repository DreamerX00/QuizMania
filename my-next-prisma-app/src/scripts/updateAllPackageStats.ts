import { updateAllPackageStats } from '@/services/updatePackageStats';

/**
 * Script to update all package stats
 * Run this after the migration to populate real-time stats for existing packages
 */
async function main() {
  console.log('Starting package stats update...');
  
  try {
    await updateAllPackageStats();
    console.log('✅ All package stats updated successfully!');
  } catch (error) {
    console.error('❌ Error updating package stats:', error);
    process.exit(1);
  }
}

// Run the script
main(); 