// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NiobiumToken
 * @dev ERC721 token para representar lotes de nióbio rastreáveis na blockchain
 * @notice Cada token representa um lote específico de nióbio com metadados imutáveis
 */
contract NiobiumToken is ERC721, ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _tokenIdCounter;

    // Estrutura para metadados do lote de nióbio
    struct NiobiumBatch {
        string batchId;              // ID único do lote físico
        address producer;            // Endereço do produtor
        uint256 weight;              // Peso em kg
        string purity;               // Pureza do material
        string origin;               // Origem geológica
        uint256 timestamp;           // Timestamp de criação
        bool isConflictFree;         // Certificação de minerais de conflito
        string miningLicense;        // Licença de mineração
    }

    mapping(uint256 => NiobiumBatch) public batches;
    mapping(string => uint256) public batchIdToTokenId;

    event BatchMinted(
        uint256 indexed tokenId,
        string batchId,
        address indexed producer,
        uint256 weight
    );

    event BatchTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    constructor() ERC721("NiobiumChain", "NIOB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Minta um novo token representando um lote de nióbio
     * @param to Endereço que receberá o token
     * @param batchId ID único do lote físico
     * @param weight Peso em kg
     * @param purity Pureza do material
     * @param origin Origem geológica
     * @param isConflictFree Certificação de minerais de conflito
     * @param miningLicense Licença de mineração
     * @param tokenURI URI dos metadados IPFS
     */
    function mintBatch(
        address to,
        string memory batchId,
        uint256 weight,
        string memory purity,
        string memory origin,
        bool isConflictFree,
        string memory miningLicense,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(batchIdToTokenId[batchId] == 0, "Batch ID already exists");
        require(to != address(0), "Invalid address");
        require(weight > 0, "Weight must be greater than 0");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        batches[tokenId] = NiobiumBatch({
            batchId: batchId,
            producer: to,
            weight: weight,
            purity: purity,
            origin: origin,
            timestamp: block.timestamp,
            isConflictFree: isConflictFree,
            miningLicense: miningLicense
        });

        batchIdToTokenId[batchId] = tokenId;

        emit BatchMinted(tokenId, batchId, to, weight);

        return tokenId;
    }

    /**
     * @dev Atualiza informações do produtor quando o lote é transferido
     * @param tokenId ID do token
     * @param newProducer Novo endereço do produtor
     */
    function updateProducer(uint256 tokenId, address newProducer) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        batches[tokenId].producer = newProducer;
    }

    /**
     * @dev Pausa todas as transferências em caso de emergência
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Despausa as transferências
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
