// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BatteryTracking
 * @dev Sistema de rastreamento de baterias individuais
 * @notice Cada bateria tem um NFT único com rastreabilidade completa
 */
contract BatteryTracking is ERC721, ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Battery {
        uint256 batteryId;           // ID único da bateria
        string serialNumber;         // Número de série
        string model;                // Modelo da bateria
        uint256 capacity;            // Capacidade em kWh
        uint256 voltage;             // Voltagem em V
        string chemistry;            // Química (NTO, etc)
        uint256 niobiumBatchId;      // ID do lote de nióbio usado
        string manufacturer;         // Fabricante
        uint256 manufacturingDate;   // Data de fabricação
        uint256 warrantyExpiry;      // Data de expiração da garantia
        string qrCode;               // QR Code da bateria
        string currentLocation;      // Localização atual
        address currentOwner;        // Proprietário atual
        bool isActive;               // Status ativo
        bool inVehicle;              // Se está instalada em veículo
        uint256 vehicleId;           // ID do veículo (se instalada)
    }

    mapping(uint256 => Battery) public batteries;
    mapping(string => uint256) public serialToBatteryId;
    mapping(string => uint256) public qrToBatteryId;
    mapping(uint256 => uint256[]) public batchToBatteries;

    uint256 private batteryCounter;

    event BatteryCreated(
        uint256 indexed batteryId,
        string serialNumber,
        string model,
        uint256 niobiumBatchId,
        address indexed manufacturer
    );

    event BatteryTransferred(
        uint256 indexed batteryId,
        address indexed from,
        address indexed to
    );

    event BatteryInstalled(
        uint256 indexed batteryId,
        uint256 indexed vehicleId
    );

    event BatteryRemoved(
        uint256 indexed batteryId,
        uint256 indexed vehicleId
    );

    event BatteryLocationUpdated(
        uint256 indexed batteryId,
        string location
    );

    constructor() ERC721("NiobiumBattery", "NBAT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Cria uma nova bateria
     */
    function createBattery(
        string memory serialNumber,
        string memory model,
        uint256 capacity,
        uint256 voltage,
        string memory chemistry,
        uint256 niobiumBatchId,
        string memory manufacturer,
        uint256 warrantyMonths,
        string memory qrCode,
        string memory tokenURI
    ) public onlyRole(MANUFACTURER_ROLE) whenNotPaused returns (uint256) {
        require(serialToBatteryId[serialNumber] == 0, "Serial number already exists");
        require(qrToBatteryId[qrCode] == 0, "QR Code already exists");

        uint256 batteryId = batteryCounter;
        batteryCounter++;

        uint256 warrantyExpiry = block.timestamp + (warrantyMonths * 30 days);

        _safeMint(msg.sender, batteryId);
        _setTokenURI(batteryId, tokenURI);

        batteries[batteryId] = Battery({
            batteryId: batteryId,
            serialNumber: serialNumber,
            model: model,
            capacity: capacity,
            voltage: voltage,
            chemistry: chemistry,
            niobiumBatchId: niobiumBatchId,
            manufacturer: manufacturer,
            manufacturingDate: block.timestamp,
            warrantyExpiry: warrantyExpiry,
            qrCode: qrCode,
            currentLocation: manufacturer,
            currentOwner: msg.sender,
            isActive: true,
            inVehicle: false,
            vehicleId: 0
        });

        serialToBatteryId[serialNumber] = batteryId;
        qrToBatteryId[qrCode] = batteryId;
        batchToBatteries[niobiumBatchId].push(batteryId);

        emit BatteryCreated(batteryId, serialNumber, model, niobiumBatchId, msg.sender);

        return batteryId;
    }

    /**
     * @dev Transfere bateria para novo proprietário
     */
    function transferBattery(uint256 batteryId, address to) public onlyRole(OPERATOR_ROLE) {
        require(_ownerOf(batteryId) != address(0), "Battery does not exist");
        require(batteries[batteryId].isActive, "Battery is not active");
        require(!batteries[batteryId].inVehicle, "Battery is installed in vehicle");

        address from = batteries[batteryId].currentOwner;
        _safeTransfer(from, to, batteryId);
        batteries[batteryId].currentOwner = to;

        emit BatteryTransferred(batteryId, from, to);
    }

    /**
     * @dev Atualiza localização da bateria
     */
    function updateLocation(uint256 batteryId, string memory location) public onlyRole(OPERATOR_ROLE) {
        require(batteries[batteryId].batteryId != 0, "Battery does not exist");
        require(batteries[batteryId].isActive, "Battery is not active");

        batteries[batteryId].currentLocation = location;

        emit BatteryLocationUpdated(batteryId, location);
    }

    /**
     * @dev Instala bateria em veículo
     */
    function installInVehicle(uint256 batteryId, uint256 vehicleId) public onlyRole(OPERATOR_ROLE) {
        require(batteries[batteryId].batteryId != 0, "Battery does not exist");
        require(batteries[batteryId].isActive, "Battery is not active");
        require(!batteries[batteryId].inVehicle, "Battery already in vehicle");

        batteries[batteryId].inVehicle = true;
        batteries[batteryId].vehicleId = vehicleId;

        emit BatteryInstalled(batteryId, vehicleId);
    }

    /**
     * @dev Remove bateria de veículo
     */
    function removeFromVehicle(uint256 batteryId) public onlyRole(OPERATOR_ROLE) {
        require(batteries[batteryId].batteryId != 0, "Battery does not exist");
        require(batteries[batteryId].inVehicle, "Battery not in vehicle");

        uint256 vehicleId = batteries[batteryId].vehicleId;
        batteries[batteryId].inVehicle = false;
        batteries[batteryId].vehicleId = 0;

        emit BatteryRemoved(batteryId, vehicleId);
    }

    /**
     * @dev Desativa bateria (fim de vida útil)
     */
    function deactivateBattery(uint256 batteryId) public onlyRole(ADMIN_ROLE) {
        require(batteries[batteryId].batteryId != 0, "Battery does not exist");
        require(batteries[batteryId].isActive, "Battery already inactive");

        batteries[batteryId].isActive = false;
    }

    /**
     * @dev Obtém o total de baterias criadas
     */
    function getBatteryCount() public view returns (uint256) {
        return batteryCounter;
    }

    /**
     * @dev Obtém todas as baterias (IDs)
     */
    function getAllBatteries() public view returns (uint256[] memory) {
        uint256[] memory batteryIds = new uint256[](batteryCounter);
        for (uint256 i = 0; i < batteryCounter; i++) {
            batteryIds[i] = i;
        }
        return batteryIds;
    }

    /**
     * @dev Obtém baterias de um lote de nióbio
     */
    function getBatteriesByBatch(uint256 niobiumBatchId) public view returns (uint256[] memory) {
        return batchToBatteries[niobiumBatchId];
    }

    // Override functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title VehicleTracking
 * @dev Sistema de rastreamento de veículos
 * @notice Cada veículo tem registro completo de baterias instaladas
 */
contract VehicleTracking is ERC721, ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Vehicle {
        uint256 vehicleId;            // ID único do veículo
        string vin;                  // VIN (Vehicle Identification Number)
        string make;                 // Fabricante
        string model;                // Modelo
        uint256 year;                // Ano de fabricação
        string vehicleType;          // Tipo (sedan, SUV, truck, etc)
        uint256[] batteryIds;        // IDs das baterias instaladas
        string currentLocation;      // Localização atual
        address currentOwner;        // Proprietário atual
        uint256 manufacturingDate;   // Data de fabricação
        bool isActive;               // Status ativo
    }

    mapping(uint256 => Vehicle) public vehicles;
    mapping(string => uint256) public vinToVehicleId;
    mapping(uint256 => uint256[]) public batteryToVehicles;

    uint256 private vehicleCounter;

    event VehicleCreated(
        uint256 indexed vehicleId,
        string vin,
        string make,
        string model,
        address indexed manufacturer
    );

    event VehicleTransferred(
        uint256 indexed vehicleId,
        address indexed from,
        address indexed to
    );

    event VehicleLocationUpdated(
        uint256 indexed vehicleId,
        string location
    );

    constructor() ERC721("NiobiumVehicle", "NVEH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Cria um novo veículo
     */
    function createVehicle(
        string memory vin,
        string memory make,
        string memory model,
        uint256 year,
        string memory vehicleType,
        string memory tokenURI
    ) public onlyRole(MANUFACTURER_ROLE) whenNotPaused returns (uint256) {
        require(vinToVehicleId[vin] == 0, "VIN already exists");

        uint256 vehicleId = vehicleCounter;
        vehicleCounter++;

        _safeMint(msg.sender, vehicleId);
        _setTokenURI(vehicleId, tokenURI);

        vehicles[vehicleId] = Vehicle({
            vehicleId: vehicleId,
            vin: vin,
            make: make,
            model: model,
            year: year,
            vehicleType: vehicleType,
            batteryIds: new uint256[](0),
            currentLocation: make,
            currentOwner: msg.sender,
            manufacturingDate: block.timestamp,
            isActive: true
        });

        vinToVehicleId[vin] = vehicleId;

        emit VehicleCreated(vehicleId, vin, make, model, msg.sender);

        return vehicleId;
    }

    /**
     * @dev Transfere veículo para novo proprietário
     */
    function transferVehicle(uint256 vehicleId, address to) public onlyRole(OPERATOR_ROLE) {
        require(_ownerOf(vehicleId) != address(0), "Vehicle does not exist");
        require(vehicles[vehicleId].isActive, "Vehicle is not active");

        address from = vehicles[vehicleId].currentOwner;
        _safeTransfer(from, to, vehicleId);
        vehicles[vehicleId].currentOwner = to;

        emit VehicleTransferred(vehicleId, from, to);
    }

    /**
     * @dev Atualiza localização do veículo
     */
    function updateLocation(uint256 vehicleId, string memory location) public onlyRole(OPERATOR_ROLE) {
        require(vehicles[vehicleId].vehicleId != 0, "Vehicle does not exist");
        require(vehicles[vehicleId].isActive, "Vehicle is not active");

        vehicles[vehicleId].currentLocation = location;

        emit VehicleLocationUpdated(vehicleId, location);
    }

    /**
     * @dev Adiciona bateria ao veículo
     */
    function addBattery(uint256 vehicleId, uint256 batteryId) public onlyRole(OPERATOR_ROLE) {
        require(vehicles[vehicleId].vehicleId != 0, "Vehicle does not exist");
        require(vehicles[vehicleId].isActive, "Vehicle is not active");

        vehicles[vehicleId].batteryIds.push(batteryId);
        batteryToVehicles[batteryId].push(vehicleId);
    }

    /**
     * @dev Remove bateria do veículo
     */
    function removeBattery(uint256 vehicleId, uint256 batteryId) public onlyRole(OPERATOR_ROLE) {
        require(vehicles[vehicleId].vehicleId != 0, "Vehicle does not exist");

        // Remover do array
        uint256[] storage batteryIds = vehicles[vehicleId].batteryIds;
        for (uint256 i = 0; i < batteryIds.length; i++) {
            if (batteryIds[i] == batteryId) {
                batteryIds[i] = batteryIds[batteryIds.length - 1];
                batteryIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Obtém baterias de um veículo
     */
    function getVehicleBatteries(uint256 vehicleId) public view returns (uint256[] memory) {
        return vehicles[vehicleId].batteryIds;
    }

    /**
     * @dev Obtém o total de veículos criados
     */
    function getVehicleCount() public view returns (uint256) {
        return vehicleCounter;
    }

    /**
     * @dev Obtém todos os veículos (IDs)
     */
    function getAllVehicles() public view returns (uint256[] memory) {
        uint256[] memory vehicleIds = new uint256[](vehicleCounter);
        for (uint256 i = 0; i < vehicleCounter; i++) {
            vehicleIds[i] = i;
        }
        return vehicleIds;
    }

    /**
     * @dev Obtém veículos que usam uma bateria
     */
    function getBatteryVehicles(uint256 batteryId) public view returns (uint256[] memory) {
        return batteryToVehicles[batteryId];
    }

    // Override functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
