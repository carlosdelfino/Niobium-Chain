// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SupplyChain.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MiningStep
 * @dev Contrato específico para etapa de mineração
 * @notice Gerencia dados específicos da extração de nióbio
 */
contract MiningStep is AccessControl {
    bytes32 public constant MINER_ROLE = keccak256("MINER_ROLE");
    bytes32 public constant GEOLOGIST_ROLE = keccak256("GEOLOGIST_ROLE");

    SupplyChain public supplyChain;

    struct MiningData {
        uint256 stepId;
        string mineLocation;         // Coordenadas da mina
        string extractionMethod;      // Método de extração
        uint256 extractedAmount;      // Quantidade extraída em kg
        string oreGrade;              // Teor do minério
        string geologicalReport;      // Hash do relatório geológico
        string environmentalLicense;  // Licença ambiental
        uint256 extractionDate;       // Data da extração
        address miningCompany;        // Empresa de mineração
    }

    mapping(uint256 => MiningData) public miningData;
    mapping(string => uint256) public mineLocationToStepId;

    event MiningDataRecorded(
        uint256 indexed stepId,
        string mineLocation,
        uint256 extractedAmount,
        address indexed miningCompany
    );

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINER_ROLE, msg.sender);
        _grantRole(GEOLOGIST_ROLE, msg.sender);
    }

    /**
     * @dev Registra dados de mineração
     */
    function recordMiningData(
        uint256 stepId,
        string memory mineLocation,
        string memory extractionMethod,
        uint256 extractedAmount,
        string memory oreGrade,
        string memory geologicalReport,
        string memory environmentalLicense
    ) public onlyRole(MINER_ROLE) {
        require(supplyChain.stepExists(stepId), "Step does not exist");

        miningData[stepId] = MiningData({
            stepId: stepId,
            mineLocation: mineLocation,
            extractionMethod: extractionMethod,
            extractedAmount: extractedAmount,
            oreGrade: oreGrade,
            geologicalReport: geologicalReport,
            environmentalLicense: environmentalLicense,
            extractionDate: block.timestamp,
            miningCompany: msg.sender
        });

        mineLocationToStepId[mineLocation] = stepId;

        emit MiningDataRecorded(stepId, mineLocation, extractedAmount, msg.sender);
    }
}

/**
 * @title TransportStep
 * @dev Contrato específico para etapa de transporte
 * @notice Gerencia dados de transporte terrestre e marítimo
 */
contract TransportStep is AccessControl {
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");

    SupplyChain public supplyChain;

    struct TransportData {
        uint256 stepId;
        string vehicleType;           // Tipo de veículo (caminhão, navio, etc)
        string vehicleId;             // ID do veículo/placa
        string driverId;              // ID do motorista/capitão
        string route;                 // Rota planejada
        uint256 distance;             // Distância em km
        uint256 estimatedDuration;    // Duração estimada em horas
        string departureLocation;     // Local de partida
        string arrivalLocation;       // Local de chegada
        uint256 departureTime;        // Hora de partida
        uint256 arrivalTime;          // Hora de chegada
        string gpsData;               // Hash dos dados GPS
        string temperatureData;       // Hash dos dados de temperatura
        address transportCompany;     // Empresa de transporte
    }

    mapping(uint256 => TransportData) public transportData;
    mapping(string => uint256) public vehicleIdToStepId;

    event TransportStarted(
        uint256 indexed stepId,
        string vehicleId,
        string departureLocation,
        address indexed transportCompany
    );

    event TransportCompleted(
        uint256 indexed stepId,
        string vehicleId,
        string arrivalLocation,
        uint256 duration
    );

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRANSPORTER_ROLE, msg.sender);
        _grantRole(LOGISTICS_ROLE, msg.sender);
    }

    /**
     * @dev Inicia transporte
     */
    function startTransport(
        uint256 stepId,
        string memory vehicleType,
        string memory vehicleId,
        string memory driverId,
        string memory route,
        uint256 distance,
        uint256 estimatedDuration,
        string memory departureLocation,
        string memory arrivalLocation
    ) public onlyRole(TRANSPORTER_ROLE) {
        require(supplyChain.stepExists(stepId), "Step does not exist");

        transportData[stepId] = TransportData({
            stepId: stepId,
            vehicleType: vehicleType,
            vehicleId: vehicleId,
            driverId: driverId,
            route: route,
            distance: distance,
            estimatedDuration: estimatedDuration,
            departureLocation: departureLocation,
            arrivalLocation: arrivalLocation,
            departureTime: block.timestamp,
            arrivalTime: 0,
            gpsData: "",
            temperatureData: "",
            transportCompany: msg.sender
        });

        vehicleIdToStepId[vehicleId] = stepId;

        emit TransportStarted(stepId, vehicleId, departureLocation, msg.sender);
    }

    /**
     * @dev Completa transporte
     */
    function completeTransport(
        uint256 stepId,
        string memory gpsData,
        string memory temperatureData
    ) public onlyRole(TRANSPORTER_ROLE) {
        require(transportData[stepId].stepId != 0, "Transport data does not exist");
        require(transportData[stepId].arrivalTime == 0, "Transport already completed");

        transportData[stepId].arrivalTime = block.timestamp;
        transportData[stepId].gpsData = gpsData;
        transportData[stepId].temperatureData = temperatureData;

        uint256 duration = block.timestamp - transportData[stepId].departureTime;

        emit TransportCompleted(
            stepId,
            transportData[stepId].vehicleId,
            transportData[stepId].arrivalLocation,
            duration
        );
    }
}

/**
 * @title ProcessingStep
 * @dev Contrato específico para etapa de processamento químico
 * @notice Gerencia dados de processamento de nióbio em NTO
 */
contract ProcessingStep is AccessControl {
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant CHEMIST_ROLE = keccak256("CHEMIST_ROLE");

    SupplyChain public supplyChain;

    struct ProcessingData {
        uint256 stepId;
        string facilityLocation;      // Local da instalação
        string processType;           // Tipo de processo (NTO, ferronióbio)
        uint256 inputAmount;          // Quantidade de entrada em kg
        uint256 outputAmount;         // Quantidade de saída em kg
        string purity;                // Pureza final
        string chemicalFormula;       // Fórmula química
        string qualityReport;         // Hash do relatório de qualidade
        string safetyCertificate;     // Certificado de segurança
        uint256 processingTime;       // Tempo de processamento em horas
        address processingCompany;    // Empresa de processamento
    }

    mapping(uint256 => ProcessingData) public processingData;

    event ProcessingCompleted(
        uint256 indexed stepId,
        string processType,
        uint256 outputAmount,
        string purity,
        address indexed processingCompany
    );

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(CHEMIST_ROLE, msg.sender);
    }

    /**
     * @dev Registra dados de processamento
     */
    function recordProcessingData(
        uint256 stepId,
        string memory facilityLocation,
        string memory processType,
        uint256 inputAmount,
        uint256 outputAmount,
        string memory purity,
        string memory chemicalFormula,
        string memory qualityReport,
        string memory safetyCertificate,
        uint256 processingTime
    ) public onlyRole(PROCESSOR_ROLE) {
        require(supplyChain.stepExists(stepId), "Step does not exist");

        processingData[stepId] = ProcessingData({
            stepId: stepId,
            facilityLocation: facilityLocation,
            processType: processType,
            inputAmount: inputAmount,
            outputAmount: outputAmount,
            purity: purity,
            chemicalFormula: chemicalFormula,
            qualityReport: qualityReport,
            safetyCertificate: safetyCertificate,
            processingTime: processingTime,
            processingCompany: msg.sender
        });

        emit ProcessingCompleted(
            stepId,
            processType,
            outputAmount,
            purity,
            msg.sender
        );
    }
}

/**
 * @title PackagingStep
 * @dev Contrato específico para etapa de empacotamento
 * @notice Gerencia dados de embalagem e rotulagem
 */
contract PackagingStep is AccessControl {
    bytes32 public constant PACKAGER_ROLE = keccak256("PACKAGER_ROLE");

    SupplyChain public supplyChain;

    struct PackagingData {
        uint256 stepId;
        string packagingType;         // Tipo de embalagem
        string packagingMaterial;     // Material da embalagem
        uint256 packageCount;         // Número de pacotes
        uint256 weightPerPackage;     // Peso por pacote em kg
        string labelInfo;             // Informações do rótulo
        string qrCodePerPackage;      // QR Code por pacote
        string barcodeInfo;           // Informações de código de barras
        uint256 packagingDate;        // Data de embalagem
        address packagingCompany;     // Empresa de embalagem
    }

    mapping(uint256 => PackagingData) public packagingData;

    event PackagingCompleted(
        uint256 indexed stepId,
        string packagingType,
        uint256 packageCount,
        address indexed packagingCompany
    );

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PACKAGER_ROLE, msg.sender);
    }

    /**
     * @dev Registra dados de embalagem
     */
    function recordPackagingData(
        uint256 stepId,
        string memory packagingType,
        string memory packagingMaterial,
        uint256 packageCount,
        uint256 weightPerPackage,
        string memory labelInfo,
        string memory qrCodePerPackage,
        string memory barcodeInfo
    ) public onlyRole(PACKAGER_ROLE) {
        require(supplyChain.stepExists(stepId), "Step does not exist");

        packagingData[stepId] = PackagingData({
            stepId: stepId,
            packagingType: packagingType,
            packagingMaterial: packagingMaterial,
            packageCount: packageCount,
            weightPerPackage: weightPerPackage,
            labelInfo: labelInfo,
            qrCodePerPackage: qrCodePerPackage,
            barcodeInfo: barcodeInfo,
            packagingDate: block.timestamp,
            packagingCompany: msg.sender
        });

        emit PackagingCompleted(stepId, packagingType, packageCount, msg.sender);
    }
}

/**
 * @title PortStep
 * @dev Contrato específico para operações portuárias
 * @notice Gerencia carregamento e descarregamento em portos
 */
contract PortStep is AccessControl {
    bytes32 public constant PORT_OPERATOR_ROLE = keccak256("PORT_OPERATOR_ROLE");
    bytes32 public constant CUSTOMS_ROLE = keccak256("CUSTOMS_ROLE");

    SupplyChain public supplyChain;

    struct PortData {
        uint256 stepId;
        string portName;              // Nome do porto
        string portCode;              // Código do porto
        string operationType;         // Tipo (LOADING/UNLOADING)
        string vesselId;              // ID do navio
        string containerIds;          // IDs dos contêineres
        uint256 containerCount;       // Número de contêineres
        string customsDeclaration;    // Declaração aduaneira
        string inspectionReport;      // Relatório de inspeção
        uint256 operationTime;        // Tempo da operação em horas
        address portAuthority;        // Autoridade portuária
    }

    mapping(uint256 => PortData) public portData;
    mapping(string => uint256) public vesselIdToStepId;

    event PortOperationCompleted(
        uint256 indexed stepId,
        string portName,
        string operationType,
        string vesselId,
        address indexed portAuthority
    );

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PORT_OPERATOR_ROLE, msg.sender);
        _grantRole(CUSTOMS_ROLE, msg.sender);
    }

    /**
     * @dev Registra dados de operação portuária
     */
    function recordPortData(
        uint256 stepId,
        string memory portName,
        string memory portCode,
        string memory operationType,
        string memory vesselId,
        string memory containerIds,
        uint256 containerCount,
        string memory customsDeclaration,
        string memory inspectionReport,
        uint256 operationTime
    ) public onlyRole(PORT_OPERATOR_ROLE) {
        require(supplyChain.stepExists(stepId), "Step does not exist");

        portData[stepId] = PortData({
            stepId: stepId,
            portName: portName,
            portCode: portCode,
            operationType: operationType,
            vesselId: vesselId,
            containerIds: containerIds,
            containerCount: containerCount,
            customsDeclaration: customsDeclaration,
            inspectionReport: inspectionReport,
            operationTime: operationTime,
            portAuthority: msg.sender
        });

        vesselIdToStepId[vesselId] = stepId;

        emit PortOperationCompleted(stepId, portName, operationType, vesselId, msg.sender);
    }
}
