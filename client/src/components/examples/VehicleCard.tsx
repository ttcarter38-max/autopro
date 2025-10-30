import VehicleCard from '../VehicleCard';
import whiteSUV from '@assets/generated_images/White_luxury_SUV_studio_shot_f7358436.png';

export default function VehicleCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <VehicleCard
        id={1}
        name="Cayenne Models"
        image={whiteSUV}
        price={67200}
        rating={4.5}
        ratingCount={2136}
        condition="New"
        year={2024}
        transmission="Automatic"
        color="White"
        topSpeed="159 mph"
      />
    </div>
  );
}
