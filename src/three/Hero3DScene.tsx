import React from 'react';
import { CulinaryHeroShowcase } from '../components/food/CulinaryHeroShowcase';

interface Hero3DSceneProps {
  onFoodSelect?: (foodName: string) => void;
}

// Replaced procedural 3D canvas with real high-resolution culinary photography showcase
export const Hero3DScene: React.FC<Hero3DSceneProps> = ({ onFoodSelect }) => {
  return <CulinaryHeroShowcase onFoodSelect={onFoodSelect} />;
};
