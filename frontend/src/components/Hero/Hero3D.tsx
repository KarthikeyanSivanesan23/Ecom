import { motion } from 'framer-motion';

export default function Hero3D() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 3D Rotating Sphere */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ perspective: '1000px' }}
      >
        <div
          className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full relative"
          style={{
            background: 'conic-gradient(from 0deg, #d97706, #f59e0b, #b45309, #92400e, #d97706)',
            boxShadow: '0 0 100px rgba(217,119,6,0.5), inset 0 0 60px rgba(0,0,0,0.3)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Sphere texture lines */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute inset-0 rounded-full border border-white/10"
              style={{
                transform: `rotateX(${i * 22.5}deg)`,
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute inset-0 rounded-full border border-white/10"
              style={{
                transform: `rotateY(${i * 22.5}deg)`,
              }}
            />
          ))}
          {/* Shine effect */}
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]"
        animate={{ rotateX: 70, rotateZ: 360 }}
        transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 30, repeat: Infinity, ease: 'linear' } }}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-accent-400/20" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[650px] sm:h-[650px]"
        animate={{ rotateX: 60, rotateZ: -360 }}
        transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 25, repeat: Infinity, ease: 'linear' } }}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-full border border-accent-500/15" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px]"
        animate={{ rotateX: 50, rotateZ: 360 }}
        transition={{ rotateX: { duration: 0 }, rotateZ: { duration: 35, repeat: Infinity, ease: 'linear' } }}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-full border border-accent-600/10" />
      </motion.div>

      {/* Floating Geometric Shapes */}
      {[
        { x: '15%', y: '20%', size: 40, color: '#fbbf24', delay: 0 },
        { x: '80%', y: '25%', size: 35, color: '#d97706', delay: 1 },
        { x: '10%', y: '70%', size: 30, color: '#b45309', delay: 2 },
        { x: '85%', y: '75%', size: 45, color: '#92400e', delay: 0.5 },
        { x: '50%', y: '15%', size: 25, color: '#f59e0b', delay: 1.5 },
        { x: '50%', y: '85%', size: 28, color: '#d97706', delay: 2.5 },
      ].map((shape, i) => (
        <motion.div
          key={i}
          className="absolute"
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
              background: `linear-gradient(135deg, ${shape.color}, ${shape.color}88)`,
              boxShadow: `0 0 20px ${shape.color}40`,
              transformStyle: 'preserve-3d',
            }}
            className={i % 3 === 0 ? 'rounded-lg' : i % 3 === 1 ? 'rounded-full' : 'rounded-lg rotate-45'}
          />
        </motion.div>
      ))}

      {/* Floating Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-accent-400/30"
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 4,
          }}
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(217,119,6,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
