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
  FormDescription,
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
import { Upload, X } from 'lucide-react';

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
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
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
      setUploadedImages(vehicleData.images || []);
    }
  }, [vehicleData, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const url = isEdit
        ? `/api/admin/vehicles/${vehicleId}`
        : '/api/admin/vehicles';
      const method = isEdit ? 'PATCH' : 'POST';

      return await apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vehicles'] });
      toast({
        title: isEdit ? 'Vehicle updated' : 'Vehicle created',
        description: `The vehicle has been successfully ${isEdit ? 'updated' : 'added'}.`,
      });
      setLocation('/admin/vehicles');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !vehicleId) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`/api/admin/vehicles/${vehicleId}/images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setUploadedImages(prev => [...prev, data.image]);
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image',
          variant: 'destructive',
        });
      }
    }
    
    setUploading(false);
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await apiRequest(`/api/admin/vehicles/images/${imageId}`, {
        method: 'DELETE',
      });
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: 'Image deleted',
        description: 'The image has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const onSubmit = (data: VehicleFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Update vehicle information' : 'Add a new vehicle to your inventory'}
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
                        <Input placeholder="e.g., Cayenne Turbo" {...field} data-testid="input-name" />
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
                          <Input placeholder="e.g., Porsche" {...field} data-testid="input-make" />
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
                          <Input placeholder="e.g., Cayenne" {...field} data-testid="input-model" />
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
                          <Input type="number" {...field} data-testid="input-price" />
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
                          <Input placeholder="e.g., White" {...field} data-testid="input-color" />
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
                        <FormControl>
                          <Input placeholder="e.g., Automatic" {...field} data-testid="input-transmission" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-mileage" />
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
                        <Input placeholder="e.g., 159 mph" {...field} data-testid="input-topspeed" />
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
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Featured</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-available"
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Available</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {isEdit && vehicleId && (
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                        data-testid="input-upload-images"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload multiple vehicle images (max 5MB each)
                      </p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.imageUrl}
                              alt="Vehicle"
                              className="w-full aspect-square object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save"
              >
                {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
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
