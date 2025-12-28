import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { parseExcelFile, validateAndTransformExcelData, generateSampleExcel } from '@/lib/excelParser';
import { Student } from '@/types/student';

interface ExcelUploadProps {
  existingStudents: Student[];
  onUpload: (students: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

export function ExcelUpload({ existingStudents, onUpload }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setSuccess(false);
    
    try {
      const rows = await parseExcelFile(selectedFile);
      const existingRegNumbers = new Set(existingStudents.map(s => s.registerNumber));
      const result = validateAndTransformExcelData(rows, existingRegNumbers);
      
      if (!result.isValid) {
        setErrors(result.errors);
      } else {
        setPreviewCount(result.students.length);
      }
    } catch (error) {
      setErrors(['Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.']);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const rows = await parseExcelFile(file);
      const existingRegNumbers = new Set(existingStudents.map(s => s.registerNumber));
      const result = validateAndTransformExcelData(rows, existingRegNumbers);
      
      if (!result.isValid) {
        setErrors(result.errors);
      } else {
        await onUpload(result.students);
        setSuccess(true);
        setFile(null);
        setPreviewCount(0);
        if (inputRef.current) inputRef.current.value = '';
      }
    } catch (error) {
      setErrors(['Failed to upload data. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel Upload
        </CardTitle>
        <CardDescription>
          Upload an Excel file to bulk import student and placement data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="flex items-center justify-center gap-2 h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {file ? file.name : 'Choose Excel file or drag & drop'}
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || loading || errors.length > 0}
              className="gap-2"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button variant="outline" onClick={generateSampleExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>
        </div>

        {previewCount > 0 && errors.length === 0 && !success && (
          <Alert className="border-info/50 bg-info/5">
            <CheckCircle className="h-4 w-4 text-info" />
            <AlertDescription className="text-info">
              Found {previewCount} valid student records ready to import.
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Validation errors found:</p>
              <ul className="list-disc pl-4 space-y-1 max-h-32 overflow-y-auto">
                {errors.slice(0, 10).map((error, i) => (
                  <li key={i} className="text-sm">{error}</li>
                ))}
                {errors.length > 10 && (
                  <li className="text-sm">...and {errors.length - 10} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-success/50 bg-success/5">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Data uploaded successfully!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}