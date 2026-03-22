/**
 * Chess data layer — real SQLite via Drizzle ORM.
 */

import { getDb } from '$lib/db';
import { chessGames } from '@noaudience/core/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { parsePgn, parseMultiPgn, type ParsedGame } from './pgn';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChessGame = typeof chessGames.$inferSelect;

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getGames(): Promise<ChessGame[]> {
  const db = getDb();
  return db.select().from(chessGames).orderBy(desc(chessGames.createdAt));
}

export async function getGameById(id: number): Promise<ChessGame | undefined> {
  const db = getDb();
  const rows = await db.select().from(chessGames).where(eq(chessGames.id, id)).limit(1);
  return rows[0];
}

export async function searchGames(query: string): Promise<ChessGame[]> {
  const db = getDb();
  const q = `%${query}%`;
  return db
    .select()
    .from(chessGames)
    .where(
      or(
        like(chessGames.white, q),
        like(chessGames.black, q),
        like(chessGames.openingName, q)
      )
    )
    .orderBy(desc(chessGames.createdAt));
}

export async function filterGames(opts: {
  query?: string;
  result?: string;
  color?: 'white' | 'black';
}): Promise<ChessGame[]> {
  const db = getDb();
  const conditions = [];

  if (opts.query) {
    const q = `%${opts.query}%`;
    conditions.push(
      or(
        like(chessGames.white, q),
        like(chessGames.black, q),
        like(chessGames.openingName, q)
      )!
    );
  }

  if (opts.result) {
    conditions.push(eq(chessGames.result, opts.result));
  }

  if (opts.color) {
    conditions.push(eq(chessGames.yourColor, opts.color));
  }

  let query = db.select().from(chessGames);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  return query.orderBy(desc(chessGames.createdAt));
}

export async function importPgn(pgnText: string): Promise<ChessGame[]> {
  const db = getDb();
  const parsed = parseMultiPgn(pgnText);
  const imported: ChessGame[] = [];

  for (const game of parsed) {
    // Reconstruct just this game's PGN text
    const headerLines = Object.entries(game.headers)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `[${k.charAt(0).toUpperCase() + k.slice(1)} "${v}"]`)
      .join('\n');
    const moveText = game.moves.map((m) => {
      const prefix = m.color === 'w' ? `${m.moveNumber}. ` : '';
      return prefix + m.san;
    }).join(' ');
    const gamePgn = `${headerLines}\n\n${moveText} ${game.headers.result ?? '*'}`;

    await db
      .insert(chessGames)
      .values({
        pgnText: gamePgn,
        white: game.headers.white ?? 'Unknown',
        black: game.headers.black ?? 'Unknown',
        result: game.headers.result ?? '*',
        date: game.headers.date ?? '',
        openingEco: game.headers.eco ?? '',
        openingName: game.headers.opening ?? '',
        yourColor: null,
        annotations: null,
      });

    // Fetch back the most recently inserted game
    const rows = await db
      .select()
      .from(chessGames)
      .orderBy(desc(chessGames.createdAt))
      .limit(1);
    if (rows[0]) {
      imported.push(rows[0] as ChessGame);
    }
  }

  return imported;
}

export async function deleteGame(id: number): Promise<void> {
  const db = getDb();
  await db.delete(chessGames).where(eq(chessGames.id, id));
}

export async function getParsedGame(id: number): Promise<ParsedGame | null> {
  const game = await getGameById(id);
  if (!game || !game.pgnText) return null;
  return parsePgn(game.pgnText);
}
