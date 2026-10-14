"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "motion/react";
import { cn } from "../../lib/utils";
import api from "../../utils/api";

interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
}

const defaultSlides: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=750&fit=crop",
    title: "Urban Style",
    description: "Modern fashion for the city dweller.",
    badge: "Trending",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=750&fit=crop",
    title: "Summer Collection",
    description: "Light and breezy styles for warm days.",
    badge: "New",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop",
    title: "Street Fashion",
    description: "Bold looks that make a statement.",
    badge: "Hot",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=750&fit=crop",
    title: "Elegant Wear",
    description: "Timeless pieces for special occasions.",
    badge: "Premium",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=750&fit=crop",
    title: "Athleisure",
    description: "Comfort meets style in every piece.",
    badge: "Popular",
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
};

interface CarouselStackedProps {
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  products?: Slide[];
}

const CarouselStacked = ({ className, autoPlay = false, interval = 1500, products }: CarouselStackedProps) => {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(0);
  const isDragging = React.useRef(false);
  const [slides, setSlides] = React.useState<Slide[]>(products || defaultSlides);

  const total = slides.length;

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await api.get('/carousel-products');
      const data = res.data.data;
      if (data && data.length > 0) {
        const activeSlides = data
          .filter((p: any) => p.isActive)
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
          .map((p: any) => ({
            image: p.image,
            title: p.title,
            description: p.description,
            badge: p.badge,
          }));
        if (activeSlides.length > 0) {
          setSlides(activeSlides);
        }
      }
    } catch {
      // Use default slides
    }
  }, []);

  React.useEffect(() => {
    if (products) {
      setSlides(products);
      return;
    }

    fetchProducts();

    // Listen for carousel update events
    const handleCarouselUpdate = () => {
      fetchProducts();
    };
    window.addEventListener('carousel-products-updated', handleCarouselUpdate);

    // Also refresh when window gets focus (user returns from admin)
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('carousel-products-updated', handleCarouselUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [products, fetchProducts]);

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      if (!isDragging.current) {
        const current = scrollProgress.get();
        const target = Math.round(current) + 1;
        animate(scrollProgress, target, {
          type: "spring",
          stiffness: 200,
          damping: 30,
          mass: 1,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, scrollProgress, total]);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    isDragging.current = true;
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    isDragging.current = false;
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });
  };

  return (
    <div className={cn("flex items-center justify-center w-full overflow-hidden select-none", className)}>
      <div className="relative w-full h-72 sm:h-80 lg:h-96 flex items-center justify-center">
        {/* Transparent Drag Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {slides.map((slide, i) => (
          <Card
            key={`${slide.title}-${i}`}
            slide={slide}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ slide, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute rounded-2xl overflow-hidden bg-muted group pointer-events-none",
        "w-36 h-48 sm:w-44 sm:h-56 lg:w-52 lg:h-72",
      )}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
      />

      <motion.div
        style={{
          opacity: useTransform(
            offset,
            [-2, -0.5, 0, 0.5, 2],
            [0.5, 0.2, 0, 0.2, 0.5],
          ),
        }}
        className="absolute inset-0 bg-black pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-accent-500/90 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">
        {slide.badge}
      </div>

      <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-4 sm:right-4 lg:bottom-6 lg:left-5 lg:right-5 text-white text-center sm:text-left">
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="text-xs sm:text-sm lg:text-base font-bold leading-tight mb-0.5 drop-shadow-md"
        >
          {slide.title}
        </motion.p>
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="hidden sm:block text-[10px] sm:text-xs text-white/70 line-clamp-2 italic font-medium"
        >
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CarouselStacked;
