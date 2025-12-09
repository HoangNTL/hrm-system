import * as positionService from '../services/position.service.js';

const mapPosition = (p) => {
  if (!p) return null;
  return {
    position_id: p.id,
    id: p.id,
    name: p.name,
    description: p.description || null,
    created_at: p.created_at ? p.created_at.toISOString() : null,
  };
};

// GET /api/positions
export const getPositions = async (req, res) => {
  try {
    console.log('[GET /api/positions] Query:', req.query);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 100, 1);
    const search = (req.query.search || '').trim();

    const result = await positionService.getPositions({ page, limit, search });
    const mapped = result.data.map(mapPosition);
    const total_pages = Math.max(Math.ceil(result.total / limit), 1);

    res.json({
      data: mapped,
      pagination: { page, limit, total: result.total, total_pages },
    });
  } catch (error) {
    console.error('[GET /api/positions] ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};

// GET /api/positions/:id
export const getPositionById = async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid position id' });
    }

    const pos = await positionService.getPositionById(idNum);
    res.json({ data: mapPosition(pos) });
  } catch (error) {
    if (error.message === 'Position not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('[GET /api/positions/:id] ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
