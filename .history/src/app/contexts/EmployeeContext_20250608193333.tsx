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
  selectedEmployee: string;
  setSelectedEmployee: (name: string) => void;
  refreshEmployees: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from server
      const response = await fetch('http://localhost:5000/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      
      // Update state
      setEmployees(data);
      
      // If no employee is selected and we have employees, select the first one
      if (!selectedEmployee && data.length > 0) {
        setSelectedEmployee(data[0].name);
      }
      
      // Save to IndexedDB
      const dbData = await getFromIndexedDB() || {};
      await saveToIndexedDB({
        ...dbData,
        employees: data,
        employeeList: data.map(emp => emp.name)
      });
      
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      
      // Try to load from IndexedDB as fallback
      try {
        const dbData = await getFromIndexedDB();
        if (dbData?.employees) {
          setEmployees(dbData.employees);
          if (!selectedEmployee && dbData.employees.length > 0) {
            setSelectedEmployee(dbData.employees[0].name);
          }
        }
      } catch (dbErr) {
        console.error('Error loading from IndexedDB:', dbErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshEmployees();
  }, []);

  // Persist selected employee to localStorage
  useEffect(() => {
    if (selectedEmployee) {
      localStorage.setItem('selectedEmployee', selectedEmployee);
    }
  }, [selectedEmployee]);

  return (
    <EmployeeContext.Provider 
      value={{
        employees,
        selectedEmployee,
        setSelectedEmployee,
        refreshEmployees,
        isLoading,
        error
      }}
    >
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