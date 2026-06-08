// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title CarbonCredit
 * @dev ERC1155 token para representar créditos de carbono gerados pelo uso de nióbio
 * @notice Cada token representa uma quantidade específica de CO2 evitada
 */
contract CarbonCredit is ERC1155, AccessControl, Pausable, ERC1155Supply {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Estrutura para metadados do crédito de carbono
    struct CarbonCreditData {
        uint256 niobiumBatchId;      // ID do lote de nióbio relacionado
        uint256 co2Avoided;          // Toneladas de CO2 evitadas
        string methodology;          // Metodologia de cálculo
        uint256 timestamp;           // Timestamp de criação
        bool verified;               // Status de verificação
        address verifier;            // Endereço do verificador
    }

    mapping(uint256 => CarbonCreditData) public creditData;
    uint256 private _creditIdCounter;

    event CreditMinted(
        uint256 indexed creditId,
        uint256 niobiumBatchId,
        uint256 co2Avoided,
        address indexed recipient
    );

    event CreditVerified(
        uint256 indexed creditId,
        address indexed verifier
    );

    event CreditRetired(
        uint256 indexed creditId,
        uint256 amount,
        address indexed retiree
    );

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Minta novos créditos de carbono
     * @param to Endereço que receberá os créditos
     * @param niobiumBatchId ID do lote de nióbio relacionado
     * @param co2Avoided Toneladas de CO2 evitadas
     * @param methodology Metodologia de cálculo utilizada
     * @param uri URI dos metadados IPFS
     */
    function mintCredit(
        address to,
        uint256 niobiumBatchId,
        uint256 co2Avoided,
        string memory methodology,
        string memory uri
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(to != address(0), "Invalid address");
        require(co2Avoided > 0, "CO2 avoided must be greater than 0");

        uint256 creditId = _creditIdCounter;
        _creditIdCounter++;

        _mint(to, creditId, co2Avoided, "");
        _setURI(creditId, uri);

        creditData[creditId] = CarbonCreditData({
            niobiumBatchId: niobiumBatchId,
            co2Avoided: co2Avoided,
            methodology: methodology,
            timestamp: block.timestamp,
            verified: false,
            verifier: address(0)
        });

        emit CreditMinted(creditId, niobiumBatchId, co2Avoided, to);

        return creditId;
    }

    /**
     * @dev Verifica um crédito de carbono (apenas auditores)
     * @param creditId ID do crédito
     */
    function verifyCredit(uint256 creditId) public onlyRole(AUDITOR_ROLE) {
        require(creditData[creditId].co2Avoided > 0, "Credit does not exist");
        require(!creditData[creditId].verified, "Credit already verified");

        creditData[creditId].verified = true;
        creditData[creditId].verifier = msg.sender;

        emit CreditVerified(creditId, msg.sender);
    }

    /**
     * @dev Aposenta (queima) créditos de carbono após uso
     * @param creditId ID do crédito
     * @param amount Quantidade a aposentar
     */
    function retireCredit(uint256 creditId, uint256 amount) public whenNotPaused {
        require(balanceOf(msg.sender, creditId) >= amount, "Insufficient balance");
        require(creditData[creditId].verified, "Credit must be verified before retirement");

        _burn(msg.sender, creditId, amount);

        emit CreditRetired(creditId, amount, msg.sender);
    }

    /**
     * @dev Define a URI para um ID específico
     */
    function _setURI(uint256 id, string memory newuri) internal {
        _uris[id] = newuri;
    }

    mapping(uint256 => string) private _uris;

    function uri(uint256 id) public view override returns (string memory) {
        return _uris[id];
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
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
