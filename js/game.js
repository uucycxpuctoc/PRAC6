import { Board } from './board.js';
import { ChessUtils } from './utils.js';

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
