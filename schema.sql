# Table, Create Table
CREATE TABLE `products` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(200) NOT NULL,
  `department_name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# Insert placeholder products
INSERT INTO `products` VALUES
(0,'iPhone','Electronics', 999, 100),
(0,'MacBook Pro','Electronics', 2500, 50),
(0,'MacBook Air','Electronics', 1500, 50),
(0,'Beats by Dre','Electronics', 250, 200),
(0,'USB-C Charger','Electronics', 50, 200),
(0,'Space Monitor','Electronics', 699.99, 50),
(0,'Espresso Machine','Household', 299.99, 100),
(0,'Slowcooker','Household', 39.99, 500),
(0,'OnePlus 7 Pro','Electronics', 800, 50),
(0,'Nintendo Switch','Electronics', 349.99, 70),
(0,'Monitor Arm','Electronics', 120, 30)