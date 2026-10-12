import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback in-memory and localStorage adapter for development
class LocalStorageDatabase {
  private getStorageKey(table: string): string {
    return `legalbot_db_${table}`;
  }

  getTableData<T = Record<string, unknown>>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      if (!data) return [];
      const parsed: T[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set<string>();
      const deduped: T[] = [];
      for (const item of parsed) {
        const id = (item as any)?.id;
        if (id) {
          if (!seen.has(id)) {
            seen.add(id);
            deduped.push(item);
          }
        } else {
          deduped.push(item);
        }
      }
      return deduped;
    } catch {
      return [];
    }
  }

  setTableData<T = Record<string, unknown>>(table: string, items: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  from(table: string) {
    const self = this;
    let queryFilter: ((item: Record<string, unknown>) => boolean) | null = null;
    let sortField: string | null = null;
    let sortAscending = true;

    return {
      select: (_fields: string = '*') => {
        return {
          eq: (field: string, value: unknown) => {
            queryFilter = (item: Record<string, unknown>) => item[field] === value;
            return {
              order: (f: string, { ascending = true }: { ascending?: boolean } = {}) => {
                sortField = f;
                sortAscending = ascending;
                return {
                  then: async (resolve: (res: { data: Record<string, unknown>[]; error: null }) => void) => {
                    let items = self.getTableData(table);
                    if (queryFilter) items = items.filter(queryFilter);
                    if (sortField) {
                      items.sort((a, b) => {
                        const valA = a[sortField!];
                        const valB = b[sortField!];
                        if (valA === valB) return 0;
                        const res = valA! > valB! ? 1 : -1;
                        return sortAscending ? res : -res;
                      });
                    }
                    resolve({ data: items, error: null });
                  },
                };
              },
              then: async (resolve: (res: { data: Record<string, unknown>[]; error: null }) => void) => {
                let items = self.getTableData(table);
                if (queryFilter) items = items.filter(queryFilter);
                resolve({ data: items, error: null });
              },
            };
          },
          order: (f: string, { ascending = true }: { ascending?: boolean } = {}) => {
            sortField = f;
            sortAscending = ascending;
            return {
              then: async (resolve: (res: { data: Record<string, unknown>[]; error: null }) => void) => {
                const items = self.getTableData(table);
                if (sortField) {
                  items.sort((a, b) => {
                    const valA = a[sortField!];
                    const valB = b[sortField!];
                    if (valA === valB) return 0;
                    const res = valA! > valB! ? 1 : -1;
                    return sortAscending ? res : -res;
                  });
                }
                resolve({ data: items, error: null });
              },
            };
          },
          then: async (resolve: (res: { data: Record<string, unknown>[]; error: null }) => void) => {
            resolve({ data: self.getTableData(table), error: null });
          },
        };
      },
      insert: (record: Record<string, unknown> | Record<string, unknown>[]) => {
        return {
          select: () => ({
            single: async () => {
              const items = self.getTableData(table);
              const toInsert = Array.isArray(record) ? record[0] : record;
              const recId = (toInsert.id as string) || crypto.randomUUID();
              const newItem = { created_at: new Date().toISOString(), ...toInsert, id: recId };
              const existingIdx = items.findIndex((i) => i.id === recId);
              if (existingIdx >= 0) {
                items[existingIdx] = newItem;
              } else {
                items.push(newItem);
              }
              self.setTableData(table, items);
              return { data: newItem, error: null };
            },
          }),
          then: async (resolve: (res: { data: unknown; error: null }) => void) => {
            const items = self.getTableData(table);
            const toInsert = Array.isArray(record) ? record : [record];
            const newItems = toInsert.map((i) => {
              const recId = (i.id as string) || crypto.randomUUID();
              return { created_at: new Date().toISOString(), ...i, id: recId };
            });
            newItems.forEach((newItem) => {
              const existingIdx = items.findIndex((i) => i.id === newItem.id);
              if (existingIdx >= 0) {
                items[existingIdx] = newItem;
              } else {
                items.push(newItem);
              }
            });
            self.setTableData(table, items);
            resolve({ data: newItems, error: null });
          },
        };
      },
      upsert: (record: Record<string, unknown> | Record<string, unknown>[]) => {
        return {
          then: async (resolve: (res: { data: unknown; error: null }) => void) => {
            const items = self.getTableData(table);
            const toInsert = Array.isArray(record) ? record : [record];
            const newItems = toInsert.map((i) => {
              const recId = (i.id as string) || crypto.randomUUID();
              return { created_at: new Date().toISOString(), ...i, id: recId };
            });
            newItems.forEach((newItem) => {
              const existingIdx = items.findIndex((i) => i.id === newItem.id);
              if (existingIdx >= 0) {
                items[existingIdx] = newItem;
              } else {
                items.push(newItem);
              }
            });
            self.setTableData(table, items);
            resolve({ data: newItems, error: null });
          },
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: unknown) => {
            return {
              then: async (resolve: (res: { error: null }) => void) => {
                const items = self.getTableData(table).filter(i => i[field] !== value);
                self.setTableData(table, items);
                resolve({ error: null });
              },
            };
          },
        };
      },
    };
  }

  auth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error('Configure Supabase to enable online accounts.'),
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: new Error('Configure Supabase to enable online accounts.'),
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
  };
}

const localDb = new LocalStorageDatabase();

// Instantiate Supabase or dual-mode wrapper
export const supabase = (isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : localDb) as unknown as SupabaseClient;

export const dbMode = isSupabaseConfigured ? 'supabase' : 'local';
