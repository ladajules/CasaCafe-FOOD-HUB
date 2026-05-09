-- Use your existing database
USE s24100966_ladamart;

-- Create items table if not exists
CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10,2) NOT NULL
);

-- Create item_variants table if not exists
CREATE TABLE IF NOT EXISTS item_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Insert sample data if tables are empty
INSERT INTO items (name, category, description, image_url, price) 
SELECT 'Tapsilog', 'Silog', 'Tapa with sinangag and itlog', 'tapsilog.jpg', 80.00
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

INSERT INTO items (name, category, description, image_url, price) 
SELECT 'Tocilog', 'Silog', 'Tocino with sinangag and itlog', 'tocilog.jpg', 75.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Tocilog');

INSERT INTO items (name, category, description, image_url, price) 
SELECT 'Hotsilog', 'Silog', 'Hotdog with sinangag and itlog', 'hotsilog.jpg', 70.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Hotsilog');