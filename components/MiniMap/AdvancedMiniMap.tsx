import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';
import mapConfig from '../../config/mapConfig';
import { FaPlus, FaMinus, FaCompass } from 'react-icons/fa';

interface Box {
  id: string;
  x: number;
  y: number;
  type: string;
}

const modelColors: { [key: string]: string } = {
  default: '#808080',
  openai: '#00A67E',
  gemini: '#8E44AD',
  claude: '#4A90E2',
  meta: '#1877F2',
};

export interface AdvancedMiniMapProps {
  containerClassName?: string;
  boxes?: Box[];
  worldSize?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

const AdvancedMiniMap: React.FC<AdvancedMiniMapProps> = ({
  containerClassName = '',
  boxes: initialBoxes = [],
  worldSize = 1000,
  initialZoom = 1,
  minZoom = 0.25,
  maxZoom = 4
}) => {
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes);
  const [miniMapZoom, setMiniMapZoom] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (initialBoxes.length === 0) {
      const fetchBoxes = async () => {
        const boxesCollection = collection(db, 'boxes');
        const boxesSnapshot = await getDocs(boxesCollection);
        const boxesData = boxesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Box));
        setBoxes(boxesData);
      };
      fetchBoxes();
    }
  }, [initialBoxes]);

  const handleMiniMapZoom = (zoomIn: boolean, e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasSize = canvas.width;

    const mouseX = ((e.clientX - rect.left) / rect.width) * canvasSize;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvasSize;

    setMiniMapZoom(prev => {
      const zoomFactor = 1.05;
      const newZoom = zoomIn ? prev * zoomFactor : prev / zoomFactor;
      const clampedZoom = Math.min(Math.max(newZoom, minZoom), maxZoom);
      
      const zoomRatio = clampedZoom / prev;
      const newPanOffsetX = mouseX - (mouseX - panOffset.x) * zoomRatio;
      const newPanOffsetY = mouseY - (mouseY - panOffset.y) * zoomRatio;

      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
      
      return clampedZoom;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasSize = canvas.width;
      const currentX = ((e.clientX - rect.left) / rect.width) * canvasSize;
      const currentY = ((e.clientY - rect.top) / rect.height) * canvasSize;

      const dx = currentX - dragStart.x;
      const dy = currentY - dragStart.y;

      setPanOffset(prev => ({
        x: prev.x - dx,
        y: prev.y - dy
      }));

      setDragStart({ x: currentX, y: currentY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasSize = canvas.width;

    const clickX = ((e.clientX - rect.left) / rect.width) * canvasSize;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvasSize;

    setIsDragging(true);
    setDragStart({ x: clickX, y: clickY });
  };

  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = canvas.width;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    const gridSize = 50 * miniMapZoom;
    for (let i = -panOffset.x % gridSize; i <= canvasSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize);
      ctx.stroke();
    }
    for (let i = -panOffset.y % gridSize; i <= canvasSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize, i);
      ctx.stroke();
    }

    boxes.forEach(box => {
      const x = (box.x * miniMapZoom + canvasSize / 2) - panOffset.x;
      const y = (canvasSize / 2 - box.y * miniMapZoom) - panOffset.y;
      
      ctx.fillStyle = modelColors[box.type] || modelColors.default;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [boxes, miniMapZoom, panOffset]);

  useEffect(() => {
    drawMiniMap();
  }, [drawMiniMap]);

  return (
    <div className={`relative ${containerClassName}`}>
      <canvas
        ref={canvasRef}
        width={mapConfig.miniMapSize}
        height={mapConfig.miniMapSize}
        className="w-full h-full rounded-lg shadow-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => handleMiniMapZoom(e.deltaY < 0, e)}
      />
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          onClick={(e) => handleMiniMapZoom(true, e.nativeEvent as unknown as React.MouseEvent<HTMLCanvasElement>)} 
          className="p-2 bg-white bg-opacity-20 text-white rounded-full shadow-lg hover:bg-opacity-30 transition-all duration-200"
        >
          <FaPlus />
        </button>
        <button 
          onClick={(e) => handleMiniMapZoom(false, e.nativeEvent as unknown as React.MouseEvent<HTMLCanvasElement>)} 
          className="p-2 bg-white bg-opacity-20 text-white rounded-full shadow-lg hover:bg-opacity-30 transition-all duration-200"
        >
          <FaMinus />
        </button>
      </div>
      <div className="absolute top-4 left-4 p-2 bg-white bg-opacity-20 text-white rounded-full shadow-lg">
        <FaCompass className="text-2xl" />
      </div>
    </div>
  );
};

export default AdvancedMiniMap;