-- Create a table named test_table
CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,        -- Unique identifier for each record
    name VARCHAR(100),            -- A column to store a name
    age INT,                      -- A column to store age
    email VARCHAR(255)            -- A column to store an email address
);

-- Insert some sample data into the test_table
INSERT INTO test_table (name, age, email) VALUES
('Alice', 30, 'alice@example.com'),
('Bob', 25, 'bob@example.com'),
('Charlie', 35, 'charlie@example.com');
