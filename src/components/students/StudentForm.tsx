import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, PlacementOffer, BRANCHES } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentFormProps {
  initialData?: Student;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  isEdit?: boolean;
}

export function StudentForm({ initialData, onSubmit, isEdit }: StudentFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registerNumber: initialData?.registerNumber || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    branch: initialData?.branch || '',
    batch: initialData?.batch || '',
    cgpa: initialData?.cgpa?.toString() || '',
  });
  const [offers, setOffers] = useState<PlacementOffer[]>(initialData?.placementOffers || []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addOffer = () => {
    setOffers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        companyName: '',
        role: '',
        packageLPA: 0,
        offerType: 'placement',
        offerDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      },
    ]);
  };

  const updateOffer = (id: string, field: string, value: string | number) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === id ? { ...offer, [field]: value } : offer
      )
    );
  };

  const removeOffer = (id: string) => {
    setOffers((prev) => prev.filter((offer) => offer.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSubmit({
      registerNumber: formData.registerNumber,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      branch: formData.branch,
      batch: formData.batch,
      cgpa: parseFloat(formData.cgpa) || 0,
      placementOffers: offers,
    });
    
    setLoading(false);
    if (success) {
      navigate('/students');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registerNumber">Register Number *</Label>
              <Input
                id="registerNumber"
                value={formData.registerNumber}
                onChange={(e) => handleChange('registerNumber', e.target.value)}
                required
                placeholder="e.g., 21CS001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g., john@college.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select value={formData.branch} onValueChange={(v) => handleChange('branch', v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={formData.batch}
                onChange={(e) => handleChange('batch', e.target.value)}
                placeholder="e.g., 2021-2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => handleChange('cgpa', e.target.value)}
                placeholder="e.g., 8.5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Placement Offers</CardTitle>
            <Button type="button" variant="outline" onClick={addOffer} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Offer
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {offers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No placement offers yet. Click "Add Offer" to add one.
              </p>
            ) : (
              offers.map((offer, index) => (
                <div key={offer.id} className="p-4 border rounded-lg relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeOffer(offer.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-medium mb-4">Offer #{index + 1}</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={offer.companyName}
                        onChange={(e) => updateOffer(offer.id, 'companyName', e.target.value)}
                        placeholder="e.g., Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={offer.role}
                        onChange={(e) => updateOffer(offer.id, 'role', e.target.value)}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Package (LPA)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={offer.packageLPA}
                        onChange={(e) => updateOffer(offer.id, 'packageLPA', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 12.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Offer Type</Label>
                      <Select
                        value={offer.offerType}
                        onValueChange={(v) => updateOffer(offer.id, 'offerType', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placement">Placement</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Offer Date</Label>
                      <Input
                        type="date"
                        value={offer.offerDate}
                        onChange={(e) => updateOffer(offer.id, 'offerDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={offer.status}
                        onValueChange={(v) => updateOffer(offer.id, 'status', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
          </Button>
          <Link to="/students">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}