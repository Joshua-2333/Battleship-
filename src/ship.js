function createShip(length, name = '') {
  if (length <= 0) throw new Error('Ship length must be greater than 0');

  const hits = Array(length).fill(false);

  // Placement info
  let startX = null;
  let startY = null;
  let orientation = 'horizontal';
  let placed = false;

  // Coordinates of the ship’s cells after placement
  let coordinates = []; // e.g. [{x:0, y:0}, {x:1, y:0}, ...]

  /**
   * Register a hit on the ship.
   * Can use either:
   *   - hit(index)        → hit by segment index
   *   - hit(x, y)         → hit by board coordinates
   */
  function hit(indexOrX, y = null) {
    if (!placed) return;

    if (y === null) {
      if (indexOrX >= 0 && indexOrX < length) hits[indexOrX] = true;
    } else {
      const segmentIndex = coordinates.findIndex(
        (coord) => coord.x === indexOrX && coord.y === y
      );
      if (segmentIndex !== -1) hits[segmentIndex] = true;
    }
  }

  /**
   * Check if all segments of the ship have been hit
   */
  function isSunk() {
    return hits.every((h) => h === true);
  }

  /**
   * Set placement info when the ship is positioned on the board
   */
  function setPlacement(x, y, dir) {
    startX = x;
    startY = y;
    orientation = dir;
    placed = true;

    coordinates = [];
    for (let i = 0; i < length; i++) {
      if (dir === 'horizontal') coordinates.push({ x: x + i, y });
      else coordinates.push({ x, y: y + i });
    }
  }

  return {
    length,
    name,
    hits,
    hit,
    isSunk,
    setPlacement,
    get startX() { return startX; },
    get startY() { return startY; },
    get orientation() { return orientation; },
    get placed() { return placed; },
    get coordinates() { return coordinates; },
  };
}

export default createShip;
