import * as XLSX from 'xlsx';
import { Student, PlacementOffer, BRANCHES } from '@/types/student';

interface ExcelRow {
  'Register Number': string;
  'Name': string;
  'Email': string;
  'Phone': string;
  'Branch': string;
  'Batch': string;
  'CGPA': number;
  'Company Name'?: string;
  'Role'?: string;
  'Package (LPA)'?: number;
  'Offer Type'?: 'placement' | 'internship';
  'Offer Date'?: string;
  'Status'?: 'accepted' | 'rejected' | 'pending';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  students: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[];
}

export function parseExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function validateAndTransformExcelData(
  rows: ExcelRow[],
  existingRegisterNumbers: Set<string>
): ValidationResult {
  const errors: string[] = [];
  const studentMap = new Map<string, Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>();
  const seenRegisterNumbers = new Set<string>();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Excel row number (1-indexed + header)

    // Validate required fields
    if (!row['Register Number']) {
      errors.push(`Row ${rowNum}: Register Number is required`);
      return;
    }
    if (!row['Name']) {
      errors.push(`Row ${rowNum}: Name is required`);
      return;
    }
    if (!row['Branch']) {
      errors.push(`Row ${rowNum}: Branch is required`);
      return;
    }

    const registerNumber = String(row['Register Number']).trim();

    // Check for duplicates in file
    if (seenRegisterNumbers.has(registerNumber)) {
      errors.push(`Row ${rowNum}: Duplicate register number ${registerNumber} in file`);
      return;
    }
    seenRegisterNumbers.add(registerNumber);

    // Check for duplicates in database
    if (existingRegisterNumbers.has(registerNumber)) {
      errors.push(`Row ${rowNum}: Register number ${registerNumber} already exists in database`);
      return;
    }

    // Validate branch
    if (!BRANCHES.includes(row['Branch'] as any)) {
      errors.push(`Row ${rowNum}: Invalid branch "${row['Branch']}". Valid branches: ${BRANCHES.join(', ')}`);
      return;
    }

    // Validate email format
    if (row['Email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email'])) {
      errors.push(`Row ${rowNum}: Invalid email format`);
      return;
    }

    // Validate CGPA
    const cgpa = Number(row['CGPA']) || 0;
    if (cgpa < 0 || cgpa > 10) {
      errors.push(`Row ${rowNum}: CGPA must be between 0 and 10`);
      return;
    }

    // Create or update student entry
    if (!studentMap.has(registerNumber)) {
      studentMap.set(registerNumber, {
        registerNumber,
        name: row['Name'].trim(),
        email: row['Email']?.trim() || '',
        phone: row['Phone']?.toString().trim() || '',
        branch: row['Branch'].trim(),
        batch: row['Batch']?.toString().trim() || '',
        cgpa,
        placementOffers: [],
      });
    }

    // Add placement offer if provided
    if (row['Company Name']) {
      const student = studentMap.get(registerNumber)!;
      const offer: PlacementOffer = {
        id: crypto.randomUUID(),
        companyName: row['Company Name'].trim(),
        role: row['Role']?.trim() || 'Not Specified',
        packageLPA: Number(row['Package (LPA)']) || 0,
        offerType: row['Offer Type'] || 'placement',
        offerDate: row['Offer Date'] || new Date().toISOString().split('T')[0],
        status: row['Status'] || 'pending',
      };
      student.placementOffers.push(offer);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    students: Array.from(studentMap.values()),
  };
}

export function generateSampleExcel(): void {
  const sampleData = [
    {
      'Register Number': '21CS001',
      'Name': 'John Doe',
      'Email': 'john.doe@college.edu',
      'Phone': '9876543210',
      'Branch': 'Computer Science',
      'Batch': '2021-2025',
      'CGPA': 8.5,
      'Company Name': 'Google',
      'Role': 'Software Engineer',
      'Package (LPA)': 25,
      'Offer Type': 'placement',
      'Offer Date': '2024-01-15',
      'Status': 'accepted',
    },
    {
      'Register Number': '21CS002',
      'Name': 'Jane Smith',
      'Email': 'jane.smith@college.edu',
      'Phone': '9876543211',
      'Branch': 'Computer Science',
      'Batch': '2021-2025',
      'CGPA': 9.0,
      'Company Name': 'Microsoft',
      'Role': 'SDE Intern',
      'Package (LPA)': 1.5,
      'Offer Type': 'internship',
      'Offer Date': '2024-02-20',
      'Status': 'accepted',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'placement_data_template.xlsx');
}