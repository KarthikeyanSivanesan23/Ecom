import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { SparklesIcon } from "lucide-react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Badge } from "./badge";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface CarouselProps {
  images: { src: string; alt: string }[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right {
    background: none;
  }
  
  .swiper-button-next,
  .swiper-button-prev {
    color: #d97706;
  }
  
  .swiper-pagination-bullet-active {
    background: #d97706;
  }
  `;

  return (
    <section className="w-full">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-5xl rounded-[24px] border border-primary-100 p-2 shadow-premium md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-primary-100 bg-white p-4 shadow-premium md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-6">
          <Badge
            variant="outline"
            className="absolute left-4 top-6 rounded-[14px] border-accent-200 bg-accent-50 text-sm md:left-6"
          >
            <SparklesIcon className="fill-accent-400 stroke-1 text-accent-600 mr-2 h-4 w-4" />
            Explore Now
          </Badge>
          <div className="flex flex-col justify-center pb-2 pl-4 pt-16 md:items-center">
            <div className="flex gap-2">
              <div>
                <h3 className="text-4xl font-display font-bold tracking-tight text-primary-900">
                  Explore Categories
                </h3>
                <p className="text-primary-500 mt-1">
                  Discover our curated collections
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <div className="w-full">
              <Swiper
                spaceBetween={30}
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="size-full rounded-3xl overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="size-full rounded-xl object-cover h-[400px]"
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
                {images.map((image, index) => (
                  <SwiperSlide key={`dup-${index}`}>
                    <div className="size-full rounded-3xl overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="size-full rounded-xl object-cover h-[400px]"
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
