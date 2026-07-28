// Web Crypto API - AES-GCM 256-bit Client-Side Encryption & Decryption Utility

const DEFAULT_PASSPHRASE = 'GratzisChatBot_SecureCloudKey_2026';

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getEncryptionKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase || DEFAULT_PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const cryptoService = {
  // Encrypt JSON object -> Encrypted Backup Container
  encryptData: async (data, passphrase = DEFAULT_PASSPHRASE) => {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(text);

      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const key = await getEncryptionKey(passphrase, salt);
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );

      return {
        app: 'GratzisChatBot',
        encrypted: true,
        algorithm: 'AES-GCM-256',
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
        ciphertext: bufferToBase64(ciphertext),
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('Encryption failed:', e);
      throw new Error('Failed to encrypt backup data.');
    }
  },

  // Decrypt Encrypted Backup Container -> Original JSON / Data
  decryptData: async (payload, passphrase = DEFAULT_PASSPHRASE) => {
    try {
      if (!payload || !payload.encrypted || !payload.ciphertext) {
        throw new Error('Not an encrypted payload');
      }

      const salt = new Uint8Array(base64ToBuffer(payload.salt));
      const iv = new Uint8Array(base64ToBuffer(payload.iv));
      const ciphertext = base64ToBuffer(payload.ciphertext);

      const key = await getEncryptionKey(passphrase, salt);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedText);
    } catch (e) {
      console.error('Decryption failed:', e);
      throw new Error('Decryption failed. Invalid passphrase or corrupted backup file.');
    }
  }
};
