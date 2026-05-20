import React, { useEffect, useRef } from 'react';

export const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - binary & cyber runes
    const characters = '01011010100110101011100010110110101010101010110101001010101010101001010';
    const charArray = characters.split('');
    
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    
    // Drops tracking (y-coordinate)
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Offset starting position to staggered drops
    }

    const draw = () => {
      // Semi-transparent background to create trail effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text parameters
      ctx.font = `500 ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Dynamic coloring (fade from cyan to purple/dark)
        const greenValue = Math.floor(Math.random() * 80) + 120;
        const blueValue = Math.floor(Math.random() * 120) + 130;
        ctx.fillStyle = `rgba(6, ${greenValue}, ${blueValue}, 0.18)`; // Cyan-green glow

        // Draw character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        // Reset drop when off screen
        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }

        drops[i] += 0.8; // Falling speed
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50 bg-[#030712]"
    />
  );
};

export default MatrixBackground;
