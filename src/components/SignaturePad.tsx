import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  label: string;
  onSave: (base64: string) => void;
  existingSignature: string | null;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, onSave, existingSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // Track if we have loaded the existing signature to prevent overwriting
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Load existing signature onto canvas only once on mount
    if (existingSignature && canvasRef.current && !isLoadedRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = existingSignature;
        img.onload = () => {
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            isLoadedRef.current = true;
        };
    }
  }, []); // Empty dependency array ensures this runs only on mount

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent scrolling on touch devices
    if ('touches' in e) e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
     if ('touches' in e) e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        // Save after each stroke to capture the full signature
        onSave(canvasRef.current.toDataURL());
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onSave(''); // Clear the data in parent
      isLoadedRef.current = false; // Allow reloading if needed (though mainly for reset)
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
         <label className="block text-sm font-medium text-gray-700">{label}</label>
         <button
            type="button"
            onClick={clear}
            className="text-xs text-red-500 hover:text-red-700 underline font-medium px-2 py-1"
          >
            Clear Signature
          </button>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden relative shadow-sm">
          {/* 
             touch-none is CRITICAL: It tells the browser NOT to handle gestures/scrolling 
             inside this element, passing all touch events to our JS handlers.
          */}
          <canvas
              ref={canvasRef}
              width={400} 
              height={160}
              className="w-full h-40 bg-white cursor-crosshair touch-none block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 pointer-events-none select-none">
             Sign Above
          </div>
      </div>
    </div>
  );
};

export default SignaturePad;