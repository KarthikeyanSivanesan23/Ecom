import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Sparkles, ShoppingBag } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CarouselStacked from '../ui/carousel-07';

export default function Hero() {
  const [showContent, setShowContent] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollToNext = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity, scale }}
      className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 65% 45%, rgba(217,119,6,0.15) 0%, rgba(245,158,11,0.08) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(180,83,9,0.08) 0%, transparent 60%)',
          }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            top: '20%',
            right: '10%',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, #b45309, #92400e)',
            bottom: '10%',
            right: '25%',
          }}
        />

        {/* 3D Rotating Sphere */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ perspective: '1000px' }}
        >
          <div
            className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full relative opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, #d97706, #f59e0b, #b45309, #92400e, #d97706)',
              boxShadow: '0 0 100px rgba(217,119,6,0.5), inset 0 0 60px rgba(0,0,0,0.3)',
              transformStyle: 'preserve-3d',
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute inset-0 rounded-full border border-white/10"
                style={{ transform: `rotateX(${i * 22.5}deg)` }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute inset-0 rounded-full border border-white/10"
                style={{ transform: `rotateY(${i * 22.5}deg)` }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)',
              }}
            />
          </div>
        </motion.div>

        {/* Orbiting Rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] pointer-events-none"
          animate={{ rotateX: 70, rotateZ: 360 }}
          transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 30, repeat: Infinity, ease: 'linear' } }}
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-accent-400/10" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[650px] sm:h-[650px] pointer-events-none"
          animate={{ rotateX: 60, rotateZ: -360 }}
          transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 25, repeat: Infinity, ease: 'linear' } }}
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 rounded-full border border-accent-500/10" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] pointer-events-none"
          animate={{ rotateX: 50, rotateZ: 360 }}
          transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 35, repeat: Infinity, ease: 'linear' } }}
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 rounded-full border border-accent-600/5" />
        </motion.div>

        {/* Floating Geometric Shapes */}
        {[
          { x: '10%', y: '20%', size: 30, color: '#fbbf24', delay: 0, shape: 'square' },
          { x: '85%', y: '25%', size: 25, color: '#d97706', delay: 1, shape: 'circle' },
          { x: '5%', y: '75%', size: 20, color: '#b45309', delay: 2, shape: 'square' },
          { x: '90%', y: '70%', size: 35, color: '#92400e', delay: 0.5, shape: 'circle' },
          { x: '50%', y: '10%', size: 18, color: '#f59e0b', delay: 1.5, shape: 'square' },
          { x: '50%', y: '90%', size: 22, color: '#d97706', delay: 2.5, shape: 'circle' },
        ].map((shape, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: shape.x, top: shape.y }}
            animate={{
              y: [0, -20, 0],
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: shape.delay },
              rotateX: { duration: 8 + i, repeat: Infinity, ease: 'linear' },
              rotateY: { duration: 6 + i, repeat: Infinity, ease: 'linear' },
            }}
          >
            <div
              style={{
                width: shape.size,
                height: shape.size,
                background: `linear-gradient(135deg, ${shape.color}80, ${shape.color}40)`,
                boxShadow: `0 0 15px ${shape.color}30`,
                transformStyle: 'preserve-3d',
              }}
              className={shape.shape === 'circle' ? 'rounded-full' : 'rounded-md'}
            />
          </motion.div>
        ))}

        {/* Floating Particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 4,
            }}
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#d97706' : '#f59e0b',
            }}
          />
        ))}
      </div>

      {/* Content - Mobile: Text first, then carousel, then buttons */}
      <motion.div style={{ y }} className="relative z-10 w-full container-premium">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center min-h-screen py-28 gap-8">
          {/* Badge + Heading - First on mobile */}
          <div className="text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent-400/30 bg-accent-500/10 text-xs font-semibold tracking-[0.2em] text-accent-400 uppercase mb-6">
                <Sparkles className="w-4 h-4" />
                New Collection
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h1 className="text-5xl sm:text-6xl font-display font-bold text-white leading-[0.95] tracking-tight">
                <span className="block">WEAR THE</span>
                <span className="block text-gradient">FUTURE.</span>
              </h1>
            </motion.div>
          </div>

          {/* Carousel - Middle on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={showContent ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-[320px] h-[350px]"
          >
            {/* Glow rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-accent-400/10 pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-6 rounded-full border border-accent-400/10 pointer-events-none"
            />

            {/* Central glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 m-auto w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(217,119,6,0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Carousel */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <CarouselStacked className="w-full h-full" autoPlay interval={1500} />
            </div>
          </motion.div>

          {/* Description + Buttons - Below on mobile */}
          <div className="text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-base text-primary-300 font-light mb-8 leading-relaxed">
                Premium fashion for the next era. Curated collections that define
                tomorrow's style.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/products?category=men"
                className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:from-accent-600 hover:to-accent-700 transition-all duration-300 hover:-translate-y-1 shadow-gold hover:shadow-gold-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                SHOP MEN
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?category=women"
                className="group relative inline-flex items-center justify-center gap-3 border-2 border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:border-accent-400/50 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
              >
                SHOP WOMEN
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-screen py-32">
          {/* Left text */}
          <div className="text-left px-4 lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-accent-400/30 bg-accent-500/10 text-xs font-semibold tracking-[0.2em] text-accent-400 uppercase mb-8">
                <Sparkles className="w-4 h-4" />
                New Collection
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.95] tracking-tight mb-6">
                <span className="block">WEAR THE</span>
                <span className="block text-gradient">FUTURE.</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-lg sm:text-xl text-primary-300 font-light max-w-lg mb-10 leading-relaxed">
                Premium fashion for the next era. Curated collections that define
                tomorrow's style.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/products?category=men"
                className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-10 py-4 rounded-xl font-semibold text-sm tracking-wide hover:from-accent-600 hover:to-accent-700 transition-all duration-300 hover:-translate-y-1 shadow-gold hover:shadow-gold-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                SHOP MEN
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?category=women"
                className="group relative inline-flex items-center justify-center gap-3 border-2 border-white/20 text-white px-10 py-4 rounded-xl font-semibold text-sm tracking-wide hover:border-accent-400/50 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
              >
                SHOP WOMEN
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right visual - Desktop */}
          <div className="flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={showContent ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-[450px] h-[450px] xl:w-[550px] xl:h-[500px]"
            >
              {/* Glow rings behind carousel */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-accent-400/10 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 rounded-full border border-accent-400/10 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-16 rounded-full border border-accent-400/10 pointer-events-none"
              />

              {/* Central glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 m-auto w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(217,119,6,0.4) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />

              {/* Stacked Carousel overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <CarouselStacked className="w-full h-full" autoPlay interval={1500} />
              </div>

              {/* Floating info cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -left-2 sm:top-2 sm:left-0 glass-premium rounded-2xl px-4 py-3 shadow-premium z-20"
              >
                <p className="text-[10px] font-bold tracking-[0.2em] text-accent-400">DRAG TO</p>
                <p className="text-[10px] tracking-widest text-primary-300">EXPLORE</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute -bottom-2 -right-2 sm:bottom-2 sm:right-0 glass-premium rounded-2xl px-4 py-3 shadow-premium z-20"
              >
                <p className="text-[10px] font-bold tracking-[0.2em] text-accent-400">5 STYLES</p>
                <p className="text-[10px] tracking-widest text-primary-300">AVAILABLE</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showContent ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 cursor-pointer group"
        onClick={scrollToNext}
        role="button"
        aria-label="Scroll to explore"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToNext();
          }
        }}
      >
        <span className="text-xs font-medium tracking-[0.3em] text-primary-400 uppercase group-hover:text-accent-400 transition-colors">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-primary-400 group-hover:text-accent-400 transition-colors" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
