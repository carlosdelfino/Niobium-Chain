// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title NiobiumDID
 * @dev Sistema de Identidade Descentralizada (DiD) para identificação de lotes de nióbio
 * @notice Cada lote tem uma DID única baseada em ECDSA para autenticação descentralizada
 */
contract NiobiumDID is AccessControl, EIP712 {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    bytes32 private constant TYPEHASH = keccak256(
        "NiobiumDIDDocument(string did,uint256 batchId,uint256 timestamp,address issuer)"
    );

    struct DIDDocument {
        string did;                  // Identificador DID único
        uint256 batchId;             // ID do lote relacionado
        address issuer;              // Endereço do emissor
        uint256 timestamp;           // Timestamp de criação
        bool revoked;                // Status de revogação
        string publicKey;            // Chave pública para verificação
        string[] authentication;     // Métodos de autenticação
        string[] serviceEndpoints;   // Endpoints de serviço
    }

    mapping(string => DIDDocument) public didDocuments;
    mapping(uint256 => string) public batchIdToDID;
    uint256 private didCounter;

    event DIDCreated(
        string indexed did,
        uint256 indexed batchId,
        address indexed issuer
    );

    event DIDRevoked(
        string indexed did,
        address indexed revoker
    );

    event DIDUpdated(
        string indexed did,
        address indexed updater
    );

    constructor() EIP712("NiobiumDID", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Cria um novo documento DID para um lote
     * @param batchId ID do lote de nióbio
     * @param publicKey Chave pública para verificação
     * @param authentication Métodos de autenticação
     * @param serviceEndpoints Endpoints de serviço
     */
    function createDID(
        uint256 batchId,
        string memory publicKey,
        string[] memory authentication,
        string[] memory serviceEndpoints
    ) public onlyRole(ISSUER_ROLE) returns (string memory) {
        string memory did = string(abi.encodePacked("did:niobium:", _toString(didCounter)));
        didCounter++;

        require(didDocuments[did].timestamp == 0, "DID already exists");
        require(bytes(batchIdToDID[batchId]).length == 0, "Batch already has DID");

        didDocuments[did] = DIDDocument({
            did: did,
            batchId: batchId,
            issuer: msg.sender,
            timestamp: block.timestamp,
            revoked: false,
            publicKey: publicKey,
            authentication: authentication,
            serviceEndpoints: serviceEndpoints
        });

        batchIdToDID[batchId] = did;

        emit DIDCreated(did, batchId, msg.sender);

        return did;
    }

    /**
     * @dev Revoga um documento DID
     * @param did Identificador DID
     */
    function revokeDID(string memory did) public onlyRole(ISSUER_ROLE) {
        require(didDocuments[did].timestamp != 0, "DID does not exist");
        require(!didDocuments[did].revoked, "DID already revoked");

        didDocuments[did].revoked = true;

        emit DIDRevoked(did, msg.sender);
    }

    /**
     * @dev Verifica uma assinatura DID
     * @param did Identificador DID
     * @param signature Assinatura ECDSA
     */
    function verifyDIDSignature(
        string memory did,
        bytes memory signature
    ) public view returns (bool) {
        DIDDocument memory doc = didDocuments[did];
        require(doc.timestamp != 0, "DID does not exist");
        require(!doc.revoked, "DID is revoked");

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            TYPEHASH,
            keccak256(bytes(doc.did)),
            doc.batchId,
            doc.timestamp,
            doc.issuer
        )));

        address signer = ECDSA.recover(digest, signature);
        return signer == doc.issuer;
    }

    /**
     * @dev Resolve um DID para seu documento
     * @param did Identificador DID
     */
    function resolveDID(string memory did) 
        public 
        view 
        returns (DIDDocument memory) 
    {
        require(didDocuments[did].timestamp != 0, "DID does not exist");
        return didDocuments[did];
    }

    /**
     * @dev Obtém DID de um lote
     * @param batchId ID do lote
     */
    function getDIDByBatch(uint256 batchId) public view returns (string memory) {
        return batchIdToDID[batchId];
    }

    /**
     * @dev Converte uint256 para string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
