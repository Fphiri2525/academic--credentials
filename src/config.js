export const CONTRACTS = {
    userManagement: {
 
      address:"0xfD7a5AEA0b28bA53AddC6b5E2169380E252cBE3e",
       abi:[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "email",
          "type": "bytes32"
        }
      ],
      "name": "UserDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "email",
          "type": "bytes32"
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
          "indexed": true,
          "internalType": "bytes32",
          "name": "email",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "updateType",
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
          "name": "names",
          "type": "string[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "emails",
          "type": "bytes32[]"
        },
        {
          "internalType": "string[]",
          "name": "contactInfos",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "roles",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "institutions",
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
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "contactInfo",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "role",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "institution",
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
          "name": "names",
          "type": "string[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "emails",
          "type": "bytes32[]"
        },
        {
          "internalType": "string[]",
          "name": "contactInfos",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "roles",
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
          "name": "_currentPassword",
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
    }
  ]},
    accreditationManagement: {
        address:"0x1b6cAa7990F4b9F52F039dfBC3C03D653EFDAa35",
        abi: [
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
        address:"0x48a7133d6a0D92c782B399dDAaB3BD4E5228a2D5", 
        abi:[
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
      "name": "GraduateAdded",
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
          "internalType": "enum certificateManagement.VerificationStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "VerificationLogged",
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
      "name": "universityGraduates",
      "outputs": [
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
      "name": "verificationRequests",
      "outputs": [
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
          "name": "award",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dateVerified",
          "type": "string"
        },
        {
          "internalType": "enum certificateManagement.VerificationStatus",
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
          "internalType": "string",
          "name": "_universityName",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_studentNames",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "_programOfStudy",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_award",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_yearOfGraduation",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_registrationNumbers",
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
          "name": "_qrCode",
          "type": "string"
        }
      ],
      "name": "addVerificationRequestByQRCode",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
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
          "name": "_universityName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_programOfStudy",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_yearOfGraduation",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_registrationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_award",
          "type": "string"
        },
      ],
      "name": "addVerificationRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_regNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_award",
          "type": "string"
        }
      ],
      "name": "getStudentDetailsByRegNumberAndAward",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate",
          "name": "student",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
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
          "name": "_award",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_regNumber",
          "type": "string"
        }
      ],
      "name": "getQRCodeByAwardAndRegNumber",
      "outputs": [
        {
          "internalType": "string",
          "name": "qrCode",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
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
          "name": "_qrCode",
          "type": "string"
        }
      ],
      "name": "getStudentByQRCode",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate",
          "name": "student",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
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
      "name": "getTotalVerificationRequests",
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
      "name": "getTotalVerified",
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
      "name": "getTotalRejected",
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
          "name": "_universityName",
          "type": "string"
        }
      ],
      "name": "getAllStudentsByUniversity",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate[]",
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
          "name": "_universityName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_programOfStudy",
          "type": "string"
        }
      ],
      "name": "getStudentsByUniversityAndProgram",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate[]",
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
          "name": "_universityName",
          "type": "string"
        }
      ],
      "name": "getGraduatesByUniversity",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate[]",
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
          "internalType": "enum certificateManagement.VerificationStatus",
          "name": "_status",
          "type": "uint8"
        }
      ],
      "name": "getVerificationByStatus",
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
              "name": "award",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateVerified",
              "type": "string"
            },
            {
              "internalType": "enum certificateManagement.VerificationStatus",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct certificateManagement.VerificationRequest[]",
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
          "name": "_universityName",
          "type": "string"
        }
      ],
      "name": "getStudentDetailsByUniversity",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate[]",
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
          "name": "_universityName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_registrationNumber",
          "type": "string"
        }
      ],
      "name": "getStudentByUniversityAndReg",
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
              "name": "qrCode",
              "type": "string"
            }
          ],
          "internalType": "struct certificateManagement.UniversityGraduate",
          "name": "",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "found",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ],
},
  maneb:{
    address:"0x79690705102784E49be4F2000f5Acd6235023e4B",
    abi:[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "formHash",
          "type": "bytes32"
        }
      ],
      "name": "FormFourDetailsAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "schoolCode",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "district",
          "type": "string"
        }
      ],
      "name": "SecondarySchoolRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dateOfApproval",
          "type": "uint256"
        }
      ],
      "name": "VerificationApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
        }
      ],
      "name": "VerificationRequestAdded",
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
      "name": "allExamNumbers",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allSchoolKeys",
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
          "name": "",
          "type": "string"
        }
      ],
      "name": "schoolRecords",
      "outputs": [
        {
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "schoolCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "district",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "zone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "registered",
          "type": "bool"
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
          "name": "",
          "type": "string"
        }
      ],
      "name": "studentRecords",
      "outputs": [
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
        },
        {
          "internalType": "bytes32",
          "name": "formHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "totalSchools",
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
      "name": "totalStudents",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "verificationRequests",
      "outputs": [
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
        },
        {
          "internalType": "uint256",
          "name": "dateOfApproval",
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
          "name": "_studentNames",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "_examinationNumbers",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "_schoolName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "_yearOfExamination",
          "type": "uint16"
        }
      ],
      "name": "setFormFourDetailsBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_examNumber",
          "type": "string"
        }
      ],
      "name": "getFormFourDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "examinationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "schoolName",
              "type": "string"
            },
            {
              "internalType": "uint16",
              "name": "yearOfExamination",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "formHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Maneb.FormFourDetails",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_examNumber",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "_year",
          "type": "uint16"
        }
      ],
      "name": "getStudentDetailsWithoutHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
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
          "name": "_examNumber",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "_year",
          "type": "uint16"
        }
      ],
      "name": "getFormHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
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
          "internalType": "bytes32",
          "name": "_hash",
          "type": "bytes32"
        }
      ],
      "name": "getStudentDetailsByHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "examinationNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "schoolName",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "yearOfExamination",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllFormFourDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "examinationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "schoolName",
              "type": "string"
            },
            {
              "internalType": "uint16",
              "name": "yearOfExamination",
              "type": "uint16"
            },
            {
              "internalType": "bytes32",
              "name": "formHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Maneb.FormFourDetails[]",
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
          "internalType": "string[]",
          "name": "_schoolNames",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "_schoolCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_district",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_zone",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        }
      ],
      "name": "registerSecondarySchools",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllSecondarySchools",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "schoolName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "schoolCode",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "district",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "zone",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "category",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "registered",
              "type": "bool"
            }
          ],
          "internalType": "struct Maneb.SecondarySchool[]",
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
          "name": "_district",
          "type": "string"
        }
      ],
      "name": "getSchoolNamesByDistrict",
      "outputs": [
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
      "inputs": [],
      "name": "getTotalSecondarySchools",
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
          "internalType": "bytes32",
          "name": "_hash",
          "type": "bytes32"
        }
      ],
      "name": "addVerification",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "approveVerification",
      "outputs": [],
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
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "examinationNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "schoolName",
              "type": "string"
            },
            {
              "internalType": "uint16",
              "name": "yearOfExamination",
              "type": "uint16"
            },
            {
              "internalType": "uint256",
              "name": "dateOfApproval",
              "type": "uint256"
            }
          ],
          "internalType": "struct Maneb.VerificationRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ], }
}