// src/utils/contractUtils.js
// Helper functions for working with smart contract data.
// Default export, so it works with: import contractUtils from '../utils/contractUtils';

const contractUtils = {
  // Convert BigInt / string / number / undefined to a plain number
  toNumber(value, fallback = 0) {
    try {
      if (value === undefined || value === null) return fallback;
      const n = Number(typeof value === 'bigint' ? value.toString() : value);
      return Number.isNaN(n) ? fallback : n;
    } catch {
      return fallback;
    }
  },

  // Make sure a value is an array
  toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return Array.from(value);
  },

  // Convert a blockchain timestamp (seconds) to a readable date
  formatTimestamp(timestamp) {
    const n = contractUtils.toNumber(timestamp, 0);
    if (!n) return 'N/A';
    return new Date(n * 1000).toLocaleString();
  },

  // Shorten a wallet address: 0x1234...abcd
  formatAddress(address) {
    if (!address || address.length < 10) return address || '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Normalize an accredited university returned from the contract
  normalizeUniversity(raw) {
    if (!raw) return null;
    return {
      name: raw.name || raw[0] || '',
      category: raw.category || raw[1] || '',
      contactInfo: raw.contactInfo || raw[2] || '',
    };
  },

  // Normalize a program (string or struct)
  normalizeProgram(raw) {
    if (!raw) return null;
    if (typeof raw === 'string') return { name: raw };
    return { name: raw.name || raw.programName || raw[0] || '' };
  },

  // Normalize a graduate record
  normalizeGraduate(raw) {
    if (!raw) return null;
    return {
      universityName: raw.universityName || raw[0] || '',
      studentName: raw.studentName || raw[1] || '',
      programOfStudy: raw.programOfStudy || raw[2] || '',
      award: raw.award || raw[3] || '',
      yearOfGraduation: String(raw.yearOfGraduation || raw[4] || ''),
      registrationNumber: raw.registrationNumber || raw[5] || '',
    };
  },

  // Normalize a verification request record
  normalizeVerification(raw, index = 0) {
    if (!raw) return null;
    return {
      id: index,
      ...contractUtils.normalizeGraduate(raw),
      dateVerified: raw.dateVerified || raw[6] || '',
    };
  },

  // Turn a blockchain error into a user-friendly message
  parseContractError(error) {
    const msg =
      error?.reason ||
      error?.shortMessage ||
      error?.data?.message ||
      error?.message ||
      'Unknown error';

    if (/user rejected|user denied/i.test(msg)) return 'Transaction was rejected by the user.';
    if (/insufficient funds/i.test(msg)) return 'Insufficient funds to complete the transaction.';
    if (/network|connection|fetch/i.test(msg)) return 'Network error. Please check your connection.';
    if (/execution reverted/i.test(msg)) return `Contract rejected the request: ${msg}`;
    return msg;
  },
};

export default contractUtils;