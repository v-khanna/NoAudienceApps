/**
 * PGN Parser and Chess Engine
 * Parses PGN text into structured data and tracks board positions.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface ParsedMove {
  san: string;           // Standard algebraic notation e.g. "Nf3"
  moveNumber: number;
  color: Color;
}

export interface PgnHeaders {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  eco?: string;
  opening?: string;
  [key: string]: string | undefined;
}

export interface ParsedGame {
  headers: PgnHeaders;
  moves: ParsedMove[];
  positions: Board[];    // Board state after each move (index 0 = starting position)
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILES = 'abcdefgh';
const RANKS = '12345678';

export const UNICODE_PIECES: Record<string, string> = {
  'wK': '\u2654', // ♔
  'wQ': '\u2655', // ♕
  'wR': '\u2656', // ♖
  'wB': '\u2657', // ♗
  'wN': '\u2658', // ♘
  'wP': '\u2659', // ♙
  'bK': '\u265A', // ♚
  'bQ': '\u265B', // ♛
  'bR': '\u265C', // ♜
  'bB': '\u265D', // ♝
  'bN': '\u265E', // ♞
  'bP': '\u265F', // ♟
};

export function pieceToUnicode(piece: Piece): string {
  return UNICODE_PIECES[piece.color + piece.type] ?? '?';
}

// ─── Board Setup ─────────────────────────────────────────────────────────────

export function createStartingPosition(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

  const backRank: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'w' };
    board[1][col] = { type: 'P', color: 'w' };
    board[6][col] = { type: 'P', color: 'b' };
    board[7][col] = { type: backRank[col], color: 'b' };
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(sq => sq ? { ...sq } : null));
}

// ─── Coordinate Helpers ─────────────────────────────────────────────────────

function fileToCol(file: string): number {
  return FILES.indexOf(file);
}

function rankToRow(rank: string): number {
  return parseInt(rank) - 1; // rank 1 = row 0 (white side)
}

function colToFile(col: number): string {
  return FILES[col];
}

function rowToRank(row: number): string {
  return RANKS[row];
}

// ─── Move Application ───────────────────────────────────────────────────────

interface MoveInfo {
  piece: PieceType;
  toRow: number;
  toCol: number;
  fromRow?: number;
  fromCol?: number;
  isCapture: boolean;
  promotion?: PieceType;
  isCastleKingside: boolean;
  isCastleQueenside: boolean;
}

function parseSanMove(san: string, color: Color): MoveInfo {
  let s = san.replace(/[+#!?]+$/, ''); // strip check/checkmate/annotations

  // Castling
  if (s === 'O-O' || s === '0-0') {
    return {
      piece: 'K', toRow: color === 'w' ? 0 : 7, toCol: 6,
      isCapture: false, isCastleKingside: true, isCastleQueenside: false,
    };
  }
  if (s === 'O-O-O' || s === '0-0-0') {
    return {
      piece: 'K', toRow: color === 'w' ? 0 : 7, toCol: 2,
      isCapture: false, isCastleKingside: false, isCastleQueenside: true,
    };
  }

  let promotion: PieceType | undefined;
  // Handle promotion: e8=Q or e8Q
  const promoMatch = s.match(/=?([QRBN])$/);
  if (promoMatch) {
    promotion = promoMatch[1] as PieceType;
    s = s.replace(/=?[QRBN]$/, '');
  }

  const isCapture = s.includes('x');
  s = s.replace('x', '');

  let piece: PieceType = 'P';
  if (s[0] >= 'A' && s[0] <= 'Z') {
    piece = s[0] as PieceType;
    s = s.slice(1);
  }

  // Last two chars are the destination square
  const toFile = s[s.length - 2];
  const toRank = s[s.length - 1];
  const toCol = fileToCol(toFile);
  const toRow = rankToRow(toRank);

  // Disambiguation: everything before the destination
  const disambig = s.slice(0, s.length - 2);
  let fromRow: number | undefined;
  let fromCol: number | undefined;

  for (const ch of disambig) {
    if (ch >= 'a' && ch <= 'h') {
      fromCol = fileToCol(ch);
    } else if (ch >= '1' && ch <= '8') {
      fromRow = rankToRow(ch);
    }
  }

  return { piece, toRow, toCol, fromRow, fromCol, isCapture, promotion, isCastleKingside: false, isCastleQueenside: false };
}

function findPiece(board: Board, piece: PieceType, color: Color, toRow: number, toCol: number, fromRow?: number, fromCol?: number): [number, number] {
  const candidates: [number, number][] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq || sq.type !== piece || sq.color !== color) continue;
      if (fromRow !== undefined && r !== fromRow) continue;
      if (fromCol !== undefined && c !== fromCol) continue;
      if (canReach(board, piece, color, r, c, toRow, toCol)) {
        candidates.push([r, c]);
      }
    }
  }

  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) {
    // Fallback: return first piece of that type (should not happen with valid PGN)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === piece && sq.color === color) {
          return [r, c];
        }
      }
    }
    return [0, 0]; // should never happen
  }
  // Multiple candidates — shouldn't happen with proper disambiguation
  return candidates[0];
}

function canReach(board: Board, piece: PieceType, color: Color, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  switch (piece) {
    case 'P': {
      const dir = color === 'w' ? 1 : -1;
      // Normal push
      if (dc === 0 && dr === dir && !board[toRow][toCol]) return true;
      // Double push
      if (dc === 0 && dr === 2 * dir && fromRow === (color === 'w' ? 1 : 6) && !board[fromRow + dir][fromCol] && !board[toRow][toCol]) return true;
      // Capture (including en passant)
      if (absDc === 1 && dr === dir) return true;
      return false;
    }
    case 'N':
      return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
    case 'B':
      if (absDr !== absDc || absDr === 0) return false;
      return isPathClear(board, fromRow, fromCol, toRow, toCol);
    case 'R':
      if (dr !== 0 && dc !== 0) return false;
      return isPathClear(board, fromRow, fromCol, toRow, toCol);
    case 'Q':
      if (dr !== 0 && dc !== 0 && absDr !== absDc) return false;
      return isPathClear(board, fromRow, fromCol, toRow, toCol);
    case 'K':
      return absDr <= 1 && absDc <= 1;
    default:
      return false;
  }
}

function isPathClear(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  const dr = Math.sign(toRow - fromRow);
  const dc = Math.sign(toCol - fromCol);
  let r = fromRow + dr;
  let c = fromCol + dc;
  while (r !== toRow || c !== toCol) {
    if (board[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
}

export function applyMove(board: Board, san: string, color: Color): Board {
  const newBoard = cloneBoard(board);
  const move = parseSanMove(san, color);

  if (move.isCastleKingside) {
    const row = move.toRow;
    newBoard[row][6] = newBoard[row][4]; // King to g
    newBoard[row][4] = null;
    newBoard[row][5] = newBoard[row][7]; // Rook to f
    newBoard[row][7] = null;
    return newBoard;
  }

  if (move.isCastleQueenside) {
    const row = move.toRow;
    newBoard[row][2] = newBoard[row][4]; // King to c
    newBoard[row][4] = null;
    newBoard[row][3] = newBoard[row][0]; // Rook to d
    newBoard[row][0] = null;
    return newBoard;
  }

  const [fromRow, fromCol] = findPiece(newBoard, move.piece, color, move.toRow, move.toCol, move.fromRow, move.fromCol);

  // En passant detection
  if (move.piece === 'P' && move.isCapture && !newBoard[move.toRow][move.toCol]) {
    // Captured pawn is on the same row as the moving pawn
    newBoard[fromRow][move.toCol] = null;
  }

  newBoard[move.toRow][move.toCol] = move.promotion
    ? { type: move.promotion, color }
    : newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;

  return newBoard;
}

// ─── PGN Parsing ─────────────────────────────────────────────────────────────

function parseHeaders(headerText: string): PgnHeaders {
  const headers: PgnHeaders = {};
  const regex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(headerText)) !== null) {
    const key = match[1].toLowerCase();
    headers[key] = match[2];
  }
  return headers;
}

function parseMoveText(moveText: string): string[] {
  // Remove comments
  let clean = moveText.replace(/\{[^}]*\}/g, '');
  // Remove variations
  clean = clean.replace(/\([^)]*\)/g, '');
  // Remove NAGs ($1, $2, etc.)
  clean = clean.replace(/\$\d+/g, '');
  // Remove result
  clean = clean.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');
  // Remove move numbers: "1." "1..." "12."
  clean = clean.replace(/\d+\.{1,3}\s*/g, '');
  // Split by whitespace and filter empty
  return clean.split(/\s+/).filter(s => s.length > 0);
}

export function parsePgn(pgnText: string): ParsedGame {
  // Split headers from moves
  const lines = pgnText.trim().split('\n');
  const headerLines: string[] = [];
  const moveLines: string[] = [];
  let pastHeaders = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!pastHeaders && trimmed.startsWith('[')) {
      headerLines.push(trimmed);
    } else {
      pastHeaders = true;
      if (trimmed.length > 0) {
        moveLines.push(trimmed);
      }
    }
  }

  const headers = parseHeaders(headerLines.join('\n'));
  const sanMoves = parseMoveText(moveLines.join(' '));

  const startingBoard = createStartingPosition();
  const positions: Board[] = [startingBoard];
  const moves: ParsedMove[] = [];

  let currentBoard = startingBoard;
  let moveNumber = 1;

  for (let i = 0; i < sanMoves.length; i++) {
    const color: Color = i % 2 === 0 ? 'w' : 'b';
    const san = sanMoves[i];

    moves.push({
      san,
      moveNumber: Math.floor(i / 2) + 1,
      color,
    });

    try {
      currentBoard = applyMove(currentBoard, san, color);
    } catch {
      // If move application fails, keep the current board
      currentBoard = cloneBoard(currentBoard);
    }
    positions.push(currentBoard);

    if (color === 'b') moveNumber++;
  }

  return { headers, moves, positions };
}

export function parseMultiPgn(text: string): ParsedGame[] {
  // Split by double newline before a header line
  const games: string[] = [];
  let current = '';

  for (const line of text.split('\n')) {
    if (line.trim().startsWith('[') && current.trim().length > 0 && !current.trim().endsWith(']') && !current.trim().endsWith('"]')) {
      // We found a header after move text — new game
      games.push(current.trim());
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  }
  if (current.trim().length > 0) {
    games.push(current.trim());
  }

  return games.map(g => parsePgn(g));
}
