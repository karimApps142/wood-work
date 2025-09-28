// types/index.ts
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface Door {
  id?: number; // Optional because it won't exist before being saved to DB
  jobId: number;
  area: number;
  areaPrice: number;
  beading: number;
  beadingPrice: number;
  frame: number;
  framePrice: number;
  paling: number;
  palingPrice: number;
  polish: number;
  polishPrice: number;
  subtotal: number;
}

export interface Job {
  id: number;
  title: string;
  notes: string;
  date: string;
  customerId: number | null;
  grandTotal: number;
  doors: any[]
}

export interface PriceTemplate {
  name: string;
  door: number;
  beading: number;
  frame: number;
  paling: number;
  polish: number;
}