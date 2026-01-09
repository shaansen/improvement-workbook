// Encryption utilities using Web Crypto API

const CryptoUtils = {
    // Convert string to ArrayBuffer
    str2ab(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    },

    // Convert ArrayBuffer to string
    ab2str(buffer) {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    },

    // Convert ArrayBuffer to Base64
    ab2base64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    // Convert Base64 to ArrayBuffer
    base642ab(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    },

    // Derive key from PIN using PBKDF2
    async deriveKey(pin, salt) {
        const pinBuffer = this.str2ab(pin);

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            pinBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // Generate a random salt
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    },

    // Generate a random IV
    generateIV() {
        return crypto.getRandomValues(new Uint8Array(12));
    },

    // Encrypt data
    async encrypt(data, pin) {
        const salt = this.generateSalt();
        const iv = this.generateIV();
        const key = await this.deriveKey(pin, salt);

        const dataString = JSON.stringify(data);
        const dataBuffer = this.str2ab(dataString);

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataBuffer
        );

        return {
            salt: this.ab2base64(salt),
            iv: this.ab2base64(iv),
            data: this.ab2base64(encryptedBuffer)
        };
    },

    // Decrypt data
    async decrypt(encryptedObj, pin) {
        try {
            const salt = this.base642ab(encryptedObj.salt);
            const iv = this.base642ab(encryptedObj.iv);
            const encryptedData = this.base642ab(encryptedObj.data);

            const key = await this.deriveKey(pin, new Uint8Array(salt));

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                key,
                encryptedData
            );

            const decryptedString = this.ab2str(decryptedBuffer);
            return JSON.parse(decryptedString);
        } catch (e) {
            console.error('Decryption failed:', e);
            return null;
        }
    },

    // Hash PIN for verification (stored separately)
    async hashPin(pin) {
        const salt = this.generateSalt();
        const pinBuffer = this.str2ab(pin);

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            pinBuffer,
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );

        return {
            hash: this.ab2base64(hashBuffer),
            salt: this.ab2base64(salt)
        };
    },

    // Verify PIN against stored hash
    async verifyPin(pin, storedHash) {
        const salt = this.base642ab(storedHash.salt);
        const pinBuffer = this.str2ab(pin);

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            pinBuffer,
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: new Uint8Array(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );

        const computedHash = this.ab2base64(hashBuffer);
        return computedHash === storedHash.hash;
    }
};

// Make available globally
window.CryptoUtils = CryptoUtils;
