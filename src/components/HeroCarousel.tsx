'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface HeroCarouselProps {
  images: string[];
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function HeroCarousel({
  images,
  title,
  description,
  buttonText,
  className = '',
}: HeroCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      // Optional: Handle carousel slide change
    });
  }, [api]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-full bg-neutral-200 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {(title || description || buttonText) && (
          <div className="absolute bottom-8 left-8 text-white z-10">
            {title && (
              <h2 className="text-3xl lg:text-5xl font-bold font-headline mb-2 tracking-tight">
                {title}
              </h2>
            )}
            {description && <p className="text-base lg:text-lg mb-4 max-w-md">{description}</p>}
            {buttonText && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
              >
                {buttonText}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative w-full h-full min-h-[492px]">
                <Image
                  src={imageUrl}
                  alt={`${title || 'Hero'} ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {(title || description || buttonText) && (
                  <div className="absolute bottom-8 left-8 text-white z-10">
                    {title && (
                      <h2 className="text-3xl lg:text-5xl font-bold font-headline mb-2 tracking-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-base lg:text-lg mb-4 max-w-md">{description}</p>
                    )}
                    {buttonText && (
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
                      >
                        {buttonText}
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4 -translate-x-0">
              <span className="sr-only">Previous</span>
            </CarouselPrevious>
            <CarouselNext className="right-4 translate-x-0">
              <span className="sr-only">Next</span>
            </CarouselNext>
          </>
        )}
      </Carousel>
    </div>
  );
}
