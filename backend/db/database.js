const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const dbDir = path.dirname(path.resolve(__dirname, config.dbPath));
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(__dirname, config.dbPath);

// better-sqlite3 uyumlu adapter
class DatabaseAdapter {
    constructor(sqlDb) {
        this.db = sqlDb;
    }

    prepare(sql) {
        const db = this.db;
        return {
            all(...params) {
                const stmt = db.prepare(sql);
                if (params.length > 0) stmt.bind(params);
                const rows = [];
                while (stmt.step()) {
                    rows.push(stmt.getAsObject());
                }
                stmt.free();
                return rows;
            },
            get(...params) {
                const stmt = db.prepare(sql);
                if (params.length > 0) stmt.bind(params);
                let row = null;
                if (stmt.step()) {
                    row = stmt.getAsObject();
                }
                stmt.free();
                return row;
            },
            run(...params) {
                if (params.length > 0) {
                    db.run(sql, params);
                } else {
                    db.run(sql);
                }
                const changes = db.getRowsModified();
                // lastInsertRowid'i al
                const lastRow = db.exec("SELECT last_insert_rowid() as id");
                const lastInsertRowid = lastRow.length > 0 ? lastRow[0].values[0][0] : 0;
                return { changes, lastInsertRowid };
            }
        };
    }

    exec(sql) {
        this.db.exec(sql);
    }

    pragma(str) {
        try {
            this.db.run(`PRAGMA ${str}`);
        } catch (e) {
            // Bazı pragma'lar desteklenmeyebilir
        }
    }
}

// Global veritabanı
let db = null;

// Veritabanını başlat
async function initDatabase() {
    const SQL = await initSqlJs();

    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
        fileBuffer = fs.readFileSync(dbPath);
    }

    const sqlDb = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

    db = new DatabaseAdapter(sqlDb);

    // WAL modu ve foreign keys
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Şemayı oluştur
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    // Veritabanını periyodik olarak kaydet
    setInterval(() => saveDatabase(), 5000);

    return db;
}

// Veritabanını diske kaydet
function saveDatabase() {
    if (!db || !db.db) return;
    try {
        const data = db.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error('Veritabanı kayıt hatası:', err);
    }
}

// Veritabanını al
function getDb() {
    if (!db) throw new Error('Veritabanı henüz başlatılmadı');
    return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
