import { useState, useEffect, useCallback } from 'react';
import { Student, DashboardStats } from '@/types/student';
import { 
  getAllStudents, 
  getStudentById,
  addStudent as addStudentService,
  updateStudent as updateStudentService,
  deleteStudent as deleteStudentService,
  calculateDashboardStats,
  checkDuplicateRegisterNumber
} from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setStats(calculateDashboardStats(data));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students. Please check your Firebase configuration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const isDuplicate = await checkDuplicateRegisterNumber(student.registerNumber);
      if (isDuplicate) {
        toast({
          title: 'Duplicate Register Number',
          description: 'A student with this register number already exists.',
          variant: 'destructive',
        });
        return false;
      }
      await addStudentService(student as Omit<Student, 'id'>);
      toast({
        title: 'Success',
        description: 'Student added successfully.',
      });
      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    try {
      if (student.registerNumber) {
        const isDuplicate = await checkDuplicateRegisterNumber(student.registerNumber, id);
        if (isDuplicate) {
          toast({
            title: 'Duplicate Register Number',
            description: 'A student with this register number already exists.',
            variant: 'destructive',
          });
          return false;
        }
      }
      await updateStudentService(id, student);
      toast({
        title: 'Success',
        description: 'Student updated successfully.',
      });
      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteStudentService(id);
      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
      });
      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getStudent = async (id: string) => {
    try {
      return await getStudentById(id);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch student details.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    students,
    loading,
    stats,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    refetch: fetchStudents,
  };
}