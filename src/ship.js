// ship.js
function createShip(length, name = '') {
  if (length <= 0) throw new Error('Ship length must be greater than 0');

  const hits = Array(length).fill(false);

  // Placement info
  let startX = null;
  let startY = null;
  let orientation = 'horizontal';
  let placed = false;

  // Store coordinates of the ship’s cells after placement
  let coordinates = []; // e.g. [{x:0, y:0}, {x:1, y:0}, ...]

  // Mark a specific segment of the ship as hit using (x, y)
  function hit(x, y) {
    if (!placed) return;

    const segmentIndex = coordinates.findIndex(
      (coord) => coord.x === x && coord.y === y
    );
    if (segmentIndex !== -1) {
      hits[segmentIndex] = true;
    }
  }

  // Check if all segments of the ship are hit
  function isSunk() {
    return hits.every((h) => h === true);
  }

  // Set placement info when ship is positioned on board
  function setPlacement(x, y, dir) {
    startX = x;
    startY = y;
    orientation = dir;
    placed = true;

    // Calculate all coordinates of the ship
    coordinates = [];
    for (let i = 0; i < length; i++) {
      if (dir === 'horizontal') {
        coordinates.push({ x: x + i, y });
      } else {
        coordinates.push({ x, y: y + i });
      }
    }
  }

  return {
    length,
    name,         // Ship name for UI and tracking
    hits,         // Array of hits for each segment
    hit,          // Function to register a hit by coordinates
    isSunk,       // Function to check if sunk
    startX,
    startY,
    orientation,
    placed,
    coordinates,  // List of occupied cells
    setPlacement, // Call when ship is placed on board
  };
}

export default createShip;
