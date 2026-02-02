export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BillItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Bill {
  id: string;
  items: BillItem[];
  total: number;
  createdAt: string;
}

export interface Profile {
  storeName: string;
  ownerName: string;
  openingBalance: number;
}

export interface AppData {
  inventory: Product[];
  bills: Bill[];
  profile: Profile;
}
