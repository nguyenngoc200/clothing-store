'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { Product } from '@/types/database';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showViewMore?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
}

export function ProductCarousel({
  products,
  title,
  showViewMore = false,
  autoplay = true,
  autoplayDelay = 3000,
}: ProductCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  const plugin = React.useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      // Optional: Handle carousel slide change
    });
  }, [api]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">Chưa có sản phẩm nào được chọn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-headline">{title}</h2>
          {showViewMore && (
            <a href="/products" className="text-sm font-semibold underline hover:no-underline">
              Xem Thêm
            </a>
          )}
        </div>
      )}

      <Carousel
        setApi={setApi}
        plugins={autoplay ? [plugin.current] : []}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition">
                <div className="relative aspect-square bg-neutral-100">
                  <div className="absolute top-3 right-3 z-10">
                    <button className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-neutral-500 mb-1">
                    {product.category_id || 'Uncategorized'}
                  </p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.title}</h3>
                  <p className="font-bold text-base">
                    {product.suggested
                      ? product.suggested.toLocaleString('vi-VN')
                      : product.purchase_price
                        ? product.purchase_price.toLocaleString('vi-VN')
                        : 'N/A'}
                    ₫
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 md:left-4">
          <span className="sr-only">Previous</span>
        </CarouselPrevious>
        <CarouselNext className="right-2 md:right-4">
          <span className="sr-only">Next</span>
        </CarouselNext>
      </Carousel>
    </div>
  );
}
