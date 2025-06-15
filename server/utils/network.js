import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const getCurrentIP = async () => {
  try {
    // Get public IP address using PowerShell command for Windows
    const { stdout } = await execAsync('powershell -Command "(Invoke-WebRequest -Uri \'https://api.ipify.org\' -UseBasicParsing).Content"');
    return stdout.trim();
  } catch (error) {
    console.error('Error getting IP address:', error.message);
    return null;
  }
};

export const displayNetworkInfo = async () => {
  try {
    const publicIP = await getCurrentIP();
    if (publicIP) {
      console.log(`\n🌐 Your current public IP address: ${publicIP}`);
      console.log('📝 Add this IP to your MongoDB Atlas whitelist\n');
    }
  } catch (error) {
    console.log('ℹ️  Could not determine public IP address');
  }
};
