import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SNAKE_SPEED = 100; // Rychlost hada je nyní 50 milisekund
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

  const appleImage = new Image();
  appleImage.src = './apple.png'; // Cesta k obrázku jablka
  appleImage.onload = () => {
    // Kód, který se má spustit po načtení obrázku
  };

  const [gameOver, setGameOver] = useState(false); // Přidání stavu pro ukončení hry
  const [score, setScore] = useState(0); // Přidání stavu pro skóre

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
      if (!gameOver) { // Kontrola, zda hra není ukončena
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          const head = newSnake[0];
          const newHead = { x: head.x + direction.x, y: head.y + direction.y };

          // Kontrola kolize s okrajem obrazovky
          if (
            newHead.x < 0 || // Levý okraj
            newHead.x >= screenSize.width / 20 || // Pravý okraj
            newHead.y < 0 || // Horní okraj
            newHead.y >= screenSize.height / 20 // Dolní okraj
          ) {
            setGameOver(true); // Ukončen�� hry
          }

          // Kontrola kolize s jídlem
          if (newHead.x === food.x && newHead.y === food.y) {
            setFood({
              x: Math.floor(Math.random() * (screenSize.width / 20)),
              y: Math.floor(Math.random() * (screenSize.height / 20)),
            });
            setScore(prevScore => prevScore + 1); // Zvyšte skóre
          } else {
            newSnake.pop(); // Odstranění ocasu, pokud není jídlo snědeno
          }

          // Kontrola kolize s vlastním tělem
          if (newSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            setGameOver(true); // Ukončení hry
          }

          newSnake.unshift(newHead); // Přidání nového hlavy

          return newSnake;
        });
      }
    }, SNAKE_SPEED);

    return () => clearInterval(gameLoop);
  }, [direction, food, screenSize, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, screenSize.width, screenSize.height);
    
    // Draw Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = 'green';
      if (index === 0) { // Hlava hada
        // Vykreslení polokoule pro hlavu
        ctx.beginPath();
        ctx.arc(segment.x * 20 + 10, segment.y * 20 + 20, 10, 0, Math.PI, true); // Polokoule
        ctx.fill();
        
        // Vykreslení očí
        ctx.fillStyle = 'white'; // Barva očí
        ctx.beginPath();
        ctx.arc(segment.x * 20 + 5, segment.y * 20 + 15, 2, 0, Math.PI * 2); // Levé oko
        ctx.fill();
        ctx.beginPath();
        ctx.arc(segment.x * 20 + 15, segment.y * 20 + 15, 2, 0, Math.PI * 2); // Pravé oko
        ctx.fill();
      } else {
        // Vykreslení těla hada
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
      }
    });

    // Draw Food
    ctx.drawImage(appleImage, food.x * 20, food.y * 20, 20, 20); // Vykreslení jablka
  }, [snake, food, screenSize]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={screenSize.width} // Nastavení šířky plátna na šířku obrazovky
        height={screenSize.height} // Nastavení výšky plátna na výšku obrazovky
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ display: 'block', width: '100vw', height: '100vh' }} // Zajištění, že plátno zabírá celou obrazovku
      ></canvas>
      {gameOver && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '48px', color: 'red' }}>Game Over!</div>}
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '24px', color: 'black' }}>Score: {score}</div> {/* Zobrazení skóre */}
    </>
  );
}

export default App;
