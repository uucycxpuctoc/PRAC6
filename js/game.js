// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
const ChessUtils = {
    notationToIndices: (notation) => {
        const col = notation.charCodeAt(0) - 97;
        const row = 8 - parseInt(notation[1]);
        return { row, col };
    },
    
    indicesToNotation: (row, col) => {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    },
    
    isValidPosition: (row, col) => {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },
    
    PIECE_SYMBOLS: {
        white: {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        },
        black: {
            king: '♚',
            queen: '♛',
            rook: '♜',
            bishop: '♝',
            knight: '♞',
            pawn: '♟'
        }
    },
    
    getPieceSymbol: (piece) => {
        if (!piece) return '';
        return ChessUtils.PIECE_SYMBOLS[piece.color][piece.type];
    }
};

// ==================== КЛАССЫ ФИГУР ====================
class Piece {
    constructor(color, type, position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }
    
    getValidMoves(board, currentPosition) {
        return [];
    }
    
    clone() {
        return new Piece(this.color, this.type, { ...this.position });
    }
}

class Pawn extends Piece {
    constructor(color, position) {
        super(color, 'pawn', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;
        const { row, col } = currentPosition;
        
        const newRow = row + direction;
        if (ChessUtils.isValidPosition(newRow, col) && !board.getPiece(newRow, col)) {
            moves.push({ row: newRow, col });
            
            const twoStepsRow = row + (direction * 2);
            if (row === startRow && !board.getPiece(twoStepsRow, col) && !board.getPiece(newRow, col)) {
                moves.push({ row: twoStepsRow, col });
            }
        }
        
        const captureCols = [col - 1, col + 1];
        for (const captureCol of captureCols) {
            const captureRow = row + direction;
            if (ChessUtils.isValidPosition(captureRow, captureCol)) {
                const targetPiece = board.getPiece(captureRow, captureCol);
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row: captureRow, col: captureCol });
                }
            }
        }
        
        return moves;
    }
}

class Rook extends Piece {
    constructor(color, position) {
        super(color, 'rook', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

class Knight extends Piece {
    constructor(color, position) {
        super(color, 'knight', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [rowMove, colMove] of knightMoves) {
            const newRow = currentPosition.row + rowMove;
            const newCol = currentPosition.col + colMove;
            
            if (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece || piece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
}

class Bishop extends Piece {
    constructor(color, position) {
        super(color, 'bishop', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

class Queen extends Piece {
    constructor(color, position) {
        super(color, 'queen', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

class King extends Piece {
    constructor(color, position) {
        super(color, 'king', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [rowMove, colMove] of kingMoves) {
            const newRow = currentPosition.row + rowMove;
            const newCol = currentPosition.col + colMove;
            
            if (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece || piece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
}

// ==================== КЛАСС ДОСКИ ====================
class Board {
    constructor() {
        this.cells = this.initializeBoard();
        this.history = [];
    }
    
    initializeBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                board[row][col] = null;
            }
        }
        return board;
    }
    
    setupInitialPosition() {
        this.cells = this.initializeBoard();
        
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', { row: 1, col });
            this.cells[6][col] = new Pawn('white', { row: 6, col });
        }
        
        const backRow = [
            Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook
        ];
        
        for (let col = 0; col < 8; col++) {
            const BlackPieceClass = backRow[col];
            const WhitePieceClass = backRow[col];
            this.cells[0][col] = new BlackPieceClass('black', { row: 0, col });
            this.cells[7][col] = new WhitePieceClass('white', { row: 7, col });
        }
    }
    
    getPiece(row, col) {
        if (!ChessUtils.isValidPosition(row, col)) return null;
        return this.cells[row][col];
    }
    
    setPiece(row, col, piece) {
        if (piece) {
            piece.position = { row, col };
        }
        this.cells[row][col] = piece;
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;
        
        const capturedPiece = this.getPiece(toRow, toCol);
        
        this.history.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });
        
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.promotePawn(toRow, toCol, piece.color);
        }
        
        return true;
    }
    
    promotePawn(row, col, color) {
        this.setPiece(row, col, new Queen(color, { row, col }));
    }
    
    undoMove() {
        if (this.history.length === 0) return false;
        
        const lastMove = this.history.pop();
        
        this.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        this.setPiece(lastMove.to.row, lastMove.to.col, lastMove.captured);
        
        return true;
    }
    
    getAllPieces() {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    pieces.push({
                        piece,
                        position: { row, col }
                    });
                }
            }
        }
        return pieces;
    }
    
    clone() {
        const newBoard = new Board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    let newPiece;
                    switch(piece.type) {
                        case 'pawn': newPiece = new Pawn(piece.color, { row, col }); break;
                        case 'rook': newPiece = new Rook(piece.color, { row, col }); break;
                        case 'knight': newPiece = new Knight(piece.color, { row, col }); break;
                        case 'bishop': newPiece = new Bishop(piece.color, { row, col }); break;
                        case 'queen': newPiece = new Queen(piece.color, { row, col }); break;
                        case 'king': newPiece = new King(piece.color, { row, col }); break;
                    }
                    newBoard.setPiece(row, col, newPiece);
                }
            }
        }
        return newBoard;
    }
    
    isSquareAttacked(row, col, color) {
        const oppositeColor = color === 'white' ? 'black' : 'white';
        const pieces = this.getAllPieces();
        
        for (const { piece, position } of pieces) {
            if (piece.color === oppositeColor) {
                const moves = piece.getValidMoves(this, position);
                if (moves.some(move => move.row === row && move.col === col)) {
                    return true;
                }
            }
        }
        return false;
    }
}

// ==================== ОСНОВНОЙ КЛАСС ИГРЫ ====================
class Game {
    constructor() {
        this.board = new Board();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.checkStatus = false;
        
        this.init();
    }
    
    init() {
        this.board.setupInitialPosition();
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }
    
    renderBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                const isLight = (row + col) % 2 === 0;
                const cell = document.createElement('div');
                cell.className = `cell ${isLight ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (piece) {
                    cell.textContent = ChessUtils.getPieceSymbol(piece);
                }
                
                if (this.selectedPosition && 
                    this.selectedPosition.row === row && 
                    this.selectedPosition.col === col) {
                    cell.classList.add('selected');
                }
                
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    const targetPiece = this.board.getPiece(row, col);
                    if (targetPiece && targetPiece.color !== this.currentTurn) {
                        cell.classList.add('highlight-capture');
                    } else {
                        cell.classList.add('highlight-move');
                    }
                }
                
                if (this.checkStatus) {
                    const kingPiece = this.findKing(this.currentTurn);
                    if (kingPiece && kingPiece.row === row && kingPiece.col === col) {
                        cell.classList.add('check');
                    }
                }
                
                boardElement.appendChild(cell);
            }
        }
        
        this.addCoordinates();
    }
    
    addCoordinates() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const notation = ChessUtils.indicesToNotation(row, col);
            cell.setAttribute('data-coord', notation);
        });
    }
    
    setupEventListeners() {
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            boardElement.addEventListener('click', (e) => {
                if (this.gameOver) return;
                
                const cell = e.target.closest('.cell');
                if (!cell) return;
                
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                this.handleCellClick(row, col);
            });
        }
        
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoMove();
            });
        }
    }
    
    handleCellClick(row, col) {
        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);
            
            if (isValidMove) {
                this.makeMove(this.selectedPosition.row, this.selectedPosition.col, row, col);
                this.clearSelection();
            } else {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === this.currentTurn) {
                    this.selectPiece(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            const piece = this.board.getPiece(row, col);
            if (piece && piece.color === this.currentTurn && !this.gameOver) {
                this.selectPiece(row, col);
            }
        }
    }
    
    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return;
        
        this.selectedPiece = piece;
        this.selectedPosition = { row, col };
        
        const allMoves = piece.getValidMoves(this.board, { row, col });
        
        this.validMoves = allMoves.filter(move => {
            return !this.wouldBeInCheck(piece, move.row, move.col);
        });
        
        this.renderBoard();
    }
    
    wouldBeInCheck(piece, toRow, toCol) {
        const testBoard = this.board.clone();
        const fromRow = piece.position.row;
        const fromCol = piece.position.col;
        
        const testPiece = testBoard.getPiece(fromRow, fromCol);
        
        testBoard.setPiece(toRow, toCol, testPiece);
        testBoard.setPiece(fromRow, fromCol, null);
        
        if (testPiece) {
            testPiece.position = { row: toRow, col: toCol };
        }
        
        const kingPosition = this.findKingOnBoard(piece.color, testBoard);
        if (!kingPosition) return true;
        
        return testBoard.isSquareAttacked(kingPosition.row, kingPosition.col, piece.color);
    }
    
    findKingOnBoard(color, board) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    findKing(color) {
        return this.findKingOnBoard(color, this.board);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece) return false;
        
        const capturedPiece = this.board.getPiece(toRow, toCol);
        
        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        const kingPosition = this.findKing(this.currentTurn);
        if (this.board.isSquareAttacked(kingPosition.row, kingPosition.col, this.currentTurn)) {
            this.board.undoMove();
            this.showMessage('Нельзя оставлять короля под шахом!');
            return false;
        }
        
        this.updateCapturedPieces(capturedPiece);
        
        const oppositeColor = this.currentTurn === 'white' ? 'black' : 'white';
        this.checkStatus = this.isCheck(oppositeColor);
        
        if (this.isCheckmate()) {
            this.gameOver = true;
            this.winner = this.currentTurn === 'white' ? 'black' : 'white';
            this.showMessage(`${this.winner === 'white' ? 'Белые' : 'Черные'} победили! Мат!`);
            this.renderBoard();
            this.updateUI();
            return true;
        }
        
        this.switchTurn();
        
        this.checkStatus = this.isCheck(this.currentTurn);
        if (this.checkStatus) {
            this.showMessage('Шах!');
        }
        
        this.renderBoard();
        this.updateUI();
        
        return true;
    }
    
    isCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;
        return this.board.isSquareAttacked(kingPosition.row, kingPosition.col, color);
    }
    
    isCheckmate() {
        const pieces = this.board.getAllPieces();
        const currentColor = this.currentTurn;
        
        for (const { piece, position } of pieces) {
            if (piece.color === currentColor) {
                const moves = piece.getValidMoves(this.board, position);
                const legalMoves = moves.filter(move => {
                    return !this.wouldBeInCheck(piece, move.row, move.col);
                });
                
                if (legalMoves.length > 0) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    switchTurn() {
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.renderBoard();
    }
    
    updateUI() {
        const currentPlayerElement = document.querySelector('.current-player');
        const turnIndicator = document.querySelector('.turn-color-indicator');
        
        if (currentPlayerElement) {
            currentPlayerElement.textContent = this.currentTurn === 'white' ? 'Белые' : 'Черные';
        }
        
        if (turnIndicator) {
            turnIndicator.className = `turn-color-indicator ${this.currentTurn}-turn`;
        }
        
        if (this.gameOver) {
            const statusMessage = document.querySelector('.status-message');
            if (statusMessage) {
                statusMessage.textContent = `Игра окончена! ${this.winner === 'white' ? 'Белые' : 'Черные'} победили!`;
            }
        }
    }
    
    showMessage(message) {
        const statusMessage = document.querySelector('.status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            setTimeout(() => {
                if (!this.gameOver && statusMessage.textContent === message) {
                    statusMessage.textContent = '';
                }
            }, 2000);
        }
    }
    
    updateCapturedPieces(capturedPiece) {
        if (!capturedPiece) return;
        
        const symbol = ChessUtils.getPieceSymbol(capturedPiece);
        const container = capturedPiece.color === 'white' ? 
            '.captured-white' : '.captured-black';
        
        const capturedContainer = document.querySelector(container);
        if (capturedContainer) {
            const pieceSpan = document.createElement('span');
            pieceSpan.textContent = symbol;
            pieceSpan.style.fontSize = '1.5rem';
            pieceSpan.style.margin = '0 2px';
            capturedContainer.appendChild(pieceSpan);
        }
    }
    
    resetGame() {
        this.board = new Board();
        this.board.setupInitialPosition();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.checkStatus = false;
        
        const capturedWhite = document.querySelector('.captured-white');
        const capturedBlack = document.querySelector('.captured-black');
        const statusMessage = document.querySelector('.status-message');
        
        if (capturedWhite) capturedWhite.innerHTML = '';
        if (capturedBlack) capturedBlack.innerHTML = '';
        if (statusMessage) statusMessage.textContent = '';
        
        this.renderBoard();
        this.updateUI();
    }
    
    undoMove() {
        if (this.gameOver) return;
        
        const undone = this.board.undoMove();
        if (undone) {
            this.switchTurn();
            this.clearSelection();
            this.checkStatus = this.isCheck(this.currentTurn);
            this.renderBoard();
            this.updateUI();
        }
    }
}

// Запуск игры после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
