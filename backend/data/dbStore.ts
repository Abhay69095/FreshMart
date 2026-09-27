import fs from 'fs';
import path from 'path';
import { syncUpsertToMongo, syncDeleteToMongo } from './mongoBridge.js';

// High-fidelity embedded JSON document database mimicking MongoDB/Mongoose
// Provides persistence in backend/data/freshmart_db.json
const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
const DB_FILE = path.join(DATA_DIR, 'freshmart_db.json');

export interface Document {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface DatabaseSchema {
  users: Document[];
  products: Document[];
  categories: Document[];
  orders: Document[];
  stores: Document[];
  reviews: Document[];
}

export class DBStore {
  private static instance: DBStore;
  private data: DatabaseSchema = {
    users: [],
    products: [],
    categories: [],
    orders: [],
    stores: [],
    reviews: []
  };

  private constructor() {
    this.init();
  }

  public static getInstance(): DBStore {
    if (!DBStore.instance) {
      DBStore.instance = new DBStore();
    }
    return DBStore.instance;
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing db store:', err);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db store:', err);
    }
  }

  public getCollection(collectionName: keyof DatabaseSchema): Document[] {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    return this.data[collectionName];
  }

  public insert(collectionName: keyof DatabaseSchema, doc: any): Document {
    const coll = this.getCollection(collectionName);
    const now = new Date().toISOString();
    const newDoc: Document = {
      _id: doc._id || 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: doc.createdAt || now,
      updatedAt: now,
      ...doc
    };
    coll.push(newDoc);
    this.save();
    syncUpsertToMongo(collectionName as any, newDoc);
    return JSON.parse(JSON.stringify(newDoc));
  }

  public find(collectionName: keyof DatabaseSchema, query: (item: any) => boolean = () => true): Document[] {
    const coll = this.getCollection(collectionName);
    return JSON.parse(JSON.stringify(coll.filter(query)));
  }

  public findOne(collectionName: keyof DatabaseSchema, query: (item: any) => boolean): Document | null {
    const coll = this.getCollection(collectionName);
    const found = coll.find(query);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public findById(collectionName: keyof DatabaseSchema, id: string): Document | null {
    return this.findOne(collectionName, (item) => item._id === id);
  }

  public findByIdAndUpdate(collectionName: keyof DatabaseSchema, id: string, update: any): Document | null {
    const coll = this.getCollection(collectionName);
    const index = coll.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const existing = coll[index];
    const updated: Document = {
      ...existing,
      ...update,
      _id: existing._id,
      updatedAt: new Date().toISOString()
    };
    coll[index] = updated;
    this.save();
    syncUpsertToMongo(collectionName as any, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  public findByIdAndDelete(collectionName: keyof DatabaseSchema, id: string): boolean {
    const coll = this.getCollection(collectionName);
    const index = coll.findIndex((item) => item._id === id);
    if (index === -1) return false;
    coll.splice(index, 1);
    this.save();
    syncDeleteToMongo(collectionName as any, id);
    return true;
  }

  public resetWithData(initialData: DatabaseSchema) {
    this.data = initialData;
    this.save();
  }
}

export const db = DBStore.getInstance();
