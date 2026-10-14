-- Runs only on first start (empty db-data volume)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO users (name, email) VALUES
  ('justus', 'justusbruegmann@gmail.com'),
  ('robin', 'dhbw@robin-fuchs.de'),
  ('max', 'max@example.com'),
  ("sebastian", "sebastian@example.com"),
  ("lisa", "lisa@example.com"),
  ("myNameDoesNotFit", "text@example.com");
