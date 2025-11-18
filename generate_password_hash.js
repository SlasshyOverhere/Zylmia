const crypto = require('crypto-js');

// Get password from command line arguments
const password = process.argv[2];

if (!password) {
  console.log('Usage: node generate_password_hash.js <your_password>');
  console.log('This will generate a SHA256 hash for your password to use in the .env file.');
  process.exit(1);
}

const hash = crypto.SHA256(password).toString();
console.log(`Password: ${password}`);
console.log(`SHA256 Hash: ${hash}`);
console.log('');
console.log('Add this to your .env file:');
console.log(`REACT_APP_PASSWORD_HASH=${hash}`);