import { StatCards } from '@/components/dashboard/StatCards';
import { BranchStats } from '@/components/dashboard/BranchStats';
import { StudentTable } from '@/components/students/StudentTable';
import { ExcelUpload } from '@/components/students/ExcelUpload';
import { useStudents } from '@/hooks/useStudents';
import { addStudent } from '@/lib/studentService';
import { Student } from '@/types/student';

const Index = () => {
  const { students, loading, stats, deleteStudent, refetch } = useStudents();

  const handleBulkUpload = async (newStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    for (const student of newStudents) {
      await addStudent(student as Omit<Student, 'id'>);
    }
    await refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-primary">
            College Placement Management
          </h1>
          <p className="text-muted-foreground text-sm">Track and manage student placements</p>
        </div>
      </header>
      
      <main className="container py-6 space-y-6">
        <StatCards stats={stats} loading={loading} />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExcelUpload existingStudents={students} onUpload={handleBulkUpload} />
          </div>
          <BranchStats stats={stats} loading={loading} />
        </div>
        
        <StudentTable students={students} loading={loading} onDelete={deleteStudent} />
      </main>
    </div>
  );
};

export default Index;