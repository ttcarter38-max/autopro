import { Car, Users, Wrench, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatisticsSection() {
  const stats = [
    { icon: Car, value: '1886', label: 'NEW CARS IN STOCK' },
    { icon: Car, value: '1248', label: 'USED CARS IN STOCK' },
    { icon: Users, value: '12,481', label: 'HAPPY CLIENTS' },
    { icon: Wrench, value: '28,681', label: 'CARS SPARE PARTS' },
  ];

  return (
    <div className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-about-eyebrow">
            ABOUT AUTOPRO
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-about-title">
            WELCOME TO AUTOPRO CAR DEALER
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-5xl md:text-6xl font-heading font-bold mb-2" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-muted-foreground" data-testid={`text-stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-card-border rounded-md p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Award className="w-16 h-16 text-primary" />
            <div>
              <p className="text-sm font-semibold mb-1" data-testid="text-question">HAVE A QUESTION?</p>
              <p className="text-2xl font-bold" data-testid="text-call-us">CALL US: 1-800-CAR-DEAL</p>
            </div>
          </div>
          <Button size="lg" variant="default" data-testid="button-learn-more">
            LEARN MORE
          </Button>
        </div>
      </div>
    </div>
  );
}
