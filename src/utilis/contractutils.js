// src/utils/contractUtils.js
// Helper functions for working with smart contract data.
// Default export:  import contractUtils from '../utils/contractUtils';
//
// Exposes BOTH:
//   contractUtils.parseContractError(...)          (flat helpers)
//   contractUtils.general.formatErrorMessage(...)  (what useSmartContract.js expects)
//
// No external library is needed (wei/ether conversion uses BigInt),
// and there is no static import of web3service, so no circular import.

const WEI_DECIMALS = 18;
const WEI_PER_ETHER = 10n ** BigInt(WEI_DECIMALS);

const contractUtils = {
  // ---------------------------------------------------------------
  // Data helpers
  // ---------------------------------------------------------------

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
    if (/out of gas/i.test(msg)) return 'Out of gas. Try again with a higher gas limit.';
    if (/execution reverted|revert/i.test(msg)) return `Contract rejected the request: ${msg}`;
    if (/network|connection|fetch/i.test(msg)) return 'Network error. Please check your connection.';
    return msg;
  },

  // ---------------------------------------------------------------
  // `general` namespace: used by hooks/useSmartContract.js
  // ---------------------------------------------------------------
  general: {
    // Returns a string (the hook stores it in `error` state)
    formatErrorMessage(error) {
      return contractUtils.parseContractError(error);
    },

    isValidAddress(address) {
      return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    // wei (string | number | bigint) -> ether (string), e.g. "1.5"
    weiToEther(wei) {
      try {
        if (wei === undefined || wei === null || wei === '') return '0';
        let value = BigInt(wei.toString());
        const negative = value < 0n;
        if (negative) value = -value;

        const whole = value / WEI_PER_ETHER;
        const fraction = (value % WEI_PER_ETHER)
          .toString()
          .padStart(WEI_DECIMALS, '0')
          .replace(/0+$/, '');

        const result = fraction ? `${whole}.${fraction}` : `${whole}`;
        return negative ? `-${result}` : result;
      } catch {
        return '0';
      }
    },

    // ether (string | number) -> wei (string)
    etherToWei(ether) {
      try {
        if (ether === undefined || ether === null || ether === '') return '0';
        let str = ether.toString().trim();
        const negative = str.startsWith('-');
        if (negative) str = str.slice(1);

        const [wholePart = '0', fracPart = ''] = str.split('.');
        const fraction = fracPart.padEnd(WEI_DECIMALS, '0').slice(0, WEI_DECIMALS);
        const wei = BigInt(wholePart || '0') * WEI_PER_ETHER + BigInt(fraction || '0');

        return (negative ? -wei : wei).toString();
      } catch {
        return '0';
      }
    },

    // Reports which contracts respond. Uses a dynamic import so this file
    // never creates a circular dependency with web3service.js.
    async checkAllContracts() {
      const checks = {
        userManagement: 'getAllUserDetails',
        accreditationManagement: 'getTotalAccreditedUniversities',
        certificateManagement: 'getTotalGraduates',
        maneb: 'getTotalSecondarySchools',
      };

      let callContract;
      try {
        ({ callContract } = await import('../web3service'));
      } catch {
        return {};
      }

      const status = {};
      for (const [name, method] of Object.entries(checks)) {
        try {
          await callContract(name, method, []);
          status[name] = 'connected';
        } catch {
          status[name] = 'error';
        }
      }
      return status;
    },
  },
};

export default contractUtils;