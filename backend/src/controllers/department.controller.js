import * as departmentService from '../services/department.service.js';

const mapDepartment = (d) => {
  if (!d) return null;
  return {
    department_id: d.id,
    id: d.id,
    name: d.name,
    description: d.description || null,
    created_at: d.created_at ? d.created_at.toISOString() : null,
  };
};

// GET /api/departments
export const getDepartments = async (req, res) => {
  try {
    console.log('[GET /api/departments] Query:', req.query);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || '').trim();

    const result = await departmentService.getDepartments({ page, limit, search });
    const mapped = result.data.map(mapDepartment);
    const total_pages = Math.max(Math.ceil(result.total / limit), 1);

    res.json({
      data: mapped,
      pagination: { page, limit, total: result.total, total_pages },
    });
  } catch (error) {
    console.error('[GET /api/departments] ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};

// GET /api/departments/:id
export const getDepartmentById = async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid department id' });
    }

    const dept = await departmentService.getDepartmentById(idNum);
    res.json({ data: mapDepartment(dept) });
  } catch (error) {
    if (error.message === 'Department not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('[GET /api/departments/:id] ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    console.log('[POST /api/departments] Payload:', req.body);
    const department = await departmentService.createDepartment(req.body);

    console.log('[POST /api/departments] Created:', department);
    return res.status(201).json({ data: mapDepartment(department) });
  } catch (error) {
    console.error('[POST /api/departments] ERROR:', error.message);

    if (error.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'field';
      return res.status(409).json({ message: `Duplicate ${field}.` });
    }

    if (error.message.includes('Missing required')) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};
