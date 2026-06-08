// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BatteryPassport
 * @dev ERC721 token para representar passaportes digitais de baterias (EU Battery Regulation)
 * @notice Cada token representa uma bateria com rastreabilidade completa de componentes
 */
contract BatteryPassport is ERC721, ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

    uint256 private _passportIdCounter;

    // Estrutura para componentes da bateria
    struct BatteryComponent {
        string componentType;        // Tipo (anodo, catodo, etc)
        uint256 niobiumBatchId;      // ID do lote de nióbio usado
        string supplier;             // Fornecedor
        uint256 weight;              // Peso em kg
        string origin;               // Origem do material
    }

    // Estrutura para metadados do passaporte da bateria
    struct BatteryData {
        string serialNumber;         // Número de série único
        address manufacturer;        // Fabricante
        string model;                // Modelo da bateria
        uint256 capacity;            // Capacidade em kWh
        uint256 manufacturingDate;   // Data de fabricação
        BatteryComponent[] components; // Lista de componentes
        uint256 carbonFootprint;     // Pegada de carbono em kg CO2eq
        uint256 recycledContent;     // Conteúdo reciclado em %
        bool isValid;                // Status de validade
    }

    mapping(uint256 => BatteryData) public batteries;
    mapping(string => uint256) public serialToPassportId;

    event PassportCreated(
        uint256 indexed passportId,
        string serialNumber,
        address indexed manufacturer
    );

    event ComponentAdded(
        uint256 indexed passportId,
        string componentType,
        uint256 niobiumBatchId
    );

    event PassportInvalidated(
        uint256 indexed passportId,
        address indexed invalidator
    );

    constructor() ERC721("BatteryPassport", "BATT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
    }

    /**
     * @dev Cria um novo passaporte de bateria
     * @param to Endereço que receberá o token
     * @param serialNumber Número de série único
     * @param model Modelo da bateria
     * @param capacity Capacidade em kWh
     * @param carbonFootprint Pegada de carbono em kg CO2eq
     * @param recycledContent Conteúdo reciclado em %
     * @param tokenURI URI dos metadados IPFS
     */
    function createPassport(
        address to,
        string memory serialNumber,
        string memory model,
        uint256 capacity,
        uint256 carbonFootprint,
        uint256 recycledContent,
        string memory tokenURI
    ) public onlyRole(MANUFACTURER_ROLE) whenNotPaused returns (uint256) {
        require(serialToPassportId[serialNumber] == 0, "Serial number already exists");
        require(to != address(0), "Invalid address");
        require(capacity > 0, "Capacity must be greater than 0");
        require(recycledContent <= 100, "Recycled content must be <= 100%");

        uint256 passportId = _passportIdCounter;
        _passportIdCounter++;

        _safeMint(to, passportId);
        _setTokenURI(passportId, tokenURI);

        BatteryData storage battery = batteries[passportId];
        battery.serialNumber = serialNumber;
        battery.manufacturer = to;
        battery.model = model;
        battery.capacity = capacity;
        battery.manufacturingDate = block.timestamp;
        battery.carbonFootprint = carbonFootprint;
        battery.recycledContent = recycledContent;
        battery.isValid = true;

        serialToPassportId[serialNumber] = passportId;

        emit PassportCreated(passportId, serialNumber, to);

        return passportId;
    }

    /**
     * @dev Adiciona um componente ao passaporte da bateria
     * @param passportId ID do passaporte
     * @param componentType Tipo do componente
     * @param niobiumBatchId ID do lote de nióbio
     * @param supplier Fornecedor
     * @param weight Peso em kg
     * @param origin Origem do material
     */
    function addComponent(
        uint256 passportId,
        string memory componentType,
        uint256 niobiumBatchId,
        string memory supplier,
        uint256 weight,
        string memory origin
    ) public onlyRole(MANUFACTURER_ROLE) {
        require(_ownerOf(passportId) != address(0), "Passport does not exist");
        require(batteries[passportId].isValid, "Passport is invalid");

        batteries[passportId].components.push(BatteryComponent({
            componentType: componentType,
            niobiumBatchId: niobiumBatchId,
            supplier: supplier,
            weight: weight,
            origin: origin
        }));

        emit ComponentAdded(passportId, componentType, niobiumBatchId);
    }

    /**
     * @dev Invalida um passaporte (em caso de recall ou defeito)
     * @param passportId ID do passaporte
     */
    function invalidatePassport(uint256 passportId) public onlyRole(ADMIN_ROLE) {
        require(_ownerOf(passportId) != address(0), "Passport does not exist");
        require(batteries[passportId].isValid, "Passport already invalid");

        batteries[passportId].isValid = false;

        emit PassportInvalidated(passportId, msg.sender);
    }

    /**
     * @dev Retorna o número de componentes de uma bateria
     */
    function getComponentCount(uint256 passportId) public view returns (uint256) {
        return batteries[passportId].components.length;
    }

    /**
     * @dev Retorna um componente específico
     */
    function getComponent(uint256 passportId, uint256 index) 
        public 
        view 
        returns (BatteryComponent memory) 
    {
        return batteries[passportId].components[index];
    }

    /**
     * @dev Pausa todas as operações em caso de emergência
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Despausa as operações
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
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
