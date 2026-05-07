-- AgriculNet — Seed Major Crops

INSERT INTO crops (name, category, description) VALUES
('Cocoa Beans', 'Export', 'Premium sun-dried cocoa beans'),
('Arabica Coffee', 'Export', 'Highland specialty coffee'),
('Robusta Coffee', 'Export', 'Lowland strong coffee'),
('Penja Pepper', 'Spice', 'Protected premium white and black pepper'),
('Maize', 'Grain', 'White and yellow maize staples'),
('Cassava', 'Tuber', 'Fresh and processed cassava products'),
('Plantain', 'Fruit', 'Fresh market plantain bunches'),
('Palm Oil', 'Oil', 'Artisanal and industrial red palm oil'),
('Irish Potato', 'Vegetable', 'Highland potato varieties'),
('Onions', 'Vegetable', 'Northern bulb onions'),
('Ginger', 'Spice', 'Fresh and dried aromatic ginger'),
('Soybeans', 'Legume', 'Protein-rich oilseeds')
ON CONFLICT (name) DO NOTHING;
