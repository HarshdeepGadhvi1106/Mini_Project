import type { AppData, Bill, BillItem, Product, Profile } from '@/types';
import { loadAppData, saveAppData } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AppDataContextValue extends AppData {
  loading: boolean;
  pendingBillItems: BillItem[];
  lastGeneratedBillId: string | null;
  setPendingBillItems: (items: BillItem[]) => void;
  addBill: (items: BillItem[], total: number) => string;
  updateInventory: (productId: string, updates: Partial<Pick<Product, 'quantity' | 'price'>>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearPendingBill: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({ inventory: [], bills: [], profile: { storeName: '', ownerName: '', openingBalance: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveAppData(next);
  }, []);

  const [pendingBillItems, setPendingBillItemsState] = useState<BillItem[]>([]);
  const [lastGeneratedBillId, setLastGeneratedBillId] = useState<string | null>(null);

  const setPendingBillItems = useCallback((items: BillItem[]) => {
    setPendingBillItemsState(items);
  }, []);

  const clearPendingBill = useCallback(() => {
    setPendingBillItemsState([]);
    setLastGeneratedBillId(null);
  }, []);

  const addBill = useCallback(
    (items: BillItem[], total: number): string => {
      const bill: Bill = {
        id: `bill-${Date.now()}`,
        items,
        total,
        createdAt: new Date().toISOString(),
      };
      const inventoryMap = new Map(data.inventory.map((p) => [p.id, { ...p }]));
      for (const item of items) {
        const p = inventoryMap.get(item.productId);
        if (p) {
          p.quantity = Math.max(0, p.quantity - item.quantity);
          inventoryMap.set(item.productId, p);
        }
      }
      const next: AppData = {
        ...data,
        bills: [bill, ...data.bills],
        inventory: Array.from(inventoryMap.values()),
      };
      persist(next);
      setPendingBillItemsState([]);
      setLastGeneratedBillId(bill.id);
      return bill.id;
    },
    [data, persist]
  );

  const updateInventory = useCallback(
    (productId: string, updates: Partial<Pick<Product, 'quantity' | 'price'>>) => {
      const inventory = data.inventory.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      );
      persist({ ...data, inventory });
    },
    [data, persist]
  );

  const addProduct = useCallback(
    (product: Omit<Product, 'id'>) => {
      const id = `p-${Date.now()}`;
      const inventory = [...data.inventory, { ...product, id }];
      persist({ ...data, inventory });
    },
    [data, persist]
  );

  const updateProfile = useCallback(
    (updates: Partial<Profile>) => {
      persist({ ...data, profile: { ...data.profile, ...updates } });
    },
    [data, persist]
  );

  const value: AppDataContextValue = {
    ...data,
    loading,
    pendingBillItems,
    lastGeneratedBillId,
    setPendingBillItems,
    addBill,
    updateInventory,
    addProduct,
    updateProfile,
    clearPendingBill,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
