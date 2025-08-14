import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveToIndexedDB, getFromIndexedDB } from '../utils/db';

interface Employee {
  _id: string;
  name: string;
  status: string;
  contactNumber?: string;
  address?: string;
  role?: string;
}

interface EmployeeContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  activeEmployee: string;
  setActiveEmployee: React.Dispatch<React.SetStateAction<string>>;
  refreshEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<string>('');

  const refreshEmployees = async () => {
    try {
      // Fetch from server
      const response = await fetch('http://localhost:5000/api/employees');
      const serverEmployees = await response.json();
      
      // Update state
      setEmployees(serverEmployees);
      
      // Save to IndexedDB
      const dbData = await getFromIndexedDB() || {};
      await saveToIndexedDB({
        ...dbData,
        employees: serverEmployees,
        employeeList: serverEmployees.map(emp => emp.name)
      });

      // Update active employee if needed
      if (!activeEmployee && serverEmployees.length > 0) {
        setActiveEmployee(serverEmployees[0].name);
      }
    } catch (error) {
      console.error('Error refreshing employees:', error);
      
      // Fallback to IndexedDB if server is unavailable
      const dbData = await getFromIndexedDB();
      if (dbData?.employees) {
        setEmployees(dbData.employees);
      }
    }
  };

  // Initial load
  useEffect(() => {
    refreshEmployees();
  }, []);

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(refreshEmployees, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <EmployeeContext.Provider value={{ 
      employees, 
      setEmployees, 
      activeEmployee, 
      setActiveEmployee,
      refreshEmployees 
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
} 