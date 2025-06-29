import type { CurveType, Point } from './types';

export const getPoints = (curveType: CurveType): Point[] => {
  switch (curveType) {
    case 'quadratic': {
      return [
        { x: 50, y: 350 },
        { x: 250, y: 50 },
        { x: 450, y: 350 },
      ];
    }

    case 'cubic': {
      return [
        { x: 50, y: 350 },
        { x: 250, y: 350 },
        { x: 250, y: 50 },
        { x: 450, y: 50 },
      ];
    }

    case 'quartic': {
      return [
        { x: 50, y: 200 },
        { x: 150, y: 350 },
        { x: 250, y: 50 },
        { x: 350, y: 350 },
        { x: 450, y: 200 },
      ];
    }
  }
};
