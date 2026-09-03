import { eq, asc, and, inArray, type SQL } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game, Category, Publisher } from '../types/game';

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/** Optional criteria for narrowing {@link getGames} results. */
export interface GameFilters {
    /** Game must belong to one of these category ids (ids are OR'd together). */
    categoryIds?: number[];
    /** Game must belong to one of these publisher ids (ids are OR'd together). */
    publisherIds?: number[];
}

/**
 * Games matching the given filters, ordered by title.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @param filters Optional category/publisher id filters. A game must match at least one id
 * within each provided list (categories and publishers are AND'd together when both are given);
 * omitting a filter or passing an empty array leaves that dimension unfiltered.
 * @returns Games with their category and publisher relations, ordered by title.
 */
export async function getGames(db: Database, filters: GameFilters = {}): Promise<Game[]> {
    const conditions: SQL[] = [];
    if (filters.categoryIds?.length) {
        conditions.push(inArray(games.categoryId, filters.categoryIds));
    }
    if (filters.publisherIds?.length) {
        conditions.push(inArray(games.publisherId, filters.publisherIds));
    }

    const query = baseGamesQuery(db);
    const rows = await (conditions.length ? query.where(and(...conditions)) : query).orderBy(
        asc(games.title),
    );
    return rows.map(mapGame);
}

/**
 * All games ordered by title.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @returns All games with their category and publisher relations, ordered by title.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    return getGames(db);
}

/**
 * All game ids ordered by title.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @returns All game ids, ordered by title.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * All categories ordered by name, for populating filter option lists.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @returns All categories, ordered by name.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    return db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
}

/**
 * All publishers ordered by name, for populating filter option lists.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @returns All publishers, ordered by name.
 */
export async function getAllPublishers(db: Database): Promise<Publisher[]> {
    return db.select({ id: publishers.id, name: publishers.name }).from(publishers).orderBy(asc(publishers.name));
}

/**
 * A single game by id, or null when it does not exist.
 *
 * @param db Drizzle database client (injectable so tests can pass an in-memory instance).
 * @param id Game id to look up.
 * @returns The matching game with its relations, or `null` if no game has that id.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
