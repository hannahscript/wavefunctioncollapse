import {Cell} from './wave.js';

export enum Direction {
    UP, RIGHT, DOWN, LEFT
}

export function dxyToDirection(dx: number, dy: number): Direction {
    if (dx === -1 && dy === 0) {
        return Direction.LEFT;
    } else if (dx === 1 && dy === 0) {
        return Direction.RIGHT;
    } else if (dx === 0 && dy === -1) {
        return Direction.UP;
    } else if (dx === 0 && dy === 1) {
        return Direction.DOWN;
    }

    throw new Error('dx/dy is not a cardinal direction');
}

export function flipDirection(direction: Direction): Direction {
    return (direction + 2) % 4;
}

export function getDirection(from: Cell, to: Cell): Direction {
    return dxyToDirection(to.x - from.x, to.y - from.y);
}
