/**
 * Chess data layer — mock implementation.
 * Uses mock data for now; will be replaced with tauri-plugin-sql calls.
 */

import { mockGames, getGameById as _getGameById, type ChessGame } from './mock';
import { parsePgn, parseMultiPgn, type ParsedGame } from './pgn';

// ─── Games ───────────────────────────────────────────────────────────────────

export function getGames(): ChessGame[] {
  return [...mockGames];
}

export function getGameById(id: number): ChessGame | undefined {
  return _getGameById(id);
}

export function searchGames(query: string): ChessGame[] {
  const q = query.toLowerCase();
  return mockGames.filter(
    (g) =>
      g.white.toLowerCase().includes(q) ||
      g.black.toLowerCase().includes(q) ||
      g.openingName.toLowerCase().includes(q)
  );
}

export function filterGames(opts: {
  query?: string;
  result?: string;
  color?: 'white' | 'black';
}): ChessGame[] {
  let games = [...mockGames];

  if (opts.query) {
    const q = opts.query.toLowerCase();
    games = games.filter(
      (g) =>
        g.white.toLowerCase().includes(q) ||
        g.black.toLowerCase().includes(q) ||
        g.openingName.toLowerCase().includes(q)
    );
  }

  if (opts.result) {
    games = games.filter((g) => g.result === opts.result);
  }

  if (opts.color) {
    games = games.filter((g) => g.yourColor === opts.color);
  }

  return games;
}

export function importPgn(pgnText: string): ChessGame[] {
  const parsed = parseMultiPgn(pgnText);
  const imported: ChessGame[] = [];

  for (const game of parsed) {
    const newGame: ChessGame = {
      id: mockGames.length + imported.length + 1,
      pgnText: pgnText,
      white: game.headers.white ?? 'Unknown',
      black: game.headers.black ?? 'Unknown',
      result: game.headers.result ?? '*',
      date: game.headers.date ?? '',
      openingEco: game.headers.eco ?? '',
      openingName: game.headers.opening ?? '',
      yourColor: null,
      annotations: null,
      createdAt: new Date().toISOString(),
    };
    mockGames.push(newGame);
    imported.push(newGame);
  }

  return imported;
}

export function getParsedGame(id: number): ParsedGame | null {
  const game = getGameById(id);
  if (!game) return null;
  return parsePgn(game.pgnText);
}

export type { ChessGame } from './mock';
