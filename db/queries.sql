-- Show only department table
SELECT *
FROM department;

-- Show only role table
SELECT *
FROM role;

-- Show only employee table
SELECT *
FROM employee;

-- Join department table to role table
SELECT role.*, department.name AS department_name
FROM role
JOIN department ON role.department_id = department.id;

-- Join role table to employee table
SELECT employee.id AS employee_id,
       employee.first_name,
       employee.last_name,
       role.title AS role_title,
       role.salary AS role_salary,
       employee.manager_id
FROM employee
JOIN role ON employee.role_id = role.id;

-- View All Employees. Join role table to employee table together with department table. Change department.name to "department" and employee.manager_id to "manager"
SELECT employee.id,
       employee.first_name,
       employee.last_name,
       role.title,
       department.name AS department,
       role.salary,
       employee.manager_id AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id;

-- View All Roles. Joins department table to role table and changes depart.name to "department"
SELECT role.id,
       role.title,
       department.name AS department,
       role.salary
FROM role
JOIN department ON role.department_id = department.id;

SELECT employee.id,
       employee.first_name,
       employee.last_name,
       role.title,
       department.name AS department,
       role.salary,
       CONCAT(employee.first_name, ' ', employee.last_name) AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id;