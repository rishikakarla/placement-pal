import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Student, PlacementOffer, DashboardStats } from '@/types/student';

const STUDENTS_COLLECTION = 'students';

// Get all students
export const getAllStudents = async (): Promise<Student[]> => {
  const studentsRef = collection(db, STUDENTS_COLLECTION);
  const q = query(studentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

// Get student by ID
export const getStudentById = async (id: string): Promise<Student | null> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Student;
  }
  return null;
};

// Get student by register number
export const getStudentByRegisterNumber = async (registerNumber: string): Promise<Student | null> => {
  const studentsRef = collection(db, STUDENTS_COLLECTION);
  const q = query(studentsRef, where('registerNumber', '==', registerNumber));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Student;
  }
  return null;
};

// Add new student
export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
  const studentsRef = collection(db, STUDENTS_COLLECTION);
  const docRef = await addDoc(studentsRef, {
    ...student,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Update student
export const updateStudent = async (id: string, student: Partial<Student>): Promise<void> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...student,
    updatedAt: new Date().toISOString(),
  });
};

// Delete student
export const deleteStudent = async (id: string): Promise<void> => {
  const docRef = doc(db, STUDENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Add placement offer to student
export const addPlacementOffer = async (studentId: string, offer: Omit<PlacementOffer, 'id'>): Promise<void> => {
  const student = await getStudentById(studentId);
  if (student) {
    const newOffer: PlacementOffer = {
      ...offer,
      id: crypto.randomUUID(),
    };
    await updateStudent(studentId, {
      placementOffers: [...student.placementOffers, newOffer],
    });
  }
};

// Get students by branch
export const getStudentsByBranch = async (branch: string): Promise<Student[]> => {
  const studentsRef = collection(db, STUDENTS_COLLECTION);
  const q = query(studentsRef, where('branch', '==', branch));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

// Calculate dashboard stats
export const calculateDashboardStats = (students: Student[]): DashboardStats => {
  const placedStudents = students.filter(s => 
    s.placementOffers.some(o => o.status === 'accepted')
  );
  
  const allPackages = students.flatMap(s => 
    s.placementOffers
      .filter(o => o.status === 'accepted')
      .map(o => o.packageLPA)
  );
  
  const uniqueCompanies = new Set(
    students.flatMap(s => s.placementOffers.map(o => o.companyName))
  );
  
  const branchWiseStats: Record<string, { total: number; placed: number }> = {};
  students.forEach(s => {
    if (!branchWiseStats[s.branch]) {
      branchWiseStats[s.branch] = { total: 0, placed: 0 };
    }
    branchWiseStats[s.branch].total++;
    if (s.placementOffers.some(o => o.status === 'accepted')) {
      branchWiseStats[s.branch].placed++;
    }
  });
  
  return {
    totalStudents: students.length,
    placedStudents: placedStudents.length,
    avgPackage: allPackages.length > 0 
      ? allPackages.reduce((a, b) => a + b, 0) / allPackages.length 
      : 0,
    highestPackage: allPackages.length > 0 ? Math.max(...allPackages) : 0,
    totalCompanies: uniqueCompanies.size,
    branchWiseStats,
  };
};

// Check for duplicate register number
export const checkDuplicateRegisterNumber = async (registerNumber: string, excludeId?: string): Promise<boolean> => {
  const student = await getStudentByRegisterNumber(registerNumber);
  if (!student) return false;
  if (excludeId && student.id === excludeId) return false;
  return true;
};