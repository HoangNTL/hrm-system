import * as employeeService from '../services/employee.service.js';

// Helper to map Prisma Employee -> frontend shape
const mapEmployee = (e) => {
  if (!e) return null;
  return {
    employee_id: e.id,
    full_name: e.full_name || '',
    gender: e.gender || '',
    dob: e.dob ? (typeof e.dob === 'string' ? e.dob : e.dob.toISOString().split('T')[0]) : null,
    cccd: e.identity_number || '',
    phone: e.phone || '',
    email: e.email || '',
    address: e.address || '',
    department_id: e.department_id || null,
    position_id: e.position_id || null,
  };
};

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    console.log('[GET /api/employees] Query:', req.query);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || '').trim();

    const result = await employeeService.getEmployees({ page, limit, search });

    const mapped = result.data.map(mapEmployee);
    const total_pages = Math.max(Math.ceil(result.total / limit), 1);

    res.json({
      data: mapped,
      pagination: { page, limit, total: result.total, total_pages },
    });
  } catch (error) {
    console.error('[GET /api/employees] ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await employeeService.getEmployeeById(idNum);
    res.json({ data: mapEmployee(employee) });
  } catch (error) {
    if (error.message === 'Employee not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('[GET /api/employees/:id] Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    console.log('[POST /api/employees] Payload:', JSON.stringify(req.body, null, 2));
    const employee = await employeeService.createEmployee(req.body);

    console.log('[POST /api/employees] Success:', employee);
    return res.status(201).json({ data: mapEmployee(employee) });
  } catch (error) {
    console.error('[POST /api/employees] Error:', error.message);
    console.error('[POST /api/employees] Code:', error?.code);

    if (error.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'field';
      return res.status(409).json({ message: `Duplicate ${field}. This value already exists.` });
    }

    if (error.message.includes('Missing required') || error.message.includes('Invalid date')) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};