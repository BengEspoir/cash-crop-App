-- AgriculNet — Seed Cameroon Regions

INSERT INTO regions (name, description) VALUES
('Adamaoua', 'Ngaoundéré central highland region'),
('Center', 'Yaoundé capital region'),
('East', 'Bertoua forest region'),
('Far North', 'Maroua sahelian region'),
('Littoral', 'Douala coastal economic hub'),
('North', 'Garoua cotton and grain belt'),
('North West', 'Bamenda highland agricultural zone'),
('West', 'Bafoussam highland agricultural zone'),
('South', 'Ebolowa forest and maritime zone'),
('South West', 'Buea and Kumba volcanic soil zone')
ON CONFLICT (name) DO NOTHING;
