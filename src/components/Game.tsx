import { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
}

function Crosshair() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <div className="relative w-8 h-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/80 transform -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/80 transform -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 border-2 border-white/80 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}

export default function Game({ onExit }: { onExit?: () => void }) {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [kills, setKills] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, x: 30, y: 30, hp: 100 },
    { id: 2, x: 70, y: 40, hp: 100 },
    { id: 3, x: 50, y: 70, hp: 100 },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;

    const render = () => {
      if (keysPressed.current.has('w')) {
        setPosition(prev => ({ ...prev, y: Math.max(5, prev.y - 1) }));
      }
      if (keysPressed.current.has('s')) {
        setPosition(prev => ({ ...prev, y: Math.min(95, prev.y + 1) }));
      }
      if (keysPressed.current.has('a')) {
        setPosition(prev => ({ ...prev, x: Math.max(5, prev.x - 1) }));
      }
      if (keysPressed.current.has('d')) {
        setPosition(prev => ({ ...prev, x: Math.min(95, prev.x + 1) }));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#d4a574';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const blockSize = 80;
      ctx.fillStyle = '#c4956c';
      
      ctx.fillRect(canvas.width * 0.2, canvas.height * 0.15, canvas.width * 0.6, blockSize);
      ctx.fillRect(canvas.width * 0.1, canvas.height * 0.4, blockSize, canvas.height * 0.3);
      ctx.fillRect(canvas.width * 0.7, canvas.height * 0.5, canvas.width * 0.2, blockSize);
      ctx.fillRect(canvas.width * 0.4, canvas.height * 0.7, blockSize * 1.5, blockSize);

      enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          ctx.fillStyle = '#ff4444';
          ctx.beginPath();
          ctx.arc(
            (enemy.x / 100) * canvas.width,
            (enemy.y / 100) * canvas.height,
            20,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Rajdhani';
          ctx.textAlign = 'center';
          ctx.fillText(
            enemy.hp.toString(),
            (enemy.x / 100) * canvas.width,
            (enemy.y / 100) * canvas.height + 4
          );
        }
      });

      ctx.fillStyle = '#9b87f5';
      ctx.beginPath();
      ctx.arc(
        (position.x / 100) * canvas.width,
        (position.y / 100) * canvas.height,
        15,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', (position.x / 100) * canvas.width, (position.y / 100) * canvas.height + 5);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [position, enemies]);

  const handleShoot = () => {
    if (ammo === 0) return;

    setAmmo(prev => prev - 1);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = position.x;
    const centerY = position.y;

    let hit = false;
    setEnemies(prev =>
      prev.map(enemy => {
        if (enemy.hp <= 0) return enemy;

        const distance = Math.sqrt(
          Math.pow(enemy.x - centerX, 2) + Math.pow(enemy.y - centerY, 2)
        );

        if (distance < 10 && !hit) {
          hit = true;
          const newHp = enemy.hp - 34;
          if (newHp <= 0) {
            setKills(k => k + 1);
          }
          return { ...enemy, hp: newHp };
        }
        return enemy;
      })
    );
  };

  useEffect(() => {
    if (ammo === 0) {
      const timer = setTimeout(() => setAmmo(30), 1500);
      return () => clearTimeout(timer);
    }
  }, [ammo]);

  const handleExit = () => {
    if (onExit) onExit();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas ref={canvasRef} onClick={handleShoot} className="cursor-none" />

      <div className="absolute top-4 left-4 z-50 space-y-2">
        <Badge className="bg-red-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="Heart" size={20} className="mr-2" />
          HP: {health}
        </Badge>
        <Badge className="bg-blue-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="Zap" size={20} className="mr-2" />
          Ammo: {ammo}/30
        </Badge>
        <Badge className="bg-green-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="Target" size={20} className="mr-2" />
          Kills: {kills}
        </Badge>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <Button variant="destructive" size="sm" onClick={handleExit}>
          <Icon name="X" size={18} className="mr-2" />
          Exit Game
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm">
        <p className="text-white text-sm font-medium">
          WASD - Move | Click - Shoot | R - Reload
        </p>
      </div>

      <Crosshair />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Badge className="bg-primary/90 text-white text-xl px-6 py-3 border-0">
          de_sandstone
        </Badge>
      </div>
    </div>
  );
}

export function GameButton({ onPlay }: { onPlay: () => void }) {
  return (
    <Button
      onClick={onPlay}
      className="bg-gradient-to-r from-primary to-epic hover:from-primary/90 hover:to-epic/90 text-white font-bold text-lg px-8 py-6"
    >
      <Icon name="Gamepad2" size={24} className="mr-3" />
      Play Game
    </Button>
  );
}
