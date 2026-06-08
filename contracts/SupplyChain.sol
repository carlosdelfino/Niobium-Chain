// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SupplyChain
 * @dev Sistema de Supply Chain flexível com workflow configurável
 * @notice Suporta múltiplas etapas dinâmicas para rastreabilidade completa
 */
contract SupplyChain is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Tipos de etapas da cadeia de suprimentos
    enum StepType {
        MINING,           // Mineração
        TRANSPORT,        // Transporte terrestre
        PROCESSING,       // Processamento químico
        PACKAGING,        // Empacotamento
        PORT_LOADING,     // Carregamento em porto
        SHIPPING,         // Embarque/navio
        PORT_UNLOADING,   // Descarregamento em porto destino
        FINAL_TRANSPORT,  // Transporte para destino final
        MANUFACTURING,    // Fabricação de baterias
        ASSEMBLY,         // Montagem em veículos
        DELIVERY          // Entrega final
    }

    // Status de uma etapa
    enum StepStatus {
        PENDING,          // Aguardando
        IN_PROGRESS,      // Em andamento
        COMPLETED,        // Concluída
        FAILED,           // Falhou
        SKIPPED           // Pulada (rotas alternativas)
    }

    // Estrutura de uma etapa
    struct SupplyChainStep {
        uint256 stepId;               // ID único da etapa
        StepType stepType;            // Tipo da etapa
        StepStatus status;            // Status atual
        uint256 batchId;              // ID do lote relacionado
        address operator;             // Operador responsável
        uint256 startTime;            // Timestamp de início
        uint256 endTime;              // Timestamp de fim
        string location;              // Localização
        string qrCodeHash;            // Hash do QR Code
        string cvDataHash;            // Hash dos dados de Computer Vision
        string metadata;              // Metadados adicionais
        uint256[] previousSteps;      // Etapas anteriores (workflow flexível)
        uint256[] nextSteps;          // Próximas etapas (workflow flexível)
    }

    // Estrutura de um lote
    struct Batch {
        uint256 batchId;              // ID único do lote
        string did;                   // DID do lote
        uint256 currentStepId;        // Etapa atual
        uint256[] stepHistory;        // Histórico de etapas
        address creator;              // Criador do lote
        uint256 createdAt;            // Timestamp de criação
        bool isActive;                // Status ativo
    }

    mapping(uint256 => SupplyChainStep) public steps;
    mapping(uint256 => Batch) public batches;
    mapping(string => uint256) public qrCodeToStepId;
    mapping(address => bool) public authorizedOperators;

    uint256 private stepCounter;
    uint256 private batchCounter;

    event StepCreated(
        uint256 indexed stepId,
        StepType stepType,
        uint256 indexed batchId,
        address indexed operator
    );

    event StepUpdated(
        uint256 indexed stepId,
        StepStatus status,
        address indexed operator
    );

    event BatchCreated(
        uint256 indexed batchId,
        string did,
        address indexed creator
    );

    event QRCodeScanned(
        uint256 indexed stepId,
        string qrCodeHash,
        address indexed scanner
    );

    event CVDataVerified(
        uint256 indexed stepId,
        string cvDataHash,
        bool verified
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Cria um novo lote na cadeia de suprimentos
     * @param did DID do lote
     * @param initialStepType Tipo da etapa inicial
     * @param location Localização inicial
     */
    function createBatch(
        string memory did,
        StepType initialStepType,
        string memory location,
        string memory observation
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(observation).length <= 140, "Observation exceeds 140 chars");
        uint256 batchId = batchCounter;
        batchCounter++;

        // Criar etapa inicial
        uint256 stepId = _createStep(
            initialStepType,
            batchId,
            msg.sender,
            location,
            observation,
            new uint256[](0)
        );

        batches[batchId] = Batch({
            batchId: batchId,
            did: did,
            currentStepId: stepId,
            stepHistory: new uint256[](0),
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true
        });

        batches[batchId].stepHistory.push(stepId);

        emit BatchCreated(batchId, did, msg.sender);

        return batchId;
    }

    /**
     * @dev Cria uma nova etapa para um lote
     * @param stepType Tipo da etapa
     * @param batchId ID do lote
     * @param location Localização
     * @param observation Observação livre (máx. 140 caracteres)
     * @param previousSteps IDs das etapas anteriores (workflow flexível)
     */
    function createStep(
        StepType stepType,
        uint256 batchId,
        string memory location,
        string memory observation,
        uint256[] memory previousSteps
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(batches[batchId].isActive, "Batch is not active");
        require(bytes(observation).length <= 140, "Observation exceeds 140 chars");

        uint256 stepId = _createStep(stepType, batchId, msg.sender, location, observation, previousSteps);

        // Atualizar lote
        batches[batchId].currentStepId = stepId;
        batches[batchId].stepHistory.push(stepId);

        // Vincular etapas no workflow
        for (uint256 i = 0; i < previousSteps.length; i++) {
            steps[previousSteps[i]].nextSteps.push(stepId);
        }

        return stepId;
    }

    /**
     * @dev Função interna para criar etapa
     */
    function _createStep(
        StepType stepType,
        uint256 batchId,
        address operator,
        string memory location,
        string memory observation,
        uint256[] memory previousSteps
    ) internal returns (uint256) {
        uint256 stepId = stepCounter;
        stepCounter++;

        steps[stepId] = SupplyChainStep({
            stepId: stepId,
            stepType: stepType,
            status: StepStatus.PENDING,
            batchId: batchId,
            operator: operator,
            startTime: 0,
            endTime: 0,
            location: location,
            qrCodeHash: "",
            cvDataHash: "",
            metadata: observation,
            previousSteps: previousSteps,
            nextSteps: new uint256[](0)
        });

        emit StepCreated(stepId, stepType, batchId, operator);

        return stepId;
    }

    /**
     * @dev Inicia uma etapa
     * @param stepId ID da etapa
     * @param qrCodeHash Hash do QR Code escaneado
     */
    function startStep(
        uint256 stepId,
        string memory qrCodeHash
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(steps[stepId].stepId != 0, "Step does not exist");
        require(steps[stepId].status == StepStatus.PENDING, "Step not pending");
        require(steps[stepId].operator == msg.sender, "Not authorized operator");

        steps[stepId].status = StepStatus.IN_PROGRESS;
        steps[stepId].startTime = block.timestamp;
        steps[stepId].qrCodeHash = qrCodeHash;

        qrCodeToStepId[qrCodeHash] = stepId;

        emit StepUpdated(stepId, StepStatus.IN_PROGRESS, msg.sender);
        emit QRCodeScanned(stepId, qrCodeHash, msg.sender);
    }

    /**
     * @dev Completa uma etapa
     * @param stepId ID da etapa
     * @param cvDataHash Hash dos dados de Computer Vision
     * @param metadata Metadados adicionais
     */
    function completeStep(
        uint256 stepId,
        string memory cvDataHash,
        string memory metadata
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(steps[stepId].stepId != 0, "Step does not exist");
        require(steps[stepId].status == StepStatus.IN_PROGRESS, "Step not in progress");
        require(steps[stepId].operator == msg.sender, "Not authorized operator");

        steps[stepId].status = StepStatus.COMPLETED;
        steps[stepId].endTime = block.timestamp;
        steps[stepId].cvDataHash = cvDataHash;
        steps[stepId].metadata = metadata;

        emit StepUpdated(stepId, StepStatus.COMPLETED, msg.sender);
        emit CVDataVerified(stepId, cvDataHash, true);
    }

    /**
     * @dev Marca etapa como falha
     * @param stepId ID da etapa
     * @param reason Razão da falha
     */
    function failStep(uint256 stepId, string memory reason) public onlyRole(OPERATOR_ROLE) {
        require(steps[stepId].stepId != 0, "Step does not exist");
        require(steps[stepId].status == StepStatus.IN_PROGRESS, "Step not in progress");
        require(steps[stepId].operator == msg.sender, "Not authorized operator");

        steps[stepId].status = StepStatus.FAILED;
        steps[stepId].metadata = reason;

        emit StepUpdated(stepId, StepStatus.FAILED, msg.sender);
    }

    /**
     * @dev Pula uma etapa (para rotas alternativas)
     * @param stepId ID da etapa
     */
    function skipStep(uint256 stepId) public onlyRole(ADMIN_ROLE) {
        require(steps[stepId].stepId != 0, "Step does not exist");
        require(steps[stepId].status == StepStatus.PENDING, "Step not pending");

        steps[stepId].status = StepStatus.SKIPPED;

        emit StepUpdated(stepId, StepStatus.SKIPPED, msg.sender);
    }

    /**
     * @dev Adiciona próxima etapa ao workflow
     * @param stepId ID da etapa atual
     * @param nextStepId ID da próxima etapa
     */
    function addNextStep(uint256 stepId, uint256 nextStepId) public onlyRole(ADMIN_ROLE) {
        require(steps[stepId].stepId != 0, "Step does not exist");
        require(steps[nextStepId].stepId != 0, "Next step does not exist");

        steps[stepId].nextSteps.push(nextStepId);
        steps[nextStepId].previousSteps.push(stepId);
    }

    /**
     * @dev Obtém histórico completo de um lote
     * @param batchId ID do lote
     */
    function getBatchHistory(uint256 batchId) 
        public 
        view 
        returns (SupplyChainStep[] memory) 
    {
        uint256[] memory stepIds = batches[batchId].stepHistory;
        SupplyChainStep[] memory history = new SupplyChainStep[](stepIds.length);

        for (uint256 i = 0; i < stepIds.length; i++) {
            history[i] = steps[stepIds[i]];
        }

        return history;
    }

    /**
     * @dev Obtém próxima etapa possível
     * @param stepId ID da etapa atual
     */
    function getNextSteps(uint256 stepId) public view returns (uint256[] memory) {
        return steps[stepId].nextSteps;
    }

    /**
     * @dev Verifica se um QR Code já foi escaneado
     * @param qrCodeHash Hash do QR Code
     */
    function isQRCodeScanned(string memory qrCodeHash) public view returns (bool) {
        return qrCodeToStepId[qrCodeHash] != 0;
    }

    /**
     * @dev Obtém etapa por QR Code
     * @param qrCodeHash Hash do QR Code
     */
    function getStepByQRCode(string memory qrCodeHash) public view returns (uint256) {
        return qrCodeToStepId[qrCodeHash];
    }

    /**
     * @dev Verifica se uma etapa existe
     * @param stepId ID da etapa
     */
    function stepExists(uint256 stepId) public view returns (bool) {
        return steps[stepId].stepId != 0;
    }
}
