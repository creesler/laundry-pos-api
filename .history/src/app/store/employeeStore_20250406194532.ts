import { create } from 'zustand'

interface Employee {
  name: string;
  contactNumber?: string;
  address?: string;
}

interface EmployeeStore {
  employees: Employee[];
  selectedEmployee: string;
  setEmployees: (employees: Employee[]) => void;
  setSelectedEmployee: (name: string) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  selectedEmployee: '',
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (name) => set({ selectedEmployee: name }),
})) 