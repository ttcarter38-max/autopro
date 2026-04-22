import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMakes, getModels } from '@/data/vehicles';

interface VehicleSearchBarProps {
  onSearch?: (filters: {
    make?: string;
    model?: string;
    priceRange?: string;
  }) => void;
}

export default function VehicleSearchBar({ onSearch }: VehicleSearchBarProps) {
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const makes = getMakes();
  const models = getModels(make);

  const handleSearch = () => {
    if (!make && !model && !priceRange) {
      toast({
        title: t('searchBar.needCriteriaTitle'),
        description: t('searchBar.needCriteriaDesc'),
        variant: "destructive",
      });
      return;
    }

    const searchText = [
      make && `${t('searchBar.make')}: ${make}`,
      model && `${t('searchBar.model')}: ${model}`,
      priceRange && `${t('searchBar.priceRange')}: ${priceRange}`,
    ].filter(Boolean).join(', ');

    toast({
      title: t('searchBar.resultsTitle'),
      description: t('searchBar.resultsDesc', { criteria: searchText }),
    });

    if (onSearch) {
      onSearch({ make, model, priceRange });
    }
  };

  return (
    <div className="bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-xl md:text-2xl font-semibold mb-8 text-muted-foreground" data-testid="text-search-title">
          {t('searchBar.title')}
        </h3>

        <div className="bg-card border border-card-border rounded-md p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={make} onValueChange={(value) => {
              setMake(value);
              setModel('');
            }}>
              <SelectTrigger data-testid="select-make">
                <SelectValue placeholder={t('searchBar.make')} />
              </SelectTrigger>
              <SelectContent>
                {makes.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={model} onValueChange={setModel} disabled={!make}>
              <SelectTrigger data-testid="select-model">
                <SelectValue placeholder={t('searchBar.model')} />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger data-testid="select-price">
                <SelectValue placeholder={t('searchBar.priceRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                <SelectItem value="200000+">$200,000+</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full" onClick={handleSearch} data-testid="button-search-vehicles">
              <Search className="w-4 h-4 mr-2" />
              {t('searchBar.search')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
