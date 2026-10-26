import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class ReleaseIndex {
  constructor(path = ':memory:') {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS releases (hash TEXT PRIMARY KEY, title TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, source TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS media_releases (media TEXT NOT NULL, hash TEXT NOT NULL REFERENCES releases(hash), verified INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(media,hash));
      CREATE TABLE IF NOT EXISTS metadata (media TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS release_title ON releases(title);`);
    if(!this.db.prepare('PRAGMA table_info(media_releases)').all().some(column=>column.name==='verified'))this.db.exec('ALTER TABLE media_releases ADD COLUMN verified INTEGER NOT NULL DEFAULT 1');
  }

  import(rows, source) {
    const release = this.db.prepare('INSERT INTO releases VALUES(?,?,?,?,?) ON CONFLICT(hash) DO UPDATE SET title=excluded.title,size=MAX(releases.size,excluded.size),updated_at=excluded.updated_at');
    const map = this.db.prepare('INSERT INTO media_releases(media,hash,verified) VALUES(?,?,?) ON CONFLICT(media,hash) DO UPDATE SET verified=MAX(media_releases.verified,excluded.verified)');
    let added = 0;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of rows) {
        if (!/^[a-f0-9]{40}$/i.test(row.hash || '') || !row.title) continue;
        release.run(row.hash.toLowerCase(), row.title, Math.max(0,Math.floor(Number(row.size)||0)), source, Date.now());
        for (const media of row.media || []) map.run(media,row.hash.toLowerCase(),row.mediaTrusted===false?0:1);
        added++;
      }
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
    return added;
  }

  search(media, title, limit = 500, {titleFallback = true} = {}) {
    const exact = this.db.prepare('SELECT r.*,m.verified AS mediaMatched FROM releases r JOIN media_releases m ON r.hash=m.hash WHERE m.media=? LIMIT ?').all(media,limit);
    if(!titleFallback)return exact;
    // Fallback index lookup, never a call to Torrentio/Comet or TorBox's retired search service.
    const tokens = title.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    if (!tokens.length) return exact;
    const where = tokens.map(() => 'lower(title) LIKE ? ESCAPE \'\\\'').join(' AND ');
    const titled=this.db.prepare(`SELECT * FROM releases WHERE ${where} LIMIT ?`).all(...tokens.map(t => '%'+t.replace(/[\\%_]/g,'\\$&')+'%'),limit).filter(row=>{
      const words=row.title.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
      return tokens.every(t=>words.includes(t));
    });
    return [...new Map([...exact,...titled].map(row=>[row.hash,row])).values()].slice(0,limit);
  }

  setMetadata(media, metadata) {
    this.db.prepare('INSERT INTO metadata VALUES(?,?,?) ON CONFLICT(media) DO UPDATE SET json=excluded.json,updated_at=excluded.updated_at').run(media,JSON.stringify(metadata),Date.now());
  }
  getMetadata(media) {
    const row=this.db.prepare('SELECT json,updated_at FROM metadata WHERE media=?').get(media);
    return row ? { ...JSON.parse(row.json), cachedAt: row.updated_at } : null;
  }
  stats() { return this.db.prepare('SELECT COUNT(*) AS releases,COUNT(DISTINCT source) AS sources FROM releases').get(); }
  close() { this.db.close(); }
}
