
'use client';
import { Player } from '@lordicon/react';
import { useRef, useEffect } from 'react';
import deleteIcon from '@/lib/animations/delete-icon.json';

const icons: { [key: string]: any } = {
  'delete-icon': deleteIcon,
};

interface LordIconProps {
  iconName: string;
  size: number;
}

export const LordIcon = ({ iconName, size }: LordIconProps) => {
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, []);

  const iconData = icons[iconName];

  if (!iconData) {
    console.error(`Icon "${iconName}" not found.`);
    return null;
  }

  return (
    <Player
      ref={playerRef}
      icon={iconData}
      size={size}
    />
  );
};
