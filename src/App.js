import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SNAKE_SPEED = 100; // Snake speed in milliseconds
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 9 },
  { x: 10, y: 8 },
];
const INITIAL_DIRECTION = { x: 0, y: 1 }; // Snake starts moving down

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const canvasRef = useRef(null);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    const resizeListener = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', resizeListener);
    window.addEventListener('orientationchange', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('orientationchange', resizeListener);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Handle touch gestures
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && direction.x === 0) {
        setDirection({ x: 1, y: 0 }); // Swipe right
      } else if (deltaX < 0 && direction.x === 0) {
        setDirection({ x: -1, y: 0 }); // Swipe left
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction.y === 0) {
        setDirection({ x: 0, y: 1 }); // Swipe down
      } else if (deltaY < 0 && direction.y === 0) {
        setDirection({ x: 0, y: -1 }); // Swipe up
      }
    }

    // Reset touch starting coordinates
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = newSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (newHead.x === food.x && newHead.y === food.y) {
          setFood({
            x: Math.floor(Math.random() * (screenSize.width / 20)),
            y: Math.floor(Math.random() * (screenSize.height / 20)),
          });
        } else {
          newSnake.pop(); // Remove tail if no food is eaten
        }

        newSnake.unshift(newHead); // Add new head

        return newSnake;
      });
    }, SNAKE_SPEED);

    return () => clearInterval(gameLoop);
  }, [direction, food, screenSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, screenSize.width, screenSize.height);
    
    // Draw Snake
    snake.forEach((segment) => {
      ctx.fillStyle = 'green';
      ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });

    // Draw Food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
  }, [snake, food, screenSize]);

  return (
    <canvas
      ref={canvasRef}
      width={screenSize.width}
      height={screenSize.height}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ display: 'block', width: '100vw', height: '100vh' }}
    ></canvas>
  );
}

export default App;
