// In-memory mock dataset (aligns with frontend fields)
const mockEmployees = [
  { employee_id: "EMP001", full_name: "Nguyen Van An", gender: "Male", dob: "1990-05-15", cccd: "001234567890", phone: "+84 912 345 678", email: "nguyen.van.an@company.com", address: "123 Nguyen Hue, District 1, Ho Chi Minh City" },
  { employee_id: "EMP002", full_name: "Tran Thi Binh", gender: "Female", dob: "1992-08-22", cccd: "001234567891", phone: "+84 913 456 789", email: "tran.thi.binh@company.com", address: "456 Le Loi, District 3, Ho Chi Minh City" },
  { employee_id: "EMP003", full_name: "Le Hoang Cuong", gender: "Male", dob: "1988-03-10", cccd: "001234567892", phone: "+84 914 567 890", email: "le.hoang.cuong@company.com", address: "789 Tran Hung Dao, District 5, Ho Chi Minh City" },
  { employee_id: "EMP004", full_name: "Pham Thi Dung", gender: "Female", dob: "1995-11-30", cccd: "001234567893", phone: "+84 915 678 901", email: "pham.thi.dung@company.com", address: "321 Vo Van Tan, District 3, Ho Chi Minh City" },
  { employee_id: "EMP005", full_name: "Hoang Van Em", gender: "Male", dob: "1991-07-18", cccd: "001234567894", phone: "+84 916 789 012", email: "hoang.van.em@company.com", address: "654 Dien Bien Phu, Binh Thanh District, Ho Chi Minh City" },
  { employee_id: "EMP006", full_name: "Vo Thi Phung", gender: "Female", dob: "1993-01-25", cccd: "001234567895", phone: "+84 917 890 123", email: "vo.thi.phung@company.com", address: "987 Nguyen Thi Minh Khai, District 1, Ho Chi Minh City" },
  { employee_id: "EMP007", full_name: "Dang Van Giang", gender: "Male", dob: "1989-09-05", cccd: "001234567896", phone: "+84 918 901 234", email: "dang.van.giang@company.com", address: "147 Hai Ba Trung, District 3, Ho Chi Minh City" },
  { employee_id: "EMP008", full_name: "Bui Thi Huong", gender: "Female", dob: "1994-12-12", cccd: "001234567897", phone: "+84 919 012 345", email: "bui.thi.huong@company.com", address: "258 Le Van Sy, Phu Nhuan District, Ho Chi Minh City" },
  { employee_id: "EMP009", full_name: "Ngo Van Inh", gender: "Male", dob: "1987-04-20", cccd: "001234567898", phone: "+84 920 123 456", email: "ngo.van.inh@company.com", address: "369 Cach Mang Thang 8, District 10, Ho Chi Minh City" },
  { employee_id: "EMP010", full_name: "Duong Thi Kim", gender: "Female", dob: "1996-06-08", cccd: "001234567899", phone: "+84 921 234 567", email: "duong.thi.kim@company.com", address: "741 Nguyen Dinh Chieu, District 3, Ho Chi Minh City" },
  { employee_id: "EMP011", full_name: "Truong Van Long", gender: "Male", dob: "1990-02-14", cccd: "001234567900", phone: "+84 922 345 678", email: "truong.van.long@company.com", address: "852 Pham Ngu Lao, District 1, Ho Chi Minh City" },
  { employee_id: "EMP012", full_name: "Ly Thi Mai", gender: "Female", dob: "1992-10-03", cccd: "001234567901", phone: "+84 923 456 789", email: "ly.thi.mai@company.com", address: "963 Ba Thang Hai, District 10, Ho Chi Minh City" },
  { employee_id: "EMP013", full_name: "Phan Van Nam", gender: "Male", dob: "1988-08-27", cccd: "001234567902", phone: "+84 924 567 890", email: "phan.van.nam@company.com", address: "159 Su Van Hanh, District 10, Ho Chi Minh City" },
  { employee_id: "EMP014", full_name: "Do Thi Oanh", gender: "Female", dob: "1995-03-16", cccd: "001234567903", phone: "+84 925 678 901", email: "do.thi.oanh@company.com", address: "357 Ly Thuong Kiet, District 10, Ho Chi Minh City" },
  { employee_id: "EMP015", full_name: "Vu Van Phuc", gender: "Male", dob: "1991-11-09", cccd: "001234567904", phone: "+84 926 789 012", email: "vu.van.phuc@company.com", address: "486 Nguyen Trai, District 5, Ho Chi Minh City" },
];

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || "").toLowerCase();

    let filtered = mockEmployees;

    if (search) {
      filtered = filtered.filter((emp) =>
        emp.employee_id.toLowerCase().includes(search) ||
        emp.full_name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.phone.includes(req.query.search) ||
        emp.cccd.includes(req.query.search)
      );
    }

    const total = filtered.length;
    const total_pages = Math.max(Math.ceil(total / limit), 1);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    res.json({
      data,
      pagination: { page, limit, total, total_pages },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = mockEmployees.find((e) => e.employee_id === id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};