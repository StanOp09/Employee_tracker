const blueBoldLargeUnderline = '\x1b[34;1;4m'; // Blue, Bold, Underline
const yellowBoldLarge = '\x1b[33;1m'; // Yellow, Bold
const reset = '\x1b[0m'; // Reset all formatting

console.log(`${blueBoldLargeUnderline}Employee Database${reset}`);

const inquirer = require('inquirer');
const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password here
      password: 'Stanop09#',
      database: 'company_db'
    },
    console.log(`${yellowBoldLarge}Connected to the company_db database.${reset}`)
  );

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error while connecting to database:', err);
        return;
    } 
    console.log(`${yellowBoldLarge}Connected to database${reset}`);
    start();
})

// Create an array of questions for user input
const questions = [
    {
        type: 'list',
        name:'choice',
        message: 'What would you like to do?',
        choices:[
            'View All Employees', 
            'Add Employee', 
            'Update Employee Role', 
            'View All Roles', 
            'Add Role', 
            'View All Departments', 
            'Add Department',
            'Quit'
        ]
    }
];

const addDepartmentQuestions = [
    {
        type: 'input',
        name: 'name',
        message: 'What is the name of the department?'
    }
]


// Create a function to show sql screen output
function start(){
    inquirer.prompt(questions)
    .then (response => {
        const choice = response.choice;
        switch(choice) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Quit':
                console.log(`${yellowBoldLarge}Quitting the app.${reset}`);
                db.end();
                break;
        }
    });
}

// SQL commands for each query table
const allEmployees = `SELECT employee.id,
                             employee.first_name,
                             employee.last_name,
                             role.title,
                             department.name AS department,
                             role.salary,
                             employee.manager_id AS manager
                      FROM employee
                      JOIN role ON employee.role_id = role.id
                      JOIN department ON role.department_id = department.id;`

const allRoles = `SELECT role.id,
                         role.title,
                         department.name AS department,
                         role.salary
                  FROM role
                  JOIN department ON role.department_id = department.id;`

const changeEmployeeRole = 'SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee'

// Custom function to display table data without index column
function displayTableWithoutIndex(data) {
    const tableData = data.map(row => {
      const newRow = { ...row };
      delete newRow.index;
      return newRow;
    });
  
    console.table(tableData);
  }

// Functions to execute cases
// View all Employees
function viewAllEmployees() {
    const allEmployeesQuery = `
    SELECT 
        employee.id,
        employee.first_name,
        employee.last_name,
        role.title,
        department.name AS department,
        role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN (SELECT DISTINCT id, name FROM department) AS department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;

    db.query(allEmployeesQuery, (err, employees) => {
        if (err) {
            console.error('Error while fetching all employees:', err);
            return;
        }

        const formattedEmployees = employees.map(employee => ({
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            title: employee.title,
            department: employee.department,
            salary: employee.salary,
            manager: employee.manager || 'None'
        }));

        // Sort the formattedEmployees array by id
        formattedEmployees.sort((a, b) => a.id - b.id);

        console.table(formattedEmployees);
        start();
    });
}

// Add Employee
function addEmployee() {
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, employees) => {
        if (err) {
            console.error('Error while fetching employees');
            start();
            return;
        }

        const managerChoices = employees.map(employee => ({
            value: employee.id,
            name: employee.full_name
        }));

        // Adding a choice for no manager
        managerChoices.unshift({ value: null, name: 'None' });

        db.query('SELECT id, title FROM role', (err, roles) => {
            if (err) {
                console.error('Error while fetching roles:', err);
                start();
                return;
            }

            const roleChoices = roles.map(role => ({
                value: role.id,
                name: role.title
            }));

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: "What is the employee's role?",
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: "Who is the employee's manager?",
                    choices: managerChoices
                }
            ]).then(answer => {
                const { first_name, last_name, role_id, manager_id } = answer;
                const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';

                db.query(query, [first_name, last_name, role_id, manager_id], (err, results) => {
                    if (err) {
                        console.error('Error while adding employee:', err);
                    } else {
                        console.log(`${yellowBoldLarge}Added ${first_name} ${last_name} to the database${reset}`);
                    }
                    start();
                });
            });
        });
    });
}

    // Update Employee Role
function updateEmployeeRole() {
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, result) => {
        if (err) {
            console.error("Error while fetching employees:", err);
            start();
            return;
        }

        const employeeChoices = result.map(employee => ({
            value: employee.id,
            name: employee.full_name
        }));

        db.query('SELECT id, title FROM role', (err, roles) => {
            if (err) {
                console.error('Error while fetching roles:', err);
                start();
                return;
            }

            const roleChoices = roles.map(role => ({
                value: role.id,
                name: role.title
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: "Which employee's role do you want to update",
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    name: 'new_role_id',
                    message: 'Which role do you want to assign the selected employee?',
                    choices: roleChoices
                }
            ]).then(response => {
                const { employee_id, new_role_id } = response;
                const query = 'UPDATE employee SET role_id = ? WHERE id = ?';

                db.query(query, [new_role_id, employee_id], (err, result) => {
                    if (err) {
                        console.error('Error while updating employee role:', err);
                    } else {
                        console.log(`${yellowBoldLarge}Updated employee's role${reset}`);
                    }
                    start();
                });
            });
        });
    });
}


    // View All Roles
function viewAllRoles() {
    db.query(allRoles, (err, result) => {
        if (err) {
            console.error('Error while fetching all roles:', err);
            start();
            return;
        }

        console.table(result);
        start();
    });
}

    // Add Role
function addRole() {
    db.query('SELECT id, name FROM department', (err, departments) => {
        if (err) {
            console.error('Error while fetching depatrments:', err);
            start();
            return;
        }

        const departmentChoices = departments.map(department => ({
            value: department.id,
            name: department.name
        }));

        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Which department does the role belong to?',
                choices: departmentChoices
            }
        ]).then(response => {
            const { title, salary, department_id } = response;
            const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';

            db.query(query, [title, salary, department_id], (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log (`${yellowBoldLarge}Added ${title} to the database${reset}`);
                }
                start();
            });
        });
    });
}

    // View All Departments
function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, result) => {
        if (err) {
            console.error('Error while fetching all departments:', err);
            start();
            return;
        }
    
        console.table(result);
        start();
    });
}

    // Add Department
function addDepartment() {
    inquirer.prompt(addDepartmentQuestions)
    .then(response => {
        const { name } = response;
        const query = 'INSERT INTO department (name) VALUES (?)';

        db.query(query, [name], (err, result) => {
            if (err) {
                console.error('Error while adding department;', err);
            } else {
                console.log(`${yellowBoldLarge}Added ${name} to the database${reset}`)
            }
            start();
        });
    });
}