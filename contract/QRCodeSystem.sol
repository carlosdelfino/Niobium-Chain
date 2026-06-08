// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title QRCodeSystem
 * @dev Sistema de QR Code para rastreabilidade na blockchain
 * @notice Cada etapa tem um QR Code único que pode ser escaneado para verificação
 */
contract QRCodeSystem is AccessControl, Pausable {
    bytes32 public constant QR_GENERATOR_ROLE = keccak256("QR_GENERATOR_ROLE");
    bytes32 public constant QR_SCANNER_ROLE = keccak256("QR_SCANNER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct QRCode {
        uint256 qrId;                // ID único do QR Code
        string qrHash;                // Hash do QR Code
        uint256 stepId;              // ID da etapa relacionada
        uint256 batchId;             // ID do lote relacionado
        address generator;           // Endereço do gerador
        uint256 generatedAt;         // Timestamp de geração
        uint256 scannedAt;           // Timestamp de escaneamento
        address scannedBy;           // Endereço de quem escaneou
        bool isScanned;              // Status de escaneamento
        bool isValid;                // Status de validade
        string metadata;             // Metadados adicionais
        string location;             // Localização do escaneamento
    }

    mapping(uint256 => QRCode) public qrCodes;
    mapping(string => uint256) public qrHashToId;
    mapping(uint256 => uint256[]) public stepToQRCodes;
    mapping(uint256 => uint256[]) public batchToQRCodes;

    uint256 private qrCounter;

    event QRGenerated(
        uint256 indexed qrId,
        string qrHash,
        uint256 indexed stepId,
        address indexed generator
    );

    event QRScanned(
        uint256 indexed qrId,
        string qrHash,
        address indexed scanner,
        string location
    );

    event QRInvalidated(
        uint256 indexed qrId,
        address indexed invalidator
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(QR_GENERATOR_ROLE, msg.sender);
        _grantRole(QR_SCANNER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Gera um novo QR Code para uma etapa
     * @param stepId ID da etapa
     * @param batchId ID do lote
     * @param metadata Metadados adicionais
     */
    function generateQR(
        uint256 stepId,
        uint256 batchId,
        string memory metadata
    ) public onlyRole(QR_GENERATOR_ROLE) whenNotPaused returns (uint256) {
        uint256 qrId = qrCounter;
        qrCounter++;

        // Gerar hash único baseado em stepId, batchId, timestamp e gerador
        string memory qrHash = _generateQRHash(stepId, batchId, qrId, msg.sender);

        qrCodes[qrId] = QRCode({
            qrId: qrId,
            qrHash: qrHash,
            stepId: stepId,
            batchId: batchId,
            generator: msg.sender,
            generatedAt: block.timestamp,
            scannedAt: 0,
            scannedBy: address(0),
            isScanned: false,
            isValid: true,
            metadata: metadata,
            location: ""
        });

        qrHashToId[qrHash] = qrId;
        stepToQRCodes[stepId].push(qrId);
        batchToQRCodes[batchId].push(qrId);

        emit QRGenerated(qrId, qrHash, stepId, msg.sender);

        return qrId;
    }

    /**
     * @dev Escaneia um QR Code
     * @param qrHash Hash do QR Code
     * @param location Localização do escaneamento
     */
    function scanQR(
        string memory qrHash,
        string memory location
    ) public onlyRole(QR_SCANNER_ROLE) whenNotPaused {
        uint256 qrId = qrHashToId[qrHash];
        require(qrCodes[qrId].qrId != 0, "QR Code does not exist");
        require(qrCodes[qrId].isValid, "QR Code is invalid");
        require(!qrCodes[qrId].isScanned, "QR Code already scanned");

        qrCodes[qrId].isScanned = true;
        qrCodes[qrId].scannedAt = block.timestamp;
        qrCodes[qrId].scannedBy = msg.sender;
        qrCodes[qrId].location = location;

        emit QRScanned(qrId, qrHash, msg.sender, location);
    }

    /**
     * @dev Invalida um QR Code
     * @param qrId ID do QR Code
     */
    function invalidateQR(uint256 qrId) public onlyRole(VERIFIER_ROLE) {
        require(qrCodes[qrId].qrId != 0, "QR Code does not exist");
        require(qrCodes[qrId].isValid, "QR Code already invalid");

        qrCodes[qrId].isValid = false;

        emit QRInvalidated(qrId, msg.sender);
    }

    /**
     * @dev Verifica um QR Code
     * @param qrHash Hash do QR Code
     * @param signature Assinatura do gerador
     */
    function verifyQR(
        string memory qrHash,
        bytes memory signature
    ) public view returns (bool) {
        uint256 qrId = qrHashToId[qrHash];
        require(qrCodes[qrId].qrId != 0, "QR Code does not exist");

        // Verificar assinatura do gerador
        bytes32 messageHash = keccak256(abi.encodePacked(qrHash, qrCodes[qrId].stepId, qrCodes[qrId].batchId));
        address signer = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(messageHash), signature);

        return signer == qrCodes[qrId].generator && qrCodes[qrId].isValid;
    }

    /**
     * @dev Obtém QR Codes de uma etapa
     * @param stepId ID da etapa
     */
    function getQRCodesByStep(uint256 stepId) public view returns (uint256[] memory) {
        return stepToQRCodes[stepId];
    }

    /**
     * @dev Obtém QR Codes de um lote
     * @param batchId ID do lote
     */
    function getQRCodesByBatch(uint256 batchId) public view returns (uint256[] memory) {
        return batchToQRCodes[batchId];
    }

    /**
     * @dev Gera hash do QR Code
     */
    function _generateQRHash(
        uint256 stepId,
        uint256 batchId,
        uint256 qrId,
        address generator
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            "QR:",
            _toString(stepId),
            ":",
            _toString(batchId),
            ":",
            _toString(qrId),
            ":",
            _toString(uint256(uint160(generator))),
            ":",
            _toString(block.timestamp)
        ));
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
