import { useEffect, useRef, useState } from 'react';
interface Concept {
  id: string;
  title: string;
  slug: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulsePhase: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
}

interface Props {
  pages: Array<{ slug: string; title: string; description: string; tags: string[] }>;
}

export function BrainViz({ pages }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const conceptsRef = useRef<Concept[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [hoveredConcept, setHoveredConcept] = useState<Concept | null>(null);
  const hoveredConceptRef = useRef<Concept | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize concepts in brain-like distribution
    const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
    const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
    
    conceptsRef.current = pages.map((page, i) => {
      const angle = (i / pages.length) * Math.PI * 2;
      const radius = 80 + Math.random() * 120;
      return {
        id: page.slug,
        title: page.title,
        slug: page.slug,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 50 + Math.random() * 30,
        pulsePhase: Math.random() * Math.PI * 2,
        orbitRadius: radius,
        orbitSpeed: 0.0003 + Math.random() * 0.0005,
        orbitAngle: angle,
      };
    });

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };

      // Check hover
      let found: Concept | null = null;
      for (const concept of conceptsRef.current) {
        const dx = mouseRef.current.x - concept.x;
        const dy = mouseRef.current.y - concept.y;
        if (Math.sqrt(dx * dx + dy * dy) < concept.size / 2 + 10) {
          found = concept;
          break;
        }
      }
      hoveredConceptRef.current = found;
      setHoveredConcept(found);
      canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      hoveredConceptRef.current = null;
      setHoveredConcept(null);
      canvas.style.cursor = 'default';
    };

    const handleClick = () => {
      if (hoveredConceptRef.current) {
        window.location.href = `/${hoveredConceptRef.current.slug}`;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;
      timeRef.current += 1;

      ctx.clearRect(0, 0, width, height);

      // Draw brain outline (subtle glow)
      const brainGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 220
      );
      brainGradient.addColorStop(0, 'rgba(96, 165, 250, 0.08)');
      brainGradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.04)');
      brainGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
      ctx.fillStyle = brainGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 220, 0, Math.PI * 2);
      ctx.fill();

      // Draw neural connections
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < conceptsRef.current.length; i++) {
        for (let j = i + 1; j < conceptsRef.current.length; j++) {
          const a = conceptsRef.current[i];
          const b = conceptsRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.3;
            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw concepts
      for (const concept of conceptsRef.current) {
        // Orbital motion around center
        concept.orbitAngle += concept.orbitSpeed;
        const targetX = centerX + Math.cos(concept.orbitAngle) * concept.orbitRadius;
        const targetY = centerY + Math.sin(concept.orbitAngle) * concept.orbitRadius;
        
        // Smooth attraction to orbital position
        concept.vx += (targetX - concept.x) * 0.001;
        concept.vy += (targetY - concept.y) * 0.001;

        // Apply velocity with damping
        concept.vx *= 0.95;
        concept.vy *= 0.95;
        concept.x += concept.vx;
        concept.y += concept.vy;

        // Keep in bounds with soft edges
        const margin = 60;
        if (concept.x < margin) concept.vx += 0.1;
        if (concept.x > width - margin) concept.vx -= 0.1;
        if (concept.y < margin) concept.vy += 0.1;
        if (concept.y > height - margin) concept.vy -= 0.1;

        // Pulse animation
        const pulse = Math.sin(timeRef.current * 0.02 + concept.pulsePhase) * 0.1 + 1;
        const currentSize = concept.size * pulse;
        const isHovered = hoveredConceptRef.current?.id === concept.id;

        // Draw concept node
        const nodeGradient = ctx.createRadialGradient(
          concept.x, concept.y, 0,
          concept.x, concept.y, currentSize / 2
        );
        
        if (isHovered) {
          nodeGradient.addColorStop(0, 'rgba(96, 165, 250, 0.9)');
          nodeGradient.addColorStop(0.6, 'rgba(96, 165, 250, 0.4)');
          nodeGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
        } else {
          nodeGradient.addColorStop(0, 'rgba(96, 165, 250, 0.6)');
          nodeGradient.addColorStop(0.6, 'rgba(96, 165, 250, 0.2)');
          nodeGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
        }
        
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(concept.x, concept.y, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(concept.x, concept.y, isHovered ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.font = isHovered ? 'bold 14px Inter, system-ui' : '12px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(concept.title, concept.x, concept.y + currentSize / 2 + 16);
      }

      // Draw pulsing neural activity
      const numPulses = 3;
      for (let i = 0; i < numPulses; i++) {
        const pulsePhase = (timeRef.current * 0.015 + i * (Math.PI * 2 / numPulses)) % (Math.PI * 2);
        const pulseRadius = (Math.sin(pulsePhase) * 0.5 + 0.5) * 180 + 40;
        const pulseAlpha = Math.cos(pulsePhase) * 0.03 + 0.03;
        
        ctx.strokeStyle = `rgba(96, 165, 250, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pages]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[500px] md:h-[600px]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {hoveredConcept && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-bg-secondary/90 backdrop-blur-sm rounded-xl border border-border shadow-xl text-center">
          <p className="text-lg font-semibold text-accent">{hoveredConcept.title}</p>
          <p className="text-sm text-text-secondary mt-1">Click to explore →</p>
        </div>
      )}
    </div>
  );
}

