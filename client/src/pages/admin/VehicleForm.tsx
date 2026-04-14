import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, X, ImagePlus, Star } from 'lucide-react';

const vehicleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  condition: z.enum(['new', 'used']),
  price: z.string().min(1, 'Price is required'),
  mileage: z.coerce.number().optional(),
  color: z.string().min(1, 'Color is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  topSpeed: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function VehicleForm() {
  const [, params] = useRoute('/admin/vehicles/:id/edit');
  const isEdit = !!params?.id;
  const vehicleId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [savedImages, setSavedImages] = useState<any[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: vehicleData } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: isEdit && !!vehicleId,
  });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      condition: 'new',
      price: '',
      mileage: 0,
      color: '',
      transmission: 'Automatic',
      topSpeed: '',
      description: '',
      featured: false,
      available: true,
    },
  });

  useEffect(() => {
    if (vehicleData?.vehicle) {
      const v = vehicleData.vehicle;
      form.reset({
        name: v.name,
        make: v.make,
        model: v.model,
        year: v.year,
        condition: v.condition,
        price: v.price.toString(),
        mileage: v.mileage || 0,
        color: v.color,
        transmission: v.transmission,
        topSpeed: v.topSpeed || '',
        description: v.description || '',
        featured: v.featured || false,
        available: v.available ?? true,
      });
      setSavedImages(vehicleData.images || []);
    }
  }, [vehicleData, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setPendingFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPendingPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removePending = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPendingPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPendingImages = async (vid: number) => {
    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`/api/admin/vehicles/${vid}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Image upload failed');
      }
      const data = await response.json();
      setSavedImages(prev => [...prev, data.image]);
    }
    setPendingFiles([]);
    setPendingPreviews([]);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const url = isEdit ? `/api/admin/vehicles/${vehicleId}` : '/api/admin/vehicles';
      const method = isEdit ? 'PATCH' : 'POST';

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save vehicle');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      const vid = data.vehicle?.id || vehicleId;
      if (pendingFiles.length > 0 && vid) {
        setUploading(true);
        try {
          await uploadPendingImages(vid);
        } catch (err: any) {
          toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
        }
        setUploading(false);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vehicles'] });
      toast({
        title: isEdit ? 'Vehicle updated' : 'Vehicle created',
        description: `The vehicle has been successfully ${isEdit ? 'updated' : 'created'}.`,
      });
      setLocation('/admin/vehicles');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleDeleteSavedImage = async (imageId: number) => {
    try {
      await apiRequest('DELETE', `/api/admin/vehicles/images/${imageId}`);
      setSavedImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: 'Image removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    if (!vehicleId) return;
    try {
      await apiRequest('PATCH', `/api/admin/vehicles/${vehicleId}/images/${imageId}/primary`);
      setSavedImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })));
      toast({ title: 'Primary image updated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const onSubmit = (data: VehicleFormData) => {
    saveMutation.mutate(data);
  };

  const isBusy = saveMutation.isPending || uploading;
  const totalImages = savedImages.length + pendingFiles.length;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Update vehicle information and images' : 'Add a new vehicle to your inventory'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024 BMW M3 Competition" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., BMW" {...field} data-testid="input-make" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., M3 Competition" {...field} data-testid="input-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-condition">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alpine White" {...field} data-testid="input-color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transmission">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="CVT">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-mileage" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="topSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Speed (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 180 mph" {...field} data-testid="input-topspeed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter vehicle description..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Featured on homepage</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-available" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Available for sale</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label
                  htmlFor="image-upload-input"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-md cursor-pointer hover-elevate transition-colors"
                  data-testid="label-image-upload"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Click to select photos</span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — up to 5 MB each</span>
                  <Input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    data-testid="input-upload-images"
                  />
                </label>

                {totalImages === 0 && (
                  <p className="text-sm text-muted-foreground text-center">No photos added yet</p>
                )}

                {(savedImages.length > 0 || pendingFiles.length > 0) && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {savedImages.map((image) => (
                      <div key={image.id} className="relative group aspect-square">
                        <img
                          src={image.imageUrl}
                          alt="Vehicle"
                          className="w-full h-full object-cover rounded-md"
                        />
                        {image.isPrimary && (
                          <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-3 h-3" /> Primary
                          </span>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!image.isPrimary && isEdit && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              title="Set as primary"
                              onClick={() => handleSetPrimary(image.id)}
                            >
                              <Star className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteSavedImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {pendingPreviews.map((preview, index) => (
                      <div key={`pending-${index}`} className="relative group aspect-square">
                        <img
                          src={preview}
                          alt="Pending upload"
                          className="w-full h-full object-cover rounded-md opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                          <span className="text-white text-xs font-medium">Pending</span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePending(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {pendingFiles.length} photo{pendingFiles.length !== 1 ? 's' : ''} will be uploaded when you save
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={isBusy} data-testid="button-save">
                {isBusy
                  ? uploading ? 'Uploading photos...' : 'Saving...'
                  : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/admin/vehicles')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
