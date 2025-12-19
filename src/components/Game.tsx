import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky, Box, Plane } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PlayerControlsProps {
  onMove: (position: Vector3) => void;
}

function PlayerControls({ onMove }: PlayerControlsProps) {
  const { camera } = useThree();
  const moveSpeed = 0.1;
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

  useFrame(() => {
    const direction = new Vector3();
    const frontVector = new Vector3();
    const sideVector = new Vector3();

    if (keysPressed.current.has('w')) frontVector.z = -1;
    if (keysPressed.current.has('s')) frontVector.z = 1;
    if (keysPressed.current.has('a')) sideVector.x = -1;
    if (keysPressed.current.has('d')) sideVector.x = 1;

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(moveSpeed)
      .applyEuler(camera.rotation);

    camera.position.add(direction);
    camera.position.y = 1.6;

    onMove(camera.position);
  });

  return null;
}

function SandstoneMap() {
  return (
    <group>
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#d4a574" />
      </Plane>

      <Box args={[10, 3, 1]} position={[0, 1.5, -10]}>
        <meshStandardMaterial color="#c4956c" />
      </Box>

      <Box args={[1, 3, 10]} position={[-5, 1.5, -5]}>
        <meshStandardMaterial color="#c4956c" />
      </Box>

      <Box args={[8, 3, 1]} position={[8, 1.5, 5]}>
        <meshStandardMaterial color="#c4956c" />
      </Box>

      <Box args={[1, 3, 8]} position={[12, 1.5, 0]}>
        <meshStandardMaterial color="#c4956c" />
      </Box>

      <Box args={[5, 2, 5]} position={[-10, 1, 8]}>
        <meshStandardMaterial color="#b8865d" />
      </Box>

      <Box args={[3, 4, 3]} position={[5, 2, -5]}>
        <meshStandardMaterial color="#a67c52" />
      </Box>

      <Box args={[2, 1.5, 2]} position={[-3, 0.75, 3]}>
        <meshStandardMaterial color="#8b6f47" />
      </Box>

      <Box args={[4, 2, 4]} position={[15, 1, -8]}>
        <meshStandardMaterial color="#c4956c" />
      </Box>

      <Box args={[6, 3, 1]} position={[-15, 1.5, -5]}>
        <meshStandardMaterial color="#b8865d" />
      </Box>

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <Sky sunPosition={[100, 20, 100]} />
    </group>
  );
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
  const [position, setPosition] = useState(new Vector3(0, 1.6, 5));
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isPlaying) {
      const handleClick = () => {
        if (ammo > 0) {
          setAmmo(prev => prev - 1);
          
          if (Math.random() > 0.7) {
            setKills(prev => prev + 1);
          }
        }
      };

      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isPlaying, ammo]);

  useEffect(() => {
    if (ammo === 0) {
      setTimeout(() => setAmmo(30), 1500);
    }
  }, [ammo]);

  const handleExit = () => {
    setIsPlaying(false);
    if (onExit) onExit();
  };

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
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
        <Button
          variant="destructive"
          size="sm"
          onClick={handleExit}
        >
          <Icon name="X" size={18} className="mr-2" />
          Exit Game
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm">
        <p className="text-white text-sm font-medium">
          WASD - Move | Mouse - Look | LMB - Shoot | R - Reload
        </p>
      </div>

      <Crosshair />

      <Canvas
        camera={{ fov: 75, position: [0, 1.6, 5] }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SandstoneMap />
        <PointerLockControls />
        <PlayerControls onMove={setPosition} />
      </Canvas>

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