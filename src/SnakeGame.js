import React, { useState, useEffect, useRef } from "react";

// Konstanty
let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;
const BLOCK_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const SNAKE_SPEED = 150; // Snake speed in milliseconds

const getRandomPosition = () => {
  const x = Math.floor(Math.random() * (CANVAS_WIDTH / BLOCK_SIZE)) * BLOCK_SIZE;
  const y = Math.floor(Math.random() * (CANVAS_HEIGHT / BLOCK_SIZE)) * BLOCK_SIZE;
  return [x, y];
};

const SnakeGame = ({ width, height }) => {
    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState([BLOCK_SIZE, 0]); // Initial movement (right)
  const [food, setFood] = useState(getRandomPosition);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Inicializace hada
  useEffect(() => {
    const initialSnake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      initialSnake.push([CANVAS_WIDTH / 2 - i * BLOCK_SIZE, CANVAS_HEIGHT / 2]);
    }
    setSnake(initialSnake);
  }, []);

  // Změna směru
  const changeDirection = (e) => {
    const { key } = e;
    if (key === "ArrowUp" && direction[1] === 0) setDirection([0, -BLOCK_SIZE]);
    if (key === "ArrowDown" && direction[1] === 0) setDirection([0, BLOCK_SIZE]);
    if (key === "ArrowLeft" && direction[0] === 0) setDirection([-BLOCK_SIZE, 0]);
    if (key === "ArrowRight" && direction[0] === 0) setDirection([BLOCK_SIZE, 0]);
  };

  // Změna směru na základě tažení
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - canvasRef.current.getBoundingClientRect().left;
    const deltaY = touch.clientY - canvasRef.current.getBoundingClientRect().top;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontální pohyb
      if (deltaX > 0 && direction[0] === 0) setDirection([BLOCK_SIZE, 0]);
      if (deltaX < 0 && direction[0] === 0) setDirection([-BLOCK_SIZE, 0]);
    } else {
      // Vertikální pohyb
      if (deltaY > 0 && direction[1] === 0) setDirection([0, BLOCK_SIZE]);
      if (deltaY < 0 && direction[1] === 0) setDirection([0, -BLOCK_SIZE]);
    }
  };

  // Hlavní herní smyčka
  useEffect(() => {
    const moveSnake = () => {
      const newSnake = [...snake];
      const newHead = [newSnake[0][0] + direction[0], newSnake[0][1] + direction[1]];

      // Kontrola nárazu do stěn
      if (
        newHead[0] < 0 ||
        newHead[0] >= CANVAS_WIDTH ||
        newHead[1] < 0 ||
        newHead[1] >= CANVAS_HEIGHT
      ) {
        setIsGameOver(true);
        return;
      }

      // Kontrola nárazu do vlastního těla
      if (newSnake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        setIsGameOver(true);
        return;
      }

      newSnake.unshift(newHead);

      // Kontrola kolize s jablkem
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setFood(getRandomPosition); // Nové jablko
        setScore(score + 1);
      } else {
        newSnake.pop(); // Pokud se nejí jablko, odstraní se poslední segment hada
      }

      setSnake(newSnake);
    };

    if (!isGameOver) {
      const intervalId = setInterval(moveSnake, SNAKE_SPEED);
      return () => clearInterval(intervalId); // Vyčištění intervalu
    }
  }, [snake, direction, food, isGameOver]);

  // Detekce kláves a dotyků
  useEffect(() => {
    window.addEventListener("keydown", changeDirection);
    canvasRef.current.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("keydown", changeDirection);
      canvasRef.current.removeEventListener("touchmove", handleTouchMove);
    };
  }, [direction]);

  // Vykreslení na canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Vyčištění canvasu
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Vykreslení hada
    ctx.fillStyle = "purple";
    snake.forEach(([x, y]) => {
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    });

    // Vykreslení jablka
    ctx.fillStyle = "red";
    ctx.fillRect(food[0], food[1], BLOCK_SIZE, BLOCK_SIZE);

    // Zobrazení skóre
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Skóre: ${score}`, 10, 20);

    // Zpráva o prohře
    if (isGameOver) {
      ctx.fillStyle = "red";
      ctx.font = "40px Arial";
      ctx.fillText("Prohrál jsi! Stiskni F5 pro restart.", CANVAS_WIDTH / 6, CANVAS_HEIGHT / 2);
    }
  }, [snake, food, score, isGameOver]);

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: "1px solid black" }} />
    </div>
  );
};

export default SnakeGame;
