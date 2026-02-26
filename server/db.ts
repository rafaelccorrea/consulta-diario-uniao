import { eq, sql, and, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, InsertArticle } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get articles with optional filters
 */
export async function getArticles({
  query,
  section,
  dateFrom,
  dateTo,
  limit = 50,
  offset = 0,
}: {
  query?: string;
  section?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get articles: database not available");
    return [];
  }

  try {
    let conditions: any[] = [];

    // Search by title or summary
    if (query) {
      const searchPattern = `%${query}%`;
      conditions.push(
        or(
          like(articles.title, searchPattern),
          like(articles.summary, searchPattern)
        )
      );
    }

    // Filter by section
    if (section && section !== "Todas") {
      conditions.push(eq(articles.section, section));
    }

    // Filter by date range
    if (dateFrom) {
      conditions.push(sql`${articles.date} >= ${dateFrom}`);
    }
    if (dateTo) {
      conditions.push(sql`${articles.date} <= ${dateTo}`);
    }

    let query_builder = db.select().from(articles);

    if (conditions.length > 0) {
      query_builder = query_builder.where(and(...conditions)) as any;
    }

    // Order by date descending and apply pagination
    const results = await query_builder
      .orderBy(sql`${articles.date} DESC`)
      .limit(limit)
      .offset(offset);

    return results;
  } catch (error) {
    console.error("[Database] Failed to get articles:", error);
    return [];
  }
}

/**
 * Get total count of articles matching filters
 */
export async function getArticlesCount({
  query,
  section,
  dateFrom,
  dateTo,
}: {
  query?: string;
  section?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count articles: database not available");
    return 0;
  }

  try {
    let conditions: any[] = [];

    if (query) {
      const searchPattern = `%${query}%`;
      conditions.push(
        or(
          like(articles.title, searchPattern),
          like(articles.summary, searchPattern)
        )
      );
    }

    if (section && section !== "Todas") {
      conditions.push(eq(articles.section, section));
    }

    if (dateFrom) {
      conditions.push(sql`${articles.date} >= ${dateFrom}`);
    }
    if (dateTo) {
      conditions.push(sql`${articles.date} <= ${dateTo}`);
    }

    let query_builder: any = db.select({ count: sql`COUNT(*) as cnt` }).from(articles);

    if (conditions.length > 0) {
      query_builder = query_builder.where(and(...conditions));
    }

    const result = await query_builder;
    return (result[0]?.count as number) || 0;
  } catch (error) {
    console.error("[Database] Failed to count articles:", error);
    return 0;
  }
}

/**
 * Insert or update an article
 */
export async function upsertArticle(article: InsertArticle): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert article: database not available");
    return;
  }

  try {
    await db.insert(articles).values(article).onDuplicateKeyUpdate({
      set: {
        title: article.title,
        url: article.url,
        section: article.section,
        date: article.date,
        summary: article.summary,
        fullText: article.fullText,
        fetchedAt: article.fetchedAt,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert article:", error);
    throw error;
  }
}

/**
 * Get unique sections
 */
export async function getUniqueSections(): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sections: database not available");
    return [];
  }

  try {
    const results = await db
      .selectDistinct({ section: articles.section })
      .from(articles)
      .where(sql`${articles.section} IS NOT NULL`);

    return results.map(r => r.section).filter(Boolean) as string[];
  } catch (error) {
    console.error("[Database] Failed to get sections:", error);
    return [];
  }
}
