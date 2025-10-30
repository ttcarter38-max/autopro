import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function VehicleSearchBar() {
  return (
    <div className="bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-xl md:text-2xl font-semibold mb-8 text-muted-foreground" data-testid="text-search-title">
          UNSURE WHICH VEHICLE YOU ARE LOOKING FOR? FIND IT HERE
        </h3>

        <div className="bg-card border border-card-border rounded-md p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger data-testid="select-make">
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="porsche">Porsche</SelectItem>
                <SelectItem value="lamborghini">Lamborghini</SelectItem>
                <SelectItem value="ferrari">Ferrari</SelectItem>
                <SelectItem value="bmw">BMW</SelectItem>
                <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger data-testid="select-model">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="911">911 Carrera</SelectItem>
                <SelectItem value="cayenne">Cayenne</SelectItem>
                <SelectItem value="panamera">Panamera</SelectItem>
                <SelectItem value="macan">Macan</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger data-testid="select-price">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                <SelectItem value="200000+">$200,000+</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full" data-testid="button-search-vehicles">
              <Search className="w-4 h-4 mr-2" />
              SEARCH VEHICLES
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
