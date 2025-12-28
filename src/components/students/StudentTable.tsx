import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Student, BRANCHES } from '@/types/student';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

export function StudentTable({ students, loading, onDelete }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
      
      return matchesSearch && matchesBranch;
    });
  }, [students, search, branchFilter]);

  const getPlacementStatus = (student: Student) => {
    const accepted = student.placementOffers.filter(o => o.status === 'accepted');
    if (accepted.length > 0) {
      return { status: 'placed', count: accepted.length };
    }
    if (student.placementOffers.length > 0) {
      return { status: 'pending', count: student.placementOffers.length };
    }
    return { status: 'not-placed', count: 0 };
  };

  const getHighestPackage = (student: Student) => {
    const accepted = student.placementOffers.filter(o => o.status === 'accepted');
    if (accepted.length === 0) return null;
    return Math.max(...accepted.map(o => o.packageLPA));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Students</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, register no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/students/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {students.length === 0 
              ? 'No students found. Add your first student or upload an Excel file.'
              : 'No students match your search criteria.'}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Register No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Branch</TableHead>
                  <TableHead className="hidden lg:table-cell">CGPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Package</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const placementStatus = getPlacementStatus(student);
                  const highestPackage = getHighestPackage(student);
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{student.registerNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{student.branch}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.branch}</TableCell>
                      <TableCell className="hidden lg:table-cell">{student.cgpa.toFixed(2)}</TableCell>
                      <TableCell>
                        {placementStatus.status === 'placed' && (
                          <Badge className="bg-success/10 text-success hover:bg-success/20">
                            Placed ({placementStatus.count})
                          </Badge>
                        )}
                        {placementStatus.status === 'pending' && (
                          <Badge variant="secondary">
                            Pending ({placementStatus.count})
                          </Badge>
                        )}
                        {placementStatus.status === 'not-placed' && (
                          <Badge variant="outline">Not Placed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {highestPackage ? `₹${highestPackage} LPA` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={`/students/${student.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/students/${student.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {student.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}