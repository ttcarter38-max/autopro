import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function AdminVehicles() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['/api/admin/vehicles'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vehicles'] });
      toast({
        title: 'Vehicle deleted',
        description: 'The vehicle has been successfully removed.',
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const vehicles = vehiclesData?.vehicles || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Vehicles</h2>
            <p className="text-muted-foreground">Manage your vehicle inventory</p>
          </div>
          <Button asChild data-testid="button-add-vehicle">
            <a href="/admin/vehicles/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No vehicles yet</p>
                <Button asChild>
                  <a href="/admin/vehicles/new">Add your first vehicle</a>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>${parseFloat(vehicle.price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.condition === 'new' ? 'default' : 'secondary'}>
                          {vehicle.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                          {vehicle.available ? 'Available' : 'Sold'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid={`button-edit-${vehicle.id}`}
                          >
                            <a href={`/admin/vehicles/${vehicle.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(vehicle.id)}
                            data-testid={`button-delete-${vehicle.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
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
