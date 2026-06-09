CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;


-- 1. Departments
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    manager_id INT, -- Fixed later via Circular Reference handling
    location VARCHAR(100)
);

-- 2. Employees
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    date_of_birth DATE,
    email VARCHAR(100) UNIQUE,
    phone_no VARCHAR(20),
    hire_date DATE,
    salary DECIMAL(10, 2),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- Add manager constraint now that employee table exists
ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- 3. Projects
CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(100),
    budget DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- 4. Employee_Project (Junction Table)
CREATE TABLE employee_project (
    employee_id INT,
    project_id INT,
    role VARCHAR(50),
    assigned_date DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- 5. Attendance
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    date DATE DEFAULT (CURRENT_DATE),
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('Present', 'Absent', 'On Leave'),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- 6. Leave Records
CREATE TABLE leave_records (
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    leave_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- 7. Payroll
CREATE TABLE payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    basic_salary DECIMAL(10, 2),
    bonus DECIMAL(10, 2) DEFAULT 0,
    deductions DECIMAL(10, 2) DEFAULT 0,
    loss_of_pay DECIMAL(10, 2) DEFAULT 0,
    payment_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- TRIGGERS FOR DERIVED FIELDS
-- Calculate Net Salary automatically
CREATE VIEW v_payroll_summary AS
SELECT *, (basic_salary + bonus - deductions - loss_of_pay) AS net_salary FROM payroll;

-- Calculate Employee Age
CREATE VIEW v_employee_details AS
SELECT *, FLOOR(DATEDIFF(CURRENT_DATE, date_of_birth) / 365.25) AS age FROM employees;
	
INSERT INTO departments (department_name, location) VALUES 
('Human Resources', 'New York'),
('Engineering', 'San Francisco'),
('Marketing', 'Chicago'),
('Sales', 'Austin'),
('Finance', 'New York'),
('Product Management', 'San Francisco'),
('Customer Support', 'Dallas'),
('IT Infrastructure', 'Seattle'),
('Legal', 'Boston'),
('R&D', 'Palo Alto'),
('Public Relations', 'Los Angeles'),
('Logistics', 'Houston'),
('Quality Assurance', 'Phoenix'),
('Design', 'London'),
('Security', 'Denver');

INSERT INTO employees (name, gender, date_of_birth, email, phone_no, hire_date, salary, department_id) VALUES 
('Alice Johnson', 'Female', '1990-05-15', 'alice@example.com', '555-0101', '2020-01-10', 85000, 1),
('Bob Smith', 'Male', '1985-08-22', 'bob@example.com', '555-0102', '2019-03-15', 95000, 2),
('Charlie Davis', 'Male', '1992-11-30', 'charlie@example.com', '555-0103', '2021-06-01', 75000, 3),
('Diana Prince', 'Female', '1988-02-14', 'diana@example.com', '555-0104', '2018-09-20', 110000, 4),
('Ethan Hunt', 'Male', '1995-07-04', 'ethan@example.com', '555-0105', '2022-02-01', 65000, 5),
('Fiona Gallagher', 'Female', '1993-12-12', 'fiona@example.com', '555-0106', '2021-11-15', 72000, 6),
('George Miller', 'Male', '1980-03-25', 'george@example.com', '555-0107', '2015-05-10', 125000, 2),
('Hannah Abbott', 'Female', '1991-09-09', 'hannah@example.com', '555-0108', '2020-08-18', 80000, 7),
('Ian Wright', 'Male', '1987-01-30', 'ian@example.com', '555-0109', '2017-04-22', 90000, 8),
('Jenny Kim', 'Female', '1994-06-20', 'jenny@example.com', '555-0110', '2022-01-05', 68000, 9),
('Kevin Hart', 'Male', '1979-07-06', 'kevin@example.com', '555-0111', '2014-10-12', 130000, 10),
('Laura Palmer', 'Female', '1990-04-18', 'laura@example.com', '555-0112', '2020-02-28', 88000, 11),
('Mike Ross', 'Male', '1992-02-02', 'mike@example.com', '555-0113', '2021-03-01', 95000, 9),
('Nina Simone', 'Female', '1983-02-21', 'nina@example.com', '555-0114', '2016-12-01', 105000, 5),
('Oscar Isaac', 'Male', '1986-03-09', 'oscar@example.com', '555-0115', '2019-07-15', 82000, 12),
('Paul Rudd', 'Male', '1980-04-06', 'paul@example.com', '555-0116', '2015-09-10', 115000, 13),
('Quinn Fabray', 'Female', '1995-05-05', 'quinn@example.com', '555-0117', '2022-04-10', 62000, 14),
('Riley Reid', 'Female', '1991-07-09', 'riley@example.com', '555-0118', '2020-05-05', 77000, 15),
('Steve Rogers', 'Male', '1920-07-04', 'steve@example.com', '555-0119', '2012-05-04', 150000, 15),
('Tony Stark', 'Male', '1970-05-29', 'tony@example.com', '555-0120', '2010-01-01', 250000, 2),
('Ursula Buffay', 'Female', '1988-10-10', 'ursula@example.com', '555-0121', '2018-08-08', 71000, 3),
('Victor Stone', 'Male', '1996-02-15', 'victor@example.com', '555-0122', '2022-09-01', 60000, 8),
('Wanda Maximoff', 'Female', '1989-03-10', 'wanda@example.com', '555-0123', '2019-11-11', 110000, 10),
('Xander Harris', 'Male', '1981-05-05', 'xander@example.com', '555-0124', '2016-01-20', 78000, 13),
('Yara Greyjoy', 'Female', '1984-04-04', 'yara@example.com', '555-0125', '2017-06-06', 89000, 4),
('Zane Grey', 'Male', '1993-01-01', 'zane@example.com', '555-0126', '2021-08-15', 73000, 6),
('Amy Pond', 'Female', '1989-05-05', 'amy@example.com', '555-0127', '2018-04-03', 81000, 14),
('Ben Solo', 'Male', '1992-12-25', 'ben@example.com', '555-0128', '2021-01-10', 92000, 2),
('Clara Oswald', 'Female', '1990-11-23', 'clara@example.com', '555-0129', '2020-10-10', 79000, 1),
('Danny Pink', 'Male', '1988-08-08', 'danny@example.com', '555-0130', '2019-09-09', 83000, 7);

UPDATE departments SET manager_id = 1 WHERE department_id = 1;
UPDATE departments SET manager_id = 7 WHERE department_id = 2;
UPDATE departments SET manager_id = 3 WHERE department_id = 3;

INSERT INTO projects (project_name, budget, start_date, end_date, department_id) VALUES 
('Cloud Migration', 500000, '2024-01-01', '2024-12-31', 8),
('AI Chatbot', 250000, '2024-03-15', '2024-09-15', 2),
('Brand Refresh', 100000, '2024-02-01', '2024-05-01', 3),
('Financial Audit', 50000, '2024-04-01', '2024-06-30', 5),
('New Hire Portal', 75000, '2024-05-10', '2024-10-10', 1),
('Security Overhaul', 300000, '2024-01-15', '2024-07-15', 15),
('Market Expansion', 450000, '2024-06-01', '2025-06-01', 4),
('Mobile App v2', 150000, '2024-02-20', '2024-08-20', 6),
('Lab Setup', 1000000, '2024-01-01', '2025-12-31', 10),
('Customer Loyalty', 120000, '2024-03-01', '2024-09-01', 7);


INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status) VALUES 
(1, '2024-05-14', '09:00:00', '17:00:00', 'Present'),
(2, '2024-05-14', '08:45:00', '18:00:00', 'Present'),
(3, '2024-05-14', NULL, NULL, 'Absent'),
(4, '2024-05-14', '09:15:00', '17:15:00', 'Present'),
(5, '2024-05-14', '09:00:00', '17:00:00', 'Present'),
(6, '2024-05-14', '10:00:00', '16:00:00', 'Present'),
(7, '2024-05-14', '08:30:00', '17:30:00', 'Present'),
(8, '2024-05-14', NULL, NULL, 'On Leave'),
(9, '2024-05-14', '09:05:00', '17:05:00', 'Present'),
(10, '2024-05-14', '08:55:00', '16:55:00', 'Present'),
(11, '2024-05-14', '09:00:00', '17:00:00', 'Present'),
(12, '2024-05-14', '09:10:00', '17:10:00', 'Present'),
(13, '2024-05-14', '08:50:00', '17:50:00', 'Present'),
(14, '2024-05-14', '09:00:00', '17:00:00', 'Present'),
(15, '2024-05-14', '09:30:00', '18:30:00', 'Present');

INSERT INTO leave_records (employee_id, leave_type, start_date, end_date, status) VALUES 
(8, 'Sick Leave', '2024-05-14', '2024-05-16', 'Approved'),
(2, 'Vacation', '2024-06-01', '2024-06-10', 'Pending'),
(15, 'Maternity', '2024-07-01', '2024-10-01', 'Approved'),
(20, 'Personal', '2024-05-20', '2024-05-21', 'Rejected'),
(22, 'Sick Leave', '2024-05-10', '2024-05-11', 'Approved'),
(5, 'Vacation', '2024-08-01', '2024-08-15', 'Pending'),
(10, 'Personal', '2024-05-25', '2024-05-26', 'Approved'),
(1, 'Bereavement', '2024-04-10', '2024-04-13', 'Approved'),
(12, 'Sick Leave', '2024-05-01', '2024-05-02', 'Approved'),
(30, 'Vacation', '2024-12-20', '2025-01-05', 'Pending');


-- Clearing previous payroll if any
TRUNCATE TABLE payroll;

INSERT INTO payroll (employee_id, basic_salary, bonus, deductions, loss_of_pay, payment_date) VALUES 
(1, 85000, 1200.00, 150.00, 0.00, '2024-04-30'),
(2, 95000, 2500.00, 200.00, 0.00, '2024-04-30'),
(3, 75000, 0.00, 100.00, 500.00, '2024-04-30'), 	
(4, 110000, 5000.00, 450.00, 0.00, '2024-04-30'),
(5, 65000, 400.00, 50.00, 0.00, '2024-04-30'),
(6, 72000, 800.00, 120.00, 0.00, '2024-04-30'),
(7, 125000, 6000.00, 500.00, 0.00, '2024-04-30'),
(8, 80000, 200.00, 100.00, 250.00, '2024-04-30'), 
(9, 90000, 1500.00, 180.00, 0.00, '2024-04-30'),
(10, 68000, 500.00, 90.00, 0.00, '2024-04-30'),
(11, 130000, 7500.00, 600.00, 0.00, '2024-04-30'),
(12, 88000, 1100.00, 140.00, 0.00, '2024-04-30'),
(13, 95000, 2200.00, 210.00, 0.00, '2024-04-30'),
(14, 105000, 3000.00, 300.00, 0.00, '2024-04-30'),
(15, 82000, 0.00, 100.00, 1000.00, '2024-04-30'), 
(16, 115000, 4000.00, 420.00, 0.00, '2024-04-30'),
(17, 62000, 300.00, 40.00, 0.00, '2024-04-30'),
(18, 77000, 950.00, 110.00, 0.00, '2024-04-30'),
(19, 150000, 10000.00, 1000.00, 0.00, '2024-04-30'),
(20, 250000, 25000.00, 5000.00, 0.00, '2024-04-30'),
(21, 71000, 600.00, 85.00, 150.00, '2024-04-30'),
(22, 60000, 150.00, 30.00, 0.00, '2024-04-30'),
(23, 110000, 4500.00, 400.00, 0.00, '2024-04-30'),
(24, 78000, 850.00, 125.00, 0.00, '2024-04-30'),
(25, 89000, 1800.00, 190.00, 0.00, '2024-04-30'),
(26, 73000, 550.00, 95.00, 0.00, '2024-04-30'),
(27, 81000, 1050.00, 130.00, 0.00, '2024-04-30'),
(28, 92000, 2000.00, 205.00, 0.00, '2024-04-30'),
(29, 79000, 900.00, 115.00, 0.00, '2024-04-30'),
(30, 83000, 1150.00, 145.00, 300.00, '2024-04-30');

-- View all employees and their basic info
SELECT name, email, hire_date, salary FROM employees;

-- Find all employees in the 'Engineering' department (Department ID 2)
SELECT * FROM employees WHERE department_id = 2;

-- See which projects have a budget greater than 200,000
SELECT project_name, budget FROM projects WHERE budget > 200000;

-- Check who is currently 'Absent' in the attendance records
SELECT employee_id, date, status FROM attendance WHERE status = 'Absent';


-- Update an employee's salary (e.g., Alice Johnson got a raise)
UPDATE employees SET salary = 90000 WHERE employee_id = 1;

-- Change the status of a leave request from 'Pending' to 'Approved'
UPDATE leave_records SET status = 'Approved' WHERE leave_id = 2;

-- Extend a project's end date
UPDATE projects SET end_date = '2025-03-31' WHERE project_id = 1;

-- Update a department's location
UPDATE departments SET location = 'Silicon Valley' WHERE department_id = 2;


-- Delete a specific attendance record (e.g., it was entered by mistake)
DELETE FROM attendance WHERE attendance_id = 5;

-- Remove a project that was cancelled
DELETE FROM projects WHERE project_id = 10;

-- Remove an employee record (Note: This works because of ON DELETE SET NULL in your schema)
DELETE FROM employees WHERE employee_id = 30;

-- Clear all rejected leave records to clean up the table
DELETE FROM leave_records WHERE status = 'Rejected';

-- Sort employees by salary in descending order and limit to the top 5
SELECT name, salary 
FROM employees 
ORDER BY salary DESC 
LIMIT 5;

-- Group by gender and calculate count and average
SELECT 
    gender, 
    COUNT(*) AS total_count, 
    AVG(salary) AS average_salary
FROM employees
GROUP BY gender;

-- Filter based on the year part of the date_of_birth
SELECT name, date_of_birth 
FROM employees 
WHERE YEAR(date_of_birth) BETWEEN 1990 AND 1999;

	START TRANSACTION;

	INSERT INTO employees (name, gender, date_of_birth, email, salary, department_id)
	VALUES ('Logan Howlett', 'Male', '1975-10-12', 'logan@xmen.com', 95000, 15);

	SET @last_id = LAST_INSERT_ID();

	INSERT INTO payroll (employee_id, basic_salary, payment_date)
	VALUES (@last_id, 95000, '2024-05-31');

	COMMIT;



 