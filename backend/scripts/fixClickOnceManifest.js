/**
 * Script to help diagnose and potentially fix ClickOnce manifest issues
 * 
 * The "DTD is prohibited" error occurs when .NET Framework's XML parser
 * encounters certain XML constructs that it considers unsafe.
 * 
 * Solutions:
 * 1. Re-publish the ClickOnce application with proper settings in Visual Studio
 * 2. Ensure the Publishing URL matches your deployment URL
 * 3. Sign the manifests with a certificate
 * 
 * To fix this properly, you need to:
 * 
 * In Visual Studio:
 * 1. Right-click your project → Properties → Publish
 * 2. Set "Publishing Folder Location" to match your server path
 * 3. Set "Installation Folder URL" to: https://www.shorthandexam.in/storage/publish/
 * 4. Under "Application Files" button, ensure all files are included
 * 5. Under "Prerequisites" button, configure .NET Framework requirements
 * 6. Click "Publish Now"
 * 
 * Alternative: Use HTTP instead of HTTPS for ClickOnce (not recommended for production)
 * Or: Sign your manifests with a code signing certificate
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../storage/publish/ShorthandBasic_v1.0.application');

console.log('ClickOnce Manifest Diagnostic Tool');
console.log('===================================\n');

if (fs.existsSync(manifestPath)) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  console.log('Manifest file found at:', manifestPath);
  console.log('\nCurrent manifest content (first 500 chars):');
  console.log(content.substring(0, 500));
  console.log('\n...\n');
  
  // Check for common issues
  if (content.includes('xsi:schemaLocation')) {
    console.log('⚠️  Found xsi:schemaLocation - this can cause DTD errors');
  }
  
  if (content.includes('<!DOCTYPE')) {
    console.log('⚠️  Found DOCTYPE declaration - this will cause DTD errors');
  }
  
  console.log('\n📋 Recommended Actions:');
  console.log('1. Re-publish from Visual Studio with Installation URL: https://www.shorthandexam.in/storage/publish/');
  console.log('2. Or use the setup.exe file instead of the .application file');
  console.log('3. Or sign the manifests with a code signing certificate');
  console.log('\n💡 Quick Fix: Direct users to use setup.exe instead:');
  console.log('   https://www.shorthandexam.in/storage/publish/setup.exe');
  
} else {
  console.log('❌ Manifest file not found at:', manifestPath);
}
