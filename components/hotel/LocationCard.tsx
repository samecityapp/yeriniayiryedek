import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationCardProps {
  address: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export default function LocationCard({
  address,
  latitude,
  longitude,
}: LocationCardProps) {
  if (!latitude || !longitude) return null;

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (isNaN(lat) || isNaN(lon)) return null;

  const delta = 0.005;
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;

  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;

  const directionsUrl = `http://googleusercontent.com/maps.google.com/maps?daddr=${lat},${lon}`;

  return (
    <Card className="overflow-hidden h-full flex flex-col shadow-sm border-border/50">
      <CardHeader className="pb-3 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-lg font-medium tracking-tight">
          <MapPin className="h-5 w-5 text-primary" />
          Konum
        </CardTitle>
      </CardHeader>

      <div className="relative w-full h-[250px] bg-muted z-0">
        <iframe
          title="Otel Konumu"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedMapUrl}
          className="filter grayscale-[10%] hover:grayscale-0 transition-all duration-500"
          loading="lazy"
        ></iframe>
      </div>

      <CardContent className="flex-grow flex flex-col justify-between pt-4 pb-5 gap-4 bg-card">
        <div className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground block mb-1">Adres:</span>
          {address}
        </div>

        <Button asChild className="w-full font-semibold tracking-wide shadow-sm" size="lg">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center">
            <MapPin className="h-4 w-4" />
            YOL TARİFİ AL
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
