import { useStudents } from '@/hooks/useStudents';
import { StudentForm } from '@/components/students/StudentForm';

const AddStudent = () => {
  const { addStudent } = useStudents();
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <StudentForm onSubmit={addStudent} />
      </div>
    </div>
  );
};

export default AddStudent;