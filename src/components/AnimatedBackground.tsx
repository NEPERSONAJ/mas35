import React, { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      distance: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      // Reduce number of particles for mobile
      const numParticles = isMobile ? 50 : 150;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * (isMobile ? 2 : 3) + 1.5,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * (isMobile ? 0.2 : 0.4) + 0.1,
          distance: Math.random() * (isMobile ? 200 : 300) + 100,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Adjust gradient position for mobile
      const gradientStartX = isMobile ? canvas.width - 200 : canvas.width - 400;
      const gradient = ctx.createLinearGradient(
        gradientStartX,
        0,
        canvas.width,
        canvas.height
      );
      
      gradient.addColorStop(0, 'rgba(217, 119, 6, 0.15)');
      gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Adjust center position for mobile
        const centerX = isMobile ? canvas.width - 100 : canvas.width - 200;
        const centerY = canvas.height * 0.6;

        particle.angle += particle.speed / 100;
        particle.x = centerX + Math.cos(particle.angle) * particle.distance;
        particle.y = centerY + Math.sin(particle.angle) * particle.distance;

        const gradientParticle = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 2
        );

        gradientParticle.addColorStop(0, 'rgba(217, 119, 6, 0.5)');
        gradientParticle.addColorStop(1, 'rgba(217, 119, 6, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradientParticle;
        ctx.fill();

        // Reduce connection distance for mobile
        const connectionDistance = isMobile ? 30 : 50;
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.2 * (1 - distance / connectionDistance)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default AnimatedBackground;