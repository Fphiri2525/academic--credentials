export const CONTRACTS = {
    userManagement: {
 
      address:"0xee783a364d961B02EeE8C9Ce18F3f7D0d9180075",
       abi:[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "UserDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "role",
          "type": "string"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "UserUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contactInfo",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_role",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_institution",
          "type": "string"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        }
      ],
      "name": "signIn",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllUserDetails",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        },
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        }
      ],
      "name": "getUserDetails",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getUserCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_institution",
          "type": "string"
        }
      ],
      "name": "getUsersByInstitution",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        },
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        }
      ],
      "name": "getUserInstitution",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        }
      ],
      "name": "deleteUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newPassword",
          "type": "string"
        }
      ],
      "name": "updateUserPassword",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_currentEmail",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newEmail",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newName",
          "type": "string"
        }
      ],
      "name": "updateUserEmailAndName",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newPassword",
          "type": "string"
        }
      ],
      "name": "changeUserPasswordByEmail",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ], 
},
    accreditationManagement: {
        address:"0xaE35E527CE8D461C1ddb0D7167a2Ed30F034e50e",
        abi:[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "institutionName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "programName",
          "type": "string"
        }
      ],
      "name": "ProgramAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "institutionName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "programName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum AccreditationManagement.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "ProgramStatusUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "institutionName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "programName",
          "type": "string"
        }
      ],
      "name": "ProgramUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "category",
          "type": "string"
        }
      ],
      "name": "UniversityAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum AccreditationManagement.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "UniversityStatusUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "category",
          "type": "string"
        }
      ],
      "name": "UniversityUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "accreditedUniversities",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "contactInfo",
          "type": "string"
        },
        {
          "internalType": "enum AccreditationManagement.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "authorizedInstitutions",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "programs",
      "outputs": [
        {
          "internalType": "string",
          "name": "institutionName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "programName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "programType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "accreditationDate",
          "type": "string"
        },
        {
          "internalType": "enum AccreditationManagement.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_institution",
          "type": "address"
        }
      ],
      "name": "addAuthorizedInstitution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_institution",
          "type": "address"
        }
      ],
      "name": "removeAuthorizedInstitution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_institutionName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_programName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_programType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_accreditationDate",
          "type": "string"
        }
      ],
      "name": "addProgram",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_institutionName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_programName",
          "type": "string"
        },
        {
          "internalType": "enum AccreditationManagement.Status",
          "name": "_status",
          "type": "uint8"
        }
      ],
      "name": "updateProgramStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_institutionName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_currentProgramName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newProgramName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newProgramType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newAccreditationDate",
          "type": "string"
        }
      ],
      "name": "updateProgram",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_universityName",
          "type": "string"
        }
      ],
      "name": "getProgramsByUniversity",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "institutionName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programType",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "accreditationDate",
              "type": "string"
            },
            {
              "internalType": "enum AccreditationManagement.Status",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct AccreditationManagement.Program[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contactInfo",
          "type": "string"
        }
      ],
      "name": "addAccreditedUniversity",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "enum AccreditationManagement.Status",
          "name": "_status",
          "type": "uint8"
        }
      ],
      "name": "updateUniversityStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllAccreditedUniversities",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "category",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "contactInfo",
              "type": "string"
            },
            {
              "internalType": "enum AccreditationManagement.Status",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct AccreditationManagement.AccreditedUniversity[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contactInfo",
          "type": "string"
        }
      ],
      "name": "editAccreditedUniversity",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalAccreditedUniversities",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalActiveAccreditedUniversities",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ],}, 
    certificateManagement: {
        address:"0x6be5E4cAe71895605755eCa2b20Cb705cAd82D10", 
        abi:[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum CertificateManagement.CertStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "CertificateStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum CertificateManagement.CheckResult",
          "name": "result",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "checkedAt",
          "type": "uint256"
        }
      ],
      "name": "EmployerCheckLogged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "applicationId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum CertificateManagement.ApplicationStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "ForeignApplicationStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "applicationId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "applicantName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "country",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "award",
          "type": "string"
        }
      ],
      "name": "ForeignApplicationSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "award",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "dateGenerated",
          "type": "string"
        }
      ],
      "name": "QRCodeGenerated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "onChainHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "databaseHash",
          "type": "bytes32"
        }
      ],
      "name": "TamperDetected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        }
      ],
      "name": "TamperResolved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "programOfStudy",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "award",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "yearOfGraduation",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        }
      ],
      "name": "UniversityGraduateAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "programOfStudy",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "award",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "yearOfGraduation",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "dateVerified",
          "type": "string"
        }
      ],
      "name": "VerificationRequestLogged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        }
      ],
      "name": "ViewQRCodeAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "authorized",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "lastIntegrityCheckAt",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "recordsChecked",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "revokedCerts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "suspendedCerts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "tamperAlerts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "allowed",
          "type": "bool"
        }
      ],
      "name": "setAuthorized",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "programOfStudy",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "award",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "yearOfGraduation",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "registrationNumbers",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "studentNames",
          "type": "string[]"
        }
      ],
      "name": "addUniversityGraduates",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "programOfStudy",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "award",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "yearOfGraduation",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        }
      ],
      "name": "addForeignVerification",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "award",
          "type": "string"
        }
      ],
      "name": "getStudentByAwardAndRegNumber",
      "outputs": [
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.UniversityGraduate",
          "name": "grad",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "award",
          "type": "string"
        }
      ],
      "name": "getQRCodeByRegNumberAndAward",
      "outputs": [
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "name": "getStudentByQRCode",
      "outputs": [
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.UniversityGraduate",
          "name": "student",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "name": "verifyByQRCode",
      "outputs": [
        {
          "internalType": "bool",
          "name": "matched",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "name": "addVerificationByQRCode",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVerificationRequests",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateVerified",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.VerificationRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        }
      ],
      "name": "getGraduatesByUniversityName",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.GraduateView[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        }
      ],
      "name": "getVerifiedStudentsByUniversity",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateVerified",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.VerificationRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        }
      ],
      "name": "searchVerificationByUniversityName",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "universityName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "programOfStudy",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "yearOfGraduation",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateVerified",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.VerificationRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "universityName",
          "type": "string"
        }
      ],
      "name": "getTotalGraduatesByUniversityName",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalGraduates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalVerificationCertificates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "qrCodeValue",
          "type": "string"
        }
      ],
      "name": "addQRCodeToStruct",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalQRCodesGenerated",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        }
      ],
      "name": "addViewQRCodeDetails",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "getQRCodeByEmail",
      "outputs": [
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllViewQRCodes",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct CertificateManagement.ViewQRCode[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalViewQRCodes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "internalType": "enum CertificateManagement.CertStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "setCertificateStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCertificateStatusCounts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "valid",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "suspended",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "revoked",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalCertificatesIssued",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "year",
          "type": "string"
        }
      ],
      "name": "getCertificatesIssuedByYear",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "yearList",
          "type": "string[]"
        }
      ],
      "name": "getCertificatesIssuedForYears",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "counts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        }
      ],
      "name": "getOnChainRecordHash",
      "outputs": [
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        },
        {
          "internalType": "bytes32",
          "name": "recordHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        },
        {
          "internalType": "bytes32",
          "name": "databaseHash",
          "type": "bytes32"
        }
      ],
      "name": "checkRecordIntegrity",
      "outputs": [
        {
          "internalType": "bool",
          "name": "matches",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "completeIntegrityRun",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        }
      ],
      "name": "resolveTamper",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getIntegritySummary",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "checked",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "mismatches",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastCheckAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "applicantName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "country",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "award",
          "type": "string"
        }
      ],
      "name": "submitForeignApplication",
      "outputs": [
        {
          "internalType": "string",
          "name": "applicationId",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "enum CertificateManagement.ApplicationStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "updateForeignApplicationStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalForeignApplications",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalOpenForeignApplications",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getOpenForeignApplications",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "applicationId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "applicantName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "country",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "enum CertificateManagement.ApplicationStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "submittedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct CertificateManagement.ForeignApplication[]",
          "name": "result",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "registrationNumber",
          "type": "string"
        }
      ],
      "name": "logEmployerCheck",
      "outputs": [
        {
          "internalType": "enum CertificateManagement.CheckResult",
          "name": "result",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEmployerChecksToday",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getLatestEmployerChecks",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "registrationNumber",
              "type": "string"
            },
            {
              "internalType": "enum CertificateManagement.CheckResult",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "checkedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct CertificateManagement.EmployerCheck[]",
          "name": "result",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTotalEmployerChecks",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ],}}