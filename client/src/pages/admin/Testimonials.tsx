import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';

interface Testimonial {
  id: number;
  customerName: string;
  vehicle: string | null;
  location: string | null;
  quote: string;
  photoUrl: string;
  displayOrder: number;
  active: boolean;
}

const empty = {
  customerName: '',
  vehicle: '',
  location: '',
  quote: '',
  displayOrder: '0',
  active: true,
};

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery<{ testimonials: Testimonial[] }>({
    queryKey: ['/api/admin/testimonials'],
  });

  const items = data?.testimonials || [];

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setPhotoFile(null);
    setOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      customerName: t.customerName,
      vehicle: t.vehicle || '',
      location: t.location || '',
      quote: t.quote,
      displayOrder: String(t.displayOrder),
      active: t.active,
    });
    setPhotoFile(null);
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('customerName', form.customerName);
      fd.append('vehicle', form.vehicle);
      fd.append('location', form.location);
      fd.append('quote', form.quote);
      fd.append('displayOrder', form.displayOrder);
      fd.append('active', String(form.active));
      if (photoFile) fd.append('photo', photoFile);
      const url = editing
        ? `/api/admin/testimonials/${editing.id}`
        : '/api/admin/testimonials';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, body: fd, credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: editing ? 'Testimonial updated' : 'Testimonial added' });
      setOpen(false);
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      await apiRequest('DELETE', `/api/admin/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: 'Testimonial deleted' });
      setDeleteId(null);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggleActive = (t: Testimonial) => {
    const fd = new FormData();
    fd.append('active', String(!t.active));
    fetch(`/api/admin/testimonials/${t.id}`, { method: 'PATCH', body: fd, credentials: 'include' })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
        queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Customer Testimonials</h2>
            <p className="text-muted-foreground">Photos and quotes shown in the About page carousel.</p>
          </div>
          <Button onClick={openNew} data-testid="button-add-testimonial">
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Testimonials ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No testimonials yet</p>
                <Button onClick={openNew}>Add your first testimonial</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((t) => (
                  <Card key={t.id} className="overflow-hidden" data-testid={`testimonial-card-${t.id}`}>
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={t.photoUrl}
                        alt={t.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-heading font-semibold">{t.customerName}</div>
                          {t.vehicle && (
                            <div className="text-sm text-muted-foreground">{t.vehicle}</div>
                          )}
                          {t.location && (
                            <div className="text-xs text-muted-foreground">{t.location}</div>
                          )}
                        </div>
                        <Badge variant={t.active ? 'default' : 'secondary'}>
                          {t.active ? 'Active' : 'Hidden'}
                        </Badge>
                      </div>
                      <p className="text-sm italic line-clamp-3">"{t.quote}"</p>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(t)}
                          data-testid={`button-toggle-${t.id}`}
                        >
                          {t.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(t)}
                          data-testid={`button-edit-testimonial-${t.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(t.id)}
                          data-testid={`button-delete-testimonial-${t.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            <DialogDescription>
              Customer photos and quotes appear in the About Us carousel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                data-testid="input-customer-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vehicle</Label>
                <Input
                  placeholder="2024 Tesla Model Y"
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  data-testid="input-vehicle"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="Lagos, Nigeria"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  data-testid="input-location"
                />
              </div>
            </div>
            <div>
              <Label>Quote *</Label>
              <Textarea
                rows={4}
                placeholder="What the customer said about their experience..."
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                data-testid="input-quote"
              />
            </div>
            <div>
              <Label>Photo {editing ? '(leave empty to keep current)' : '*'}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                data-testid="input-photo"
              />
              {editing && !photoFile && (
                <img
                  src={editing.photoUrl}
                  alt=""
                  className="mt-2 w-32 h-32 object-cover rounded-md border"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  data-testid="input-order"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    data-testid="checkbox-active"
                  />
                  <span className="text-sm">Show on website</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.customerName || !form.quote || (!editing && !photoFile)}
              data-testid="button-save-testimonial"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the testimonial permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
