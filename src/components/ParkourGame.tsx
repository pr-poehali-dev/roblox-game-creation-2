import { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

interface Player {
  x: number;
  y: number;
  z: number;
  velocityY: number;
  isJumping: boolean;
  rotation: number;
}

const platforms: Platform[] = [
  { x: 0, y: 0, z: 0, width: 4, height: 0.5, depth: 4, color: '#4ade80' },
  { x: 6, y: 0, z: 0, width: 3, height: 0.5, depth: 3, color: '#3b82f6' },
  { x: 11, y: 1, z: 2, width: 3, height: 0.5, depth: 3, color: '#f59e0b' },
  { x: 15, y: 2, z: 5, width: 3, height: 0.5, depth: 3, color: '#ef4444' },
  { x: 18, y: 3, z: 9, width: 3, height: 0.5, depth: 3, color: '#8b5cf6' },
  { x: 22, y: 4, z: 12, width: 3, height: 0.5, depth: 3, color: '#ec4899' },
  { x: 26, y: 5, z: 15, width: 3, height: 0.5, depth: 3, color: '#14b8a6' },
  { x: 30, y: 6, z: 18, width: 4, height: 0.5, depth: 4, color: '#f97316' },
  { x: 35, y: 7, z: 22, width: 5, height: 0.5, depth: 5, color: '#fbbf24' },
];

export default function ParkourGame({ onExit }: { onExit?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 1.6,
    z: 0,
    velocityY: 0,
    isJumping: false,
    rotation: 0,
  });
  const [checkpointReached, setCheckpointReached] = useState(0);
  const [time, setTime] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const mouseMovement = useRef({ x: 0, y: 0 });
  const isMouseLocked = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerLock = () => {
      canvas.requestPointerLock();
    };

    const handlePointerLockChange = () => {
      isMouseLocked.current = document.pointerLockElement === canvas;
    };

    canvas.addEventListener('click', handlePointerLock);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      canvas.removeEventListener('click', handlePointerLock);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseLocked.current) {
        mouseMovement.current.x += e.movementX * 0.002;
        mouseMovement.current.y += e.movementY * 0.002;
        mouseMovement.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseMovement.current.y));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (checkpointReached < platforms.length) {
        setTime(t => t + 0.1);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [checkpointReached]);

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
    const gravity = 0.02;
    const jumpForce = 0.4;
    const moveSpeed = 0.15;

    const isOnPlatform = (px: number, py: number, pz: number): Platform | null => {
      for (const platform of platforms) {
        if (
          px >= platform.x - platform.width / 2 &&
          px <= platform.x + platform.width / 2 &&
          pz >= platform.z - platform.depth / 2 &&
          pz <= platform.z + platform.depth / 2 &&
          py >= platform.y + platform.height &&
          py <= platform.y + platform.height + 0.5
        ) {
          return platform;
        }
      }
      return null;
    };

    const render = () => {
      setPlayer(prev => {
        let newPlayer = { ...prev };

        const forward = {
          x: Math.sin(mouseMovement.current.x),
          z: Math.cos(mouseMovement.current.x),
        };
        const right = {
          x: Math.cos(mouseMovement.current.x),
          z: -Math.sin(mouseMovement.current.x),
        };

        if (keysPressed.current.has('w')) {
          newPlayer.x += forward.x * moveSpeed;
          newPlayer.z += forward.z * moveSpeed;
        }
        if (keysPressed.current.has('s')) {
          newPlayer.x -= forward.x * moveSpeed;
          newPlayer.z -= forward.z * moveSpeed;
        }
        if (keysPressed.current.has('a')) {
          newPlayer.x -= right.x * moveSpeed;
          newPlayer.z -= right.z * moveSpeed;
        }
        if (keysPressed.current.has('d')) {
          newPlayer.x += right.x * moveSpeed;
          newPlayer.z += right.z * moveSpeed;
        }

        if (keysPressed.current.has(' ') && !newPlayer.isJumping) {
          newPlayer.velocityY = jumpForce;
          newPlayer.isJumping = true;
        }

        newPlayer.velocityY -= gravity;
        newPlayer.y += newPlayer.velocityY;

        const onPlatform = isOnPlatform(newPlayer.x, newPlayer.y, newPlayer.z);
        if (onPlatform) {
          if (newPlayer.velocityY <= 0) {
            newPlayer.y = onPlatform.y + onPlatform.height + 1.6;
            newPlayer.velocityY = 0;
            newPlayer.isJumping = false;

            const platformIndex = platforms.indexOf(onPlatform);
            if (platformIndex > checkpointReached) {
              setCheckpointReached(platformIndex);
            }
          }
        }

        if (newPlayer.y < -10) {
          newPlayer = { x: 0, y: 1.6, z: 0, velocityY: 0, isJumping: false, rotation: 0 };
          mouseMovement.current = { x: 0, y: 0 };
        }

        return newPlayer;
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cameraX = player.x;
      const cameraY = player.y;
      const cameraZ = player.z;

      const fov = 60;
      const viewDistance = canvas.width / (2 * Math.tan((fov * Math.PI) / 360));

      const project3D = (x: number, y: number, z: number) => {
        const dx = x - cameraX;
        const dy = y - cameraY;
        const dz = z - cameraZ;

        const rotatedX = dx * Math.cos(mouseMovement.current.x) - dz * Math.sin(mouseMovement.current.x);
        const rotatedZ = dx * Math.sin(mouseMovement.current.x) + dz * Math.cos(mouseMovement.current.x);

        const pitch = mouseMovement.current.y;
        const rotatedY = dy * Math.cos(pitch) - rotatedZ * Math.sin(pitch);
        const finalZ = dy * Math.sin(pitch) + rotatedZ * Math.cos(pitch);

        if (finalZ <= 0.1) return null;

        const scale = viewDistance / finalZ;
        const screenX = canvas.width / 2 + rotatedX * scale;
        const screenY = canvas.height / 2 - rotatedY * scale;

        return { x: screenX, y: screenY, scale, distance: finalZ };
      };

      const sortedPlatforms = [...platforms].sort((a, b) => {
        const distA = Math.hypot(a.x - cameraX, a.z - cameraZ);
        const distB = Math.hypot(b.x - cameraX, b.z - cameraZ);
        return distB - distA;
      });

      sortedPlatforms.forEach((platform, index) => {
        const corners = [
          { x: platform.x - platform.width / 2, y: platform.y, z: platform.z - platform.depth / 2 },
          { x: platform.x + platform.width / 2, y: platform.y, z: platform.z - platform.depth / 2 },
          { x: platform.x + platform.width / 2, y: platform.y, z: platform.z + platform.depth / 2 },
          { x: platform.x - platform.width / 2, y: platform.y, z: platform.z + platform.depth / 2 },
          { x: platform.x - platform.width / 2, y: platform.y + platform.height, z: platform.z - platform.depth / 2 },
          { x: platform.x + platform.width / 2, y: platform.y + platform.height, z: platform.z - platform.depth / 2 },
          { x: platform.x + platform.width / 2, y: platform.y + platform.height, z: platform.z + platform.depth / 2 },
          { x: platform.x - platform.width / 2, y: platform.y + platform.height, z: platform.z + platform.depth / 2 },
        ];

        const projected = corners.map(c => project3D(c.x, c.y, c.z)).filter(p => p !== null);

        if (projected.length >= 4) {
          ctx.fillStyle = platform.color;
          ctx.strokeStyle = index === checkpointReached ? '#fbbf24' : '#000000';
          ctx.lineWidth = index === checkpointReached ? 3 : 1;

          ctx.beginPath();
          ctx.moveTo(projected[4]!.x, projected[4]!.y);
          ctx.lineTo(projected[5]!.x, projected[5]!.y);
          ctx.lineTo(projected[6]!.x, projected[6]!.y);
          ctx.lineTo(projected[7]!.x, projected[7]!.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = platform.color + 'CC';
          ctx.beginPath();
          ctx.moveTo(projected[5]!.x, projected[5]!.y);
          ctx.lineTo(projected[1]!.x, projected[1]!.y);
          ctx.lineTo(projected[2]!.x, projected[2]!.y);
          ctx.lineTo(projected[6]!.x, projected[6]!.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [player, checkpointReached]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas ref={canvasRef} className="cursor-none" />

      <div className="absolute top-4 left-4 z-50 space-y-2">
        <Badge className="bg-blue-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="Flag" size={20} className="mr-2" />
          Checkpoint: {checkpointReached + 1}/{platforms.length}
        </Badge>
        <Badge className="bg-green-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="Timer" size={20} className="mr-2" />
          Time: {time.toFixed(1)}s
        </Badge>
        <Badge className="bg-purple-600/90 text-white text-lg px-4 py-2 border-0">
          <Icon name="MapPin" size={20} className="mr-2" />
          Y: {player.y.toFixed(1)}m
        </Badge>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <Button variant="destructive" size="sm" onClick={onExit}>
          <Icon name="X" size={18} className="mr-2" />
          Exit
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/70 px-6 py-3 rounded-lg backdrop-blur-sm">
        <p className="text-white text-sm font-medium text-center">
          WASD - Move | Space - Jump | Mouse - Look | Click to lock cursor
        </p>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Badge className="bg-primary/90 text-white text-xl px-6 py-3 border-0">
          🏃 PARKOUR MODE
        </Badge>
      </div>

      {checkpointReached === platforms.length - 1 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card p-8 rounded-lg text-center space-y-4">
            <h2 className="text-4xl font-bold text-primary">🎉 Victory!</h2>
            <p className="text-2xl">Time: {time.toFixed(1)}s</p>
            <Button onClick={onExit} className="mt-4">
              Return to Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
