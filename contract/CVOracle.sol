// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CVOracle
 * @dev Oracle para integração com Computer Vision
 * @notice Permite verificação visual de etapas da cadeia de suprimentos
 */
contract CVOracle is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct CVData {
        uint256 dataId;              // ID único dos dados
        uint256 stepId;              // ID da etapa relacionada
        string imageHash;            // Hash da imagem
        string analysisResult;       // Resultado da análise
        string confidenceScore;      // Score de confiança
        string detectedObjects;      // Objetos detectados
        string anomalies;            // Anomalias detectadas
        string metadata;             // Metadados adicionais
        address oracle;              // Endereço do oracle
        uint256 timestamp;           // Timestamp da análise
        bool verified;               // Status de verificação
    }

    mapping(uint256 => CVData) public cvData;
    mapping(uint256 => uint256[]) public stepToCVData;
    mapping(string => uint256) public imageHashToDataId;

    uint256 private dataCounter;

    event CVDataSubmitted(
        uint256 indexed dataId,
        uint256 indexed stepId,
        string imageHash,
        address indexed oracle
    );

    event CVDataVerified(
        uint256 indexed dataId,
        address indexed verifier,
        bool verified
    );

    event AnomalyDetected(
        uint256 indexed dataId,
        string anomalies,
        uint256 indexed stepId
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Submete dados de Computer Vision
     * @param stepId ID da etapa
     * @param imageHash Hash da imagem analisada
     * @param analysisResult Resultado da análise
     * @param confidenceScore Score de confiança
     * @param detectedObjects Objetos detectados
     * @param anomalies Anomalias detectadas
     * @param metadata Metadados adicionais
     */
    function submitCVData(
        uint256 stepId,
        string memory imageHash,
        string memory analysisResult,
        string memory confidenceScore,
        string memory detectedObjects,
        string memory anomalies,
        string memory metadata
    ) public onlyRole(ORACLE_ROLE) whenNotPaused nonReentrant returns (uint256) {
        uint256 dataId = dataCounter;
        dataCounter++;

        cvData[dataId] = CVData({
            dataId: dataId,
            stepId: stepId,
            imageHash: imageHash,
            analysisResult: analysisResult,
            confidenceScore: confidenceScore,
            detectedObjects: detectedObjects,
            anomalies: anomalies,
            metadata: metadata,
            oracle: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        imageHashToDataId[imageHash] = dataId;
        stepToCVData[stepId].push(dataId);

        emit CVDataSubmitted(dataId, stepId, imageHash, msg.sender);

        // Emitir evento se anomalias foram detectadas
        if (bytes(anomalies).length > 0) {
            emit AnomalyDetected(dataId, anomalies, stepId);
        }

        return dataId;
    }

    /**
     * @dev Verifica dados de Computer Vision
     * @param dataId ID dos dados
     */
    function verifyCVData(uint256 dataId) public onlyRole(VERIFIER_ROLE) {
        require(cvData[dataId].dataId != 0, "CV Data does not exist");
        require(!cvData[dataId].verified, "CV Data already verified");

        cvData[dataId].verified = true;

        emit CVDataVerified(dataId, msg.sender, true);
    }

    /**
     * @dev Rejeita dados de Computer Vision
     * @param dataId ID dos dados
     * @param reason Razão da rejeição
     */
    function rejectCVData(uint256 dataId, string memory reason) public onlyRole(VERIFIER_ROLE) {
        require(cvData[dataId].dataId != 0, "CV Data does not exist");
        require(!cvData[dataId].verified, "CV Data already verified");

        cvData[dataId].verified = false;
        cvData[dataId].metadata = reason;

        emit CVDataVerified(dataId, msg.sender, false);
    }

    /**
     * @dev Obtém dados de CV de uma etapa
     * @param stepId ID da etapa
     */
    function getCVDataByStep(uint256 stepId) public view returns (uint256[] memory) {
        return stepToCVData[stepId];
    }

    /**
     * @dev Obtém dados de CV por hash de imagem
     * @param imageHash Hash da imagem
     */
    function getCVDataByImageHash(string memory imageHash) public view returns (uint256) {
        return imageHashToDataId[imageHash];
    }

    /**
     * @dev Verifica se há anomalias em uma etapa
     * @param stepId ID da etapa
     */
    function hasAnomalies(uint256 stepId) public view returns (bool) {
        uint256[] memory dataIds = stepToCVData[stepId];
        for (uint256 i = 0; i < dataIds.length; i++) {
            if (bytes(cvData[dataIds[i]].anomalies).length > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Obtém todas as anomalias de uma etapa
     * @param stepId ID da etapa
     */
    function getAnomalies(uint256 stepId) public view returns (string[] memory) {
        uint256[] memory dataIds = stepToCVData[stepId];
        string[] memory anomaliesList = new string[](dataIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < dataIds.length; i++) {
            if (bytes(cvData[dataIds[i]].anomalies).length > 0) {
                anomaliesList[count] = cvData[dataIds[i]].anomalies;
                count++;
            }
        }

        // Redimensionar array para o tamanho correto
        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = anomaliesList[i];
        }

        return result;
    }
}
