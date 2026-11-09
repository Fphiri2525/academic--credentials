
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./Graduate.module.css";

import {
  useAccreditationManagement,
  useCertificateManagement,
  useConnectionStatus,
  useUserManagement
} from "../hooks/useSmartContract";

import CertificateGenerator from "../Components/CertificateGenerator";

function Graduate({ darkMode }) {
  const [graduates, setGraduates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExcelReady, setIsExcelReady] = useState(false);
  const [pendingGraduates, setPendingGraduates] = useState([]);

  const [award, setAward] = useState("Diploma");
  const [programOfStudy, setProgramOfStudy] = useState("");
  const [programOptions, setProgramOptions] = useState([]);
  const [yearOfGraduation, setYearOfGraduation] = useState("");
  const [yearError, setYearError] = useState("");

  const [isLoadingGraduates, setIsLoadingGraduates] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  const [transactionStatus, setTransactionStatus] = useState("");
  const [successNotification, setSuccessNotification] = useState("");
  const [errorNotification, setErrorNotification] = useState("");

  const [userInstitution, setUserInstitution] = useState("");
  const [isLoadingInstitution, setIsLoadingInstitution] = useState(true);

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] =
    useState(null);

  const [filterProgram, setFilterProgram] = useState("");
  const [filterCriteria, setFilterCriteria] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Smart contract hooks
  const {
    addUniversityGraduates,
    getGraduatesByUniversityName,
    getStudentDetailsByRegAndAward,
    getQRCodeByRegNumberAndAward,
    loading
  } = useCertificateManagement();

  const { getProgramsByUniversity } = useAccreditationManagement();

  const { getUserInstitution } = useUserManagement();

  const { isConnected } = useConnectionStatus();

  // --------------------------------------------------
  // UNIVERSITY NAME
  // --------------------------------------------------

  // This is the single university name used throughout
  // the component for both saving and retrieving graduates.
  const getCanonicalUniversityName = () => {
    if (
      !userInstitution ||
      typeof userInstitution !== "string" ||
      !userInstitution.trim()
    ) {
      throw new Error(
        "University name has not been retrieved from the user's email."
      );
    }

    // Preserve original capitalization.
    return userInstitution.trim();
  };

  // --------------------------------------------------
  // GAS CALCULATION
  // --------------------------------------------------

  const calculateGasLimit = (batchLength) => {
    const baseGas = 1000000;
    const gasPerStudent = 300000;

    const calculatedGas = baseGas + batchLength * gasPerStudent;

    const minGas = 1500000;
    const maxGas = 5000000;

    return Math.min(
      Math.max(calculatedGas, minGas),
      maxGas
    );
  };

  // --------------------------------------------------
  // FETCH USER INSTITUTION USING EMAIL
  // --------------------------------------------------

  const fetchUserInstitution = async () => {
    try {
      setIsLoadingInstitution(true);
      setErrorNotification("");

      const userData = localStorage.getItem("user");

      if (!userData) {
        throw new Error("User information not found. Please log in again.");
      }

      const parsedUser = JSON.parse(userData);
      const email = parsedUser.email?.trim();

      if (!email) {
        throw new Error("User email was not found.");
      }

      if (!isConnected) {
        throw new Error("Please connect your wallet.");
      }

      console.log("📧 Retrieving institution for email:", email);

      const institution = await getUserInstitution(email);

      console.log(
        "🏛️ University returned from blockchain:",
        institution
      );

      if (
        typeof institution !== "string" ||
        institution.trim() === ""
      ) {
        throw new Error(
          "No university is associated with this email address."
        );
      }

      const exactUniversityName = institution.trim();

      console.log(
        "✅ Canonical university name:",
        exactUniversityName
      );

      console.log(
        "🔎 University JSON:",
        JSON.stringify(exactUniversityName)
      );

      setUserInstitution(exactUniversityName);

    } catch (error) {
      console.error("❌ Institution retrieval error:", error);

      setUserInstitution("");

      setErrorNotification(
        error.message || "Failed to retrieve university information."
      );

    } finally {
      setIsLoadingInstitution(false);
    }
  };

  // --------------------------------------------------
  // FETCH UNIVERSITY PROGRAMS
  // --------------------------------------------------

  const fetchProgramsFromBlockchain = async (universityName) => {
    try {
      setIsLoadingPrograms(true);

      if (!universityName || !universityName.trim()) {
        setProgramOptions([]);
        setProgramOfStudy("");
        return;
      }

      // Use the exact university name obtained from email.
      const exactUniversityName = getCanonicalUniversityName();

      console.log(
        "📚 Fetching programs for:",
        exactUniversityName
      );

      const programs = await getProgramsByUniversity(
        exactUniversityName
      );

      console.log("📦 Programs returned:", programs);

      if (Array.isArray(programs) && programs.length > 0) {
        let programNames = [];

        if (typeof programs[0] === "string") {
          programNames = programs
            .map(program => String(program).trim())
            .filter(Boolean);

        } else if (typeof programs[0] === "object") {
          programNames = programs
            .map(program =>
              program.programName ||
              program.name ||
              program.program ||
              ""
            )
            .map(program => String(program).trim())
            .filter(Boolean);
        }

        setProgramOptions(programNames);

        if (programNames.length > 0) {
          setProgramOfStudy(current =>
            programNames.includes(current)
              ? current
              : programNames[0]
          );
        } else {
          setProgramOfStudy("");
        }

      } else {
        setProgramOptions([]);
        setProgramOfStudy("");
      }

    } catch (error) {
      console.error("❌ Error fetching programs:", error);

      setProgramOptions([]);
      setProgramOfStudy("");

      // Program retrieval is separate from graduate retrieval.
      console.warn(
        "Program retrieval failed independently:",
        error.message
      );

    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // --------------------------------------------------
  // FETCH GRADUATES FROM BLOCKCHAIN
  // --------------------------------------------------

  const fetchGraduatesFromBlockchain = async (universityName) => {
    try {
      setIsLoadingGraduates(true);
      setErrorNotification("");

      if (!isConnected) {
        setGraduates([]);
        setFilteredData([]);
        return;
      }

      const exactUniversityName = getCanonicalUniversityName();

      // Prevent retrieval using another university name.
      if (
        typeof universityName !== "string" ||
        universityName.trim() !== exactUniversityName
      ) {
        throw new Error(
          "University name mismatch. Retrieval must use the institution returned for the logged-in email."
        );
      }

      console.log("🔍 RETRIEVING GRADUATES");
      console.log("University:", exactUniversityName);
      console.log(
        "University JSON:",
        JSON.stringify(exactUniversityName)
      );

      // Call the same certificate contract getter.
      const graduatesData = await getGraduatesByUniversityName(
        exactUniversityName
      );

      console.log(
        "📦 Raw blockchain graduate response:",
        graduatesData
      );

      if (!Array.isArray(graduatesData)) {
        throw new Error(
          "The blockchain did not return a valid graduate array."
        );
      }

      console.log(
        "📊 Number of graduates retrieved:",
        graduatesData.length
      );

      const processedGraduates = graduatesData.map(graduate => {
        const grad = graduate || {};

        return {
          universityName: String(
            grad.universityName ?? grad[0] ?? exactUniversityName
          ).trim(),

          studentName: String(
            grad.studentName ?? grad[1] ?? ""
          ).trim(),

          programOfStudy: String(
            grad.programOfStudy ?? grad[2] ?? ""
          ).trim(),

          award: String(
            grad.award ?? grad[3] ?? ""
          ).trim(),

          yearOfGraduation: String(
            grad.yearOfGraduation ?? grad[4] ?? ""
          ).trim(),

          registrationNumber: String(
            grad.registrationNumber ?? grad[5] ?? ""
          ).trim()
        };
      });

      const validGraduates = processedGraduates.filter(
        graduate =>
          graduate.studentName &&
          graduate.registrationNumber
      );

      console.log(
        "✅ Processed graduates:",
        validGraduates
      );

      console.log(
        "📊 Valid graduate count:",
        validGraduates.length
      );

      setGraduates(validGraduates);
      setFilteredData(validGraduates);
      setCurrentPage(1);

    } catch (error) {
      console.error(
        "❌ Graduate retrieval failed:",
        error
      );

      setGraduates([]);
      setFilteredData([]);

      setErrorNotification(
        error.message ||
        "Failed to retrieve graduates from blockchain."
      );

    } finally {
      setIsLoadingGraduates(false);
    }
  };

  // --------------------------------------------------
  // FETCH GRADUATES IN BATCHES
  // --------------------------------------------------

  const addSingleBatchToBlockchain = async (
    batch,
    customGasLimit = null
  ) => {
    try {
      // Always use the same university name returned by email.
      const universityName = getCanonicalUniversityName();

      const studentNames = batch.map(student =>
        String(student.studentName ?? "").trim()
      );

      const registrationNumbers = batch.map(student =>
        String(student.registrationNumber ?? "").trim()
      );

      const trimmedProgram = String(programOfStudy).trim();
      const trimmedAward = String(award).trim();
      const trimmedYear = String(yearOfGraduation).trim();

      if (!trimmedProgram || !trimmedAward) {
        throw new Error(
          "Program of study and award are required."
        );
      }

      if (!trimmedYear) {
        throw new Error("Year of graduation is required.");
      }

      const yearNum = Number(trimmedYear);
      const currentYear = new Date().getFullYear();

      if (
        !Number.isInteger(yearNum) ||
        yearNum < 1900 ||
        yearNum > currentYear
      ) {
        throw new Error(
          "Please enter a valid graduation year."
        );
      }

      if (
        studentNames.length === 0 ||
        studentNames.length !== registrationNumbers.length ||
        studentNames.some(name => !name) ||
        registrationNumbers.some(reg => !reg)
      ) {
        throw new Error("Invalid student data in this batch.");
      }

      const finalGasLimit =
        customGasLimit || calculateGasLimit(batch.length);

      const txOptions = {
        gas: finalGasLimit,
        maxFeePerGas: "100000000000",
        maxPriorityFeePerGas: "3000000000"
      };

      console.log("🚀 ADDING GRADUATES TO BLOCKCHAIN");

      console.log({
        universityName,
        studentNames,
        programOfStudy: trimmedProgram,
        award: trimmedAward,
        yearOfGraduation: trimmedYear,
        registrationNumbers
      });

      // The hook must map these properties to the Solidity ABI order.
      const result = await addUniversityGraduates(
        {
          universityName,
          studentNames,
          programOfStudy: trimmedProgram,
          award: trimmedAward,
          yearOfGraduation: trimmedYear,
          registrationNumbers
        },
        txOptions
      );

      console.log(
        "📦 Blockchain transaction result:",
        result
      );

      // If the hook returns a transaction receipt, check its status.
      if (
        result &&
        result.status !== undefined &&
        !(
          result.status === true ||
          result.status === 1 ||
          result.status === "0x1"
        )
      ) {
        throw new Error(
          "Blockchain transaction was not successful."
        );
      }

      return result;

    } catch (error) {
      console.error(
        "❌ Failed to add graduate batch:",
        error
      );

      throw error;
    }
  };

  const processGraduatesInBatches = async (
    graduateList,
    batchSize
  ) => {
    const batches = [];

    for (let i = 0; i < graduateList.length; i += batchSize) {
      batches.push(
        graduateList.slice(i, i + batchSize)
      );
    }

    const results = [];
    let currentGasLimit = calculateGasLimit(batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      console.log(
        `📦 Processing batch ${i + 1} of ${batches.length}`
      );

      try {
        const result = await addSingleBatchToBlockchain(
          batch,
          currentGasLimit
        );

        results.push(result);

        if (i < batches.length - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, 3000)
          );
        }

      } catch (error) {
        const message = String(error?.message || error).toLowerCase();

        if (
          message.includes("out of gas") &&
          currentGasLimit < 5000000
        ) {
          currentGasLimit = Math.min(
            Math.ceil(currentGasLimit * 1.5),
            5000000
          );

          const retryResult = await addSingleBatchToBlockchain(
            batch,
            currentGasLimit
          );

          results.push(retryResult);

        } else {
          throw error;
        }
      }
    }

    return results;
  };

  // --------------------------------------------------
  // YEAR VALIDATION
  // --------------------------------------------------

  const validateYearOfGraduation = (year) => {
    const currentYear = new Date().getFullYear();

    if (!year || year.trim() === "") {
      setYearError("Year of graduation is required.");
      return false;
    }

    const inputYear = Number(year);

    if (!Number.isInteger(inputYear)) {
      setYearError("Please enter a valid year.");
      return false;
    }

    if (inputYear > currentYear) {
      setYearError(
        `Year cannot be greater than ${currentYear}.`
      );
      return false;
    }

    if (inputYear < 1900) {
      setYearError("Please enter a year from 1900 onwards.");
      return false;
    }

    setYearError("");
    return true;
  };

  const handleYearChange = (e) => {
    const value = e.target.value;

    setYearOfGraduation(value);

    if (value.trim() !== "") {
      validateYearOfGraduation(value);
    } else {
      setYearError("");
    }
  };

  // --------------------------------------------------
  // EFFECTS
  // --------------------------------------------------

  useEffect(() => {
    if (isConnected) {
      fetchUserInstitution();
    } else {
      setUserInstitution("");
      setGraduates([]);
      setFilteredData([]);
      setIsLoadingInstitution(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected || !userInstitution) {
      setGraduates([]);
      setFilteredData([]);
      return;
    }

    const exactUniversityName = userInstitution.trim();

    console.log(
      "🏛️ University name used for all operations:",
      exactUniversityName
    );

    fetchGraduatesFromBlockchain(exactUniversityName);
    fetchProgramsFromBlockchain(exactUniversityName);

  }, [userInstitution, isConnected]);

  // --------------------------------------------------
  // FILTERING AND SORTING
  // --------------------------------------------------

  useEffect(() => {
    applyFilters();
  }, [
    graduates,
    sortConfig,
    filterProgram,
    filterCriteria
  ]);

  const applyFilters = () => {
    let filtered = [...graduates];

    if (filterCriteria && filterCriteria.trim() !== "") {
      const searchTerm = filterCriteria.toLowerCase().trim();

      filtered = filtered.filter(graduate =>
        graduate.studentName?.toLowerCase().includes(searchTerm) ||
        graduate.registrationNumber?.toLowerCase().includes(searchTerm) ||
        graduate.programOfStudy?.toLowerCase().includes(searchTerm) ||
        graduate.award?.toLowerCase().includes(searchTerm) ||
        graduate.yearOfGraduation?.toString().includes(searchTerm)
      );
    }

    if (filterProgram) {
      filtered = filtered.filter(graduate =>
        graduate.programOfStudy?.toLowerCase() ===
        filterProgram.toLowerCase()
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const first = String(a[sortConfig.key] ?? "").toLowerCase();
        const second = String(b[sortConfig.key] ?? "").toLowerCase();

        if (first < second) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }

        if (first > second) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        return 0;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentGraduates = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage
  );

  // --------------------------------------------------
  // EXCEL UPLOAD
  // --------------------------------------------------

  const extractDataFromExcel = (file) => {
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;

        const workbook = XLSX.read(arrayBuffer, {
          type: "array"
        });

        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error("Excel file contains no worksheet.");
        }

        const worksheet = workbook.Sheets[firstSheetName];

        const data = XLSX.utils.sheet_to_json(
          worksheet,
          { defval: "" }
        );

        if (data.length === 0) {
          setIsExcelReady(false);
          setPendingGraduates([]);
          setShowUploadPreview(false);
          return;
        }

        const processedData = data.map(row => {
          const originalColumns = Object.keys(row);

          const findColumn = (possibleNames) => {
            for (const name of possibleNames) {
              const index = originalColumns.findIndex(
                column =>
                  column.trim().toLowerCase() === name.toLowerCase()
              );

              if (index !== -1) {
                return originalColumns[index];
              }
            }

            return null;
          };

          const nameCol = findColumn([
            "student name",
            "name",
            "full name",
            "student"
          ]);

          const regNoCol = findColumn([
            "registration number",
            "reg no",
            "student id",
            "id"
          ]);

          return {
            studentName: String(
              nameCol ? row[nameCol] ?? "" : ""
            ).trim(),

            registrationNumber: String(
              regNoCol ? row[regNoCol] ?? "" : ""
            ).trim()
          };
        }).filter(student =>
          student.studentName &&
          student.registrationNumber
        );

        if (processedData.length === 0) {
          throw new Error(
            "No valid students found. Check the Student Name and Registration Number columns."
          );
        }

        setPendingGraduates(processedData);
        setIsExcelReady(true);
        setShowUploadPreview(true);

        console.log(
          "📊 Excel students processed:",
          processedData
        );

      } catch (error) {
        console.error(
          "❌ Excel processing error:",
          error
        );

        setIsExcelReady(false);
        setPendingGraduates([]);
        setShowUploadPreview(false);

        setErrorNotification(
          error.message || "Failed to process Excel file."
        );
      }
    };

    fileReader.onerror = () => {
      console.error("❌ Error reading Excel file.");

      setIsExcelReady(false);
      setPendingGraduates([]);

      setErrorNotification(
        "Unable to read the uploaded Excel file."
      );
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      extractDataFromExcel(file);
    }
  };

  // --------------------------------------------------
  // ADD GRADUATES TO BLOCKCHAIN
  // --------------------------------------------------

  const addGraduatesToBlockchain = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet.");
      return;
    }

    if (!userInstitution) {
      setTransactionStatus("University name is unavailable.");
      return;
    }

    if (!programOfStudy || !award || !yearOfGraduation) {
      setTransactionStatus(
        "Please fill in all required fields."
      );
      return;
    }

    if (!validateYearOfGraduation(yearOfGraduation)) {
      setTransactionStatus("Invalid graduation year.");
      return;
    }

    if (!isExcelReady || pendingGraduates.length === 0) {
      setTransactionStatus(
        "Please upload an Excel file containing student data."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      setTransactionStatus(
        `Adding ${pendingGraduates.length} graduates to blockchain...`
      );

      setErrorNotification("");
      setSuccessNotification("");

      const universityName = getCanonicalUniversityName();

      console.log("🚀 STARTING GRADUATE REGISTRATION");

      console.log({
        universityName,
        programOfStudy,
        award,
        yearOfGraduation,
        studentCount: pendingGraduates.length
      });

      // Process students in batches of three.
      const batchSize = 3;

      const results = await processGraduatesInBatches(
        pendingGraduates,
        batchSize
      );

      console.log(
        "📦 All transaction results:",
        results
      );

      // Only continue after all batches have completed successfully.
      setTransactionStatus("Transactions completed. Verifying saved graduates...");

      // Retrieve using exactly the same university name.
      const savedGraduates = await getGraduatesByUniversityName(
        universityName
      );

      console.log(
        "🔍 Graduate verification result:",
        savedGraduates
      );

      if (!Array.isArray(savedGraduates)) {
        throw new Error(
          "Transactions completed, but graduate verification returned an invalid response."
        );
      }

      if (savedGraduates.length === 0) {
        throw new Error(
          "No graduates were returned after registration. Check the contract address, network, and university name."
        );
      }

      await fetchGraduatesFromBlockchain(universityName);

      setSuccessNotification(
        `Successfully submitted ${pendingGraduates.length} graduates. Blockchain returned ${savedGraduates.length} graduate records for this university.`
      );

      setTransactionStatus("Success");

      setTimeout(() => {
        setPendingGraduates([]);
        setIsExcelReady(false);
        setYearOfGraduation("");
        setTransactionStatus("");
        setSuccessNotification("");
        setShowUploadPreview(false);
        setShowAddForm(false);
      }, 5000);

    } catch (error) {
      console.error(
        "❌ Graduate registration error:",
        error
      );

      setTransactionStatus("Failed");

      const message = String(error?.message || error);

      if (message.toLowerCase().includes("out of gas")) {
        setErrorNotification(
          "Transaction failed because of insufficient gas. Try a smaller batch."
        );

      } else if (
        message.toLowerCase().includes("invalid year")
      ) {
        setErrorNotification(
          "Invalid graduation year. Enter a year between 1900 and the current year."
        );

      } else {
        setErrorNotification(message);
      }

      setTimeout(() => {
        setTransactionStatus("");
      }, 8000);

    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // GENERATE CERTIFICATE
  // --------------------------------------------------

  const handleGenerateCertificate = async (graduate) => {
    try {
      setIsSubmitting(true);

      console.log(
        "🎓 Generating certificate for:",
        graduate
      );

      const qrResult = await getQRCodeByRegNumberAndAward(
        graduate.registrationNumber,
        graduate.award
      );

      console.log(
        "📦 QR code result:",
        qrResult
      );

      let finalQrCodeValue = "";

      if (qrResult) {
        if (
          typeof qrResult.qrCode === "string" &&
          qrResult.qrCode.trim() &&
          qrResult.qrCode !== "true" &&
          qrResult.qrCode !== "false"
        ) {
          finalQrCodeValue = qrResult.qrCode.trim();

        } else if (
          typeof qrResult[1] === "string" &&
          qrResult[1].trim() &&
          qrResult[1] !== "true" &&
          qrResult[1] !== "false"
        ) {
          finalQrCodeValue = qrResult[1].trim();

        } else if (
          typeof qrResult.qrCodeValue === "string" &&
          qrResult.qrCodeValue.trim()
        ) {
          finalQrCodeValue = qrResult.qrCodeValue.trim();
        }
      }

      if (!finalQrCodeValue) {
        finalQrCodeValue =
          `${graduate.registrationNumber}-${graduate.award}-${getCanonicalUniversityName()}`;

        setErrorNotification(
          "QR code was not found on the blockchain. A temporary code will be used for preview."
        );
      }

      const certificateData = {
        universityName: String(
          graduate.universityName || getCanonicalUniversityName()
        ).trim(),

        studentName: String(
          graduate.studentName || ""
        ).trim(),

        programOfStudy: String(
          graduate.programOfStudy || ""
        ).trim(),

        award: String(
          graduate.award || ""
        ).trim(),

        yearOfGraduation: String(
          graduate.yearOfGraduation || ""
        ).trim(),

        registrationNumber: String(
          graduate.registrationNumber || ""
        ).trim(),

        issueDate: new Date().toISOString().split("T")[0],

        qrCode: finalQrCodeValue
      };

      console.log(
        "✅ Final certificate data:",
        certificateData
      );

      if (
        !certificateData.studentName ||
        !certificateData.registrationNumber
      ) {
        throw new Error(
          "Missing student information. Cannot generate certificate."
        );
      }

      setSelectedStudentForCertificate(certificateData);
      setShowCertificateModal(true);

    } catch (error) {
      console.error(
        "❌ Certificate generation failed:",
        error
      );

      setErrorNotification(
        error.message || "Failed to generate certificate."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // UI HANDLERS
  // --------------------------------------------------

  const handleProgramChange = (e) => {
    setProgramOfStudy(e.target.value);
  };

  const handleFilterProgramChange = (e) => {
    setFilterProgram(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);

    if (showAddForm) {
      setPendingGraduates([]);
      setIsExcelReady(false);
      setShowUploadPreview(false);
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>

      {showCertificateModal && (
        <CertificateGenerator
          studentData={selectedStudentForCertificate}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedStudentForCertificate(null);
          }}
          isGenerating={isSubmitting}
          darkMode={darkMode}
        />
      )}

      {!isConnected && (
        <div className={styles.connectionWarning}>
          ⚠️ Not connected to blockchain. Please connect your wallet to manage graduates.
        </div>
      )}

      {successNotification && (
        <div className={styles.successNotification}>
          <div className={styles.notificationIcon}>✅</div>
          <div className={styles.notificationContent}>
            {successNotification}
          </div>
        </div>
      )}

      {errorNotification && (
        <div className={styles.errorNotification}>
          <div className={styles.notificationIcon}>❌</div>
          <div className={styles.notificationContent}>
            {errorNotification}
          </div>
        </div>
      )}

      {transactionStatus && (
        <div className={`${styles.transactionStatus} ${
          transactionStatus.includes("Success")
            ? styles.success
            : transactionStatus.includes("Failed")
            ? styles.error
            : styles.loading
        }`}>
          {transactionStatus}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Processing blockchain transaction...</p>
        </div>
      )}

      {/* MAIN TABLE SECTION */}

      <div className={styles.tableSection}>

        <div className={styles.sectionHeader}>

          <div className={styles.headerLeft}>
            <button
              className={styles.addButton}
              onClick={toggleAddForm}
              title="Add New Graduate"
              disabled={!isConnected || !userInstitution}
            >
              <span className={styles.plusIcon}>+</span>
              Add New Graduate
            </button>
          </div>

          <div className={styles.headerRight}>
            {userInstitution && (
              <div className={styles.institutionBadge}>
                📍 {userInstitution}
              </div>
            )}
          </div>

        </div>

        <div className={styles.tableContainer}>

          <div className={styles.tableControls}>

            <div className={styles.controlsRow}>

              <div className={styles.searchGroup}>
                <label className={styles.controlLabel}>
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Search by name, reg no, award, year..."
                  value={filterCriteria}
                  onChange={e => setFilterCriteria(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.controlLabel}>
                  Filter by Program
                </label>

                <select
                  value={filterProgram}
                  onChange={handleFilterProgramChange}
                  className={styles.filterSelect}
                  disabled={isLoadingPrograms}
                >
                  <option value="">All Programs</option>

                  {programOptions.map((program, index) => (
                    <option key={index} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {(filterCriteria || filterProgram) && (
              <div className={styles.filterStatus}>
                Showing {filteredData.length} of {graduates.length} graduates
                {filterProgram && ` in ${filterProgram}`}
                {filterCriteria && ` matching "${filterCriteria}"`}
              </div>
            )}

          </div>

          <div className={styles.tableWrapper}>

            {isLoadingGraduates ? (

              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading graduates from blockchain...</p>
              </div>

            ) : graduates.length > 0 ? (

              <>

                <div className={styles.tableHeader}>

                  <div className={styles.paginationControls}>

                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className={styles.pageSizeSelect}
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>

                    <div className={styles.pagination}>

                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                      >
                        ←
                      </button>

                      <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages || 1} ({filteredData.length} total)
                      </span>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === totalPages ||
                          totalPages === 0
                        }
                        className={styles.pageButton}
                      >
                        →
                      </button>

                    </div>

                  </div>

                </div>

                <table className={styles.dataTable}>

                  <thead>
                    <tr>

                      <th
                        onClick={() => handleSort("studentName")}
                        className={styles.sortableHeader}
                      >
                        Student Name{" "}
                        {sortConfig.key === "studentName" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>

                      <th
                        onClick={() => handleSort("programOfStudy")}
                        className={styles.sortableHeader}
                      >
                        Program{" "}
                        {sortConfig.key === "programOfStudy" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>

                      <th
                        onClick={() => handleSort("award")}
                        className={styles.sortableHeader}
                      >
                        Award{" "}
                        {sortConfig.key === "award" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>

                      <th
                        onClick={() => handleSort("yearOfGraduation")}
                        className={styles.sortableHeader}
                      >
                        Year{" "}
                        {sortConfig.key === "yearOfGraduation" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>

                      <th
                        onClick={() => handleSort("registrationNumber")}
                        className={styles.sortableHeader}
                      >
                        Registration No.{" "}
                        {sortConfig.key === "registrationNumber" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>

                      <th>Actions</th>

                    </tr>
                  </thead>

                  <tbody>

                    {currentGraduates.length > 0 ? (

                      currentGraduates.map((graduate, index) => (

                        <tr key={`${graduate.registrationNumber}-${index}`}>

                          <td className={styles.studentNameCell}>
                            {graduate.studentName}
                          </td>

                          <td>
                            {graduate.programOfStudy}
                          </td>

                          <td>
                            <span className={styles.awardBadge}>
                              {graduate.award}
                            </span>
                          </td>

                          <td>
                            {graduate.yearOfGraduation}
                          </td>

                          <td className={styles.regNumberCell}>
                            {graduate.registrationNumber}
                          </td>

                          <td>
                            <button
                              onClick={() =>
                                handleGenerateCertificate(graduate)
                              }
                              disabled={isSubmitting}
                              className={styles.certificateButton}
                              title="Generate Certificate"
                            >
                              🎓 Certificate
                            </button>
                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>
                        <td colSpan="6" className={styles.noResults}>
                          No graduates match your filter criteria.
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </>

            ) : (

              <div className={styles.emptyState}>

                <div className={styles.emptyStateIcon}>
                  🎓
                </div>

                <h3>No Graduates Found</h3>

                <p>
                  Get started by adding graduates using the form above.
                </p>

                {userInstitution && (
                  <p className={styles.emptyStateHint}>
                    University: <strong>{userInstitution}</strong>
                  </p>
                )}

                {!userInstitution && isConnected && (
                  <p className={styles.emptyStateHint}>
                    Unable to detect your institution. Please contact administrator.
                  </p>
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ADD GRADUATE FORM MODAL */}

      {showAddForm && (

        <div className={styles.modalOverlay}>

          <div className={styles.modalContent}>

            <div className={styles.modalHeader}>

              <h2 className={styles.modalTitle}>
                Upload New Graduates
              </h2>

              <button
                className={styles.closeButton}
                onClick={toggleAddForm}
                title="Close"
                disabled={isSubmitting}
              >
                ×
              </button>

            </div>

            <div className={styles.modalBody}>

              <div className={styles.formGroup}>

                <label className={styles.formLabel}>
                  University Name
                </label>

                <div className={styles.universityDisplay}>

                  {isLoadingInstitution ? (

                    <div className={styles.loadingText}>
                      Loading institution from blockchain...
                    </div>

                  ) : userInstitution ? (

                    <div className={styles.universityValue}>
                      <strong>{userInstitution}</strong>
                      <span className={styles.verifiedBadge}>
                        ✓ Verified
                      </span>
                    </div>

                  ) : (

                    <div className={styles.noInstitution}>
                      ❌ No institution found. Please contact administrator.
                    </div>

                  )}

                </div>

              </div>

              <div className={styles.formRow}>

                <div className={styles.formGroup}>

                  <label className={styles.formLabel}>
                    Program of Study *
                  </label>

                  <select
                    value={programOfStudy}
                    onChange={handleProgramChange}
                    disabled={
                      isSubmitting ||
                      !userInstitution ||
                      isLoadingPrograms
                    }
                    className={styles.formInput}
                  >

                    {isLoadingPrograms ? (

                      <option value="">
                        Loading programs...
                      </option>

                    ) : programOptions.length === 0 ? (

                      <option value="">
                        No programs found
                      </option>

                    ) : (

                      programOptions.map((program, index) => (
                        <option key={index} value={program}>
                          {program}
                        </option>
                      ))

                    )}

                  </select>

                  {isLoadingPrograms && (
                    <small className={styles.helperText}>
                      Fetching programs from blockchain...
                    </small>
                  )}

                </div>

                <div className={styles.formGroup}>

                  <label className={styles.formLabel}>
                    Award *
                  </label>

                  <select
                    value={award}
                    onChange={e => setAward(e.target.value)}
                    disabled={isSubmitting || !userInstitution}
                    className={styles.formInput}
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>

                </div>

                <div className={styles.formGroup}>

                  <label className={styles.formLabel}>
                    Year of Graduation *
                  </label>

                  <input
                    type="number"
                    value={yearOfGraduation}
                    onChange={handleYearChange}
                    placeholder={new Date().getFullYear().toString()}
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting || !userInstitution}
                    className={`${styles.formInput} ${
                      yearError ? styles.inputError : ""
                    }`}
                  />

                  {yearError && (
                    <div className={styles.errorMessage}>
                      ⚠️ {yearError}
                    </div>
                  )}

                </div>

              </div>

              <div className={styles.formGroup}>

                <label className={styles.formLabel}>
                  Upload Excel File *
                </label>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isSubmitting || !userInstitution}
                  className={styles.fileInput}
                />

                <small className={styles.helperText}>
                  File should contain columns for{" "}
                  <strong>Student Name</strong> and{" "}
                  <strong>Registration Number</strong>.
                </small>

                {showUploadPreview && pendingGraduates.length > 0 && (

                  <div className={styles.uploadPreview}>

                    <h4 className={styles.previewTitle}>
                      ✅ Ready to upload: {pendingGraduates.length} student{pendingGraduates.length !== 1 ? "s" : ""}
                    </h4>

                    <div className={styles.previewList}>

                      {pendingGraduates.slice(0, 5).map((student, index) => (

                        <div key={index} className={styles.previewItem}>

                          <span className={styles.studentName}>
                            {student.studentName}
                          </span>

                          <span className={styles.regNumber}>
                            {student.registrationNumber}
                          </span>

                        </div>

                      ))}

                      {pendingGraduates.length > 5 && (
                        <div className={styles.previewMore}>
                          ... and {pendingGraduates.length - 5} more
                        </div>
                      )}

                    </div>

                  </div>

                )}

              </div>

              <div className={styles.formActions}>

                <button
                  onClick={addGraduatesToBlockchain}
                  disabled={
                    !isExcelReady ||
                    isSubmitting ||
                    !isConnected ||
                    !userInstitution ||
                    !programOfStudy ||
                    !award ||
                    !yearOfGraduation ||
                    Boolean(yearError)
                  }
                  className={styles.primaryButton}
                >

                  {isSubmitting ? (

                    <>
                      <div className={styles.buttonSpinner}></div>
                      Adding {pendingGraduates.length} Graduates...
                    </>

                  ) : (

                    `Add ${pendingGraduates.length} Graduates to Blockchain`

                  )}

                </button>

                <button
                  onClick={toggleAddForm}
                  disabled={isSubmitting}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>

              </div>

              {isSubmitting && (

                <div className={styles.transactionInfo}>

                  <div className={styles.infoIcon}>
                    ⏳
                  </div>

                  <div className={styles.infoText}>
                    <strong>
                      Transaction in progress...
                    </strong>

                    <small>
                      Please wait for blockchain confirmation. Do not close this window.
                    </small>
                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Graduate;
