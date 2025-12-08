import { prisma } from '../config/db.js';

// Helper to map Prisma Employee -> frontend shape
// Note: DB uses snake_case, Prisma uses camelCase
const mapEmployee = (e) => {
  if (!e) return null;
  return {
    employee_id: `EMP${String(e.id).padStart(3, '0')}`,
    full_name: e.full_name || e.fullName || '',
    gender: e.gender || '',
    dob: e.dob ? (typeof e.dob === 'string' ? e.dob : e.dob.toISOString().split('T')[0]) : null,
    cccd: e.identity_number || e.identityNumber || '',
    phone: e.phone || '',
    email: e.email || '',
    address: e.address || '',
    department_id: e.department_id || e.departmentId || null,
    position_id: e.position_id || e.positionId || null,
  };
};

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    console.log('[GET /api/employees] Query:', req.query);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || '').trim();

    console.log(`[GET /api/employees] Page: ${page}, Limit: ${limit}, Search: "${search}"`);

    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { identityNumber: { contains: search } },
      ];
    }

    console.log('[GET /api/employees] Where clause:', JSON.stringify(where));

    const total = await prisma.employee.count({ where });
    console.log(`[GET /api/employees] Total count: ${total}`);

    const data = await prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    });

    console.log('[GET /api/employees] Fetched raw records:', JSON.stringify(data, null, 2).substring(0, 500));

    const mapped = data.map(mapEmployee);

    res.json({
      data: mapped,
      pagination: { page, limit, total, total_pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error('[GET /api/employees] ERROR:', error);
    console.error('[GET /api/employees] Error message:', error?.message);
    console.error('[GET /api/employees] Error code:', error?.code);
    console.error('[GET /api/employees] Stack:', error?.stack);
    res.status(500).json({ 
      message: 'Internal Server Error',
      details: error?.message || String(error)
    });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const rawId = req.params.id;
    let idNum = parseInt(rawId.replace(/^EMP/i, ''), 10);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: idNum } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json({ data: mapEmployee(employee) });
  } catch (error) {
    console.error('[GET /api/employees/:id] Error:', error?.message || error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    console.log('[POST /api/employees] Payload:', JSON.stringify(req.body, null, 2));
    const { full_name, gender, dob, cccd, phone, email, address } = req.body;

    // Basic validation
    if (!full_name || !gender || !dob || !cccd) {
      console.warn('[POST /api/employees] Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: full_name, gender, dob, cccd' });
    }

    // Parse and validate date
    let dobDate = null;
    if (dob) {
      dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        console.warn(`[POST /api/employees] Invalid date format: ${dob}`);
        return res.status(400).json({ message: 'Invalid date format for dob. Use YYYY-MM-DD.' });
      }
    }

    console.log('[POST /api/employees] Creating employee:', {
      fullName: full_name,
      gender,
      dob: dobDate,
      identityNumber: cccd,
      phone: phone || null,
      email: email || null,
      address: address || null,
    });

    // Create in DB
    const created = await prisma.employee.create({
      data: {
        fullName: full_name,
        gender,
        dob: dobDate,
        identityNumber: cccd,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    console.log('[POST /api/employees] Success:', created);
    return res.status(201).json({ data: mapEmployee(created) });
  } catch (error) {
    console.error('[POST /api/employees] Error:', error?.message || error);
    console.error('[POST /api/employees] Code:', error?.code);
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'field';
      return res.status(409).json({ message: `Duplicate ${field}. This value already exists.` });
    }
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      details: error?.message || String(error) 
    });
  }
};