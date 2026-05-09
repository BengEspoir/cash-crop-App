-- AgriculNet removable marketplace population seed
-- Purpose: investor/demo rendering only. All seeded sellers are unverified.
-- Password hash is a temporary non-production hash; replace or remove these users before production testing.

DELETE FROM listing_images
WHERE listing_id IN (
  SELECT id FROM listings WHERE specs->>'seeded' = 'true'
);

DELETE FROM listings
WHERE specs->>'seeded' = 'true';

WITH seed_sellers AS (
  SELECT *
  FROM (VALUES
    ('farmer','Mbah','Tanyi','+237683100001','mbah.tanyi.seed@agriculnet.local','South West','Kumba','Kumba Cocoa Cooperative','Cocoa Beans',ARRAY['Cocoa Beans','Plantain','Cassava']),
    ('farmer','Amina','Kofi','+237683100002','amina.kofi.seed@agriculnet.local','South West','Mamfe','Manyu Spice Farms','White Pepper',ARRAY['White Pepper','Cocoa Beans','Egusi']),
    ('farmer','Jean','Ngum','+237683100003','jean.ngum.seed@agriculnet.local','South West','Limbe','Fako Fresh Produce','Plantain',ARRAY['Plantain','Banana','Cassava']),
    ('farmer','Claudine','Njoya','+237683100004','claudine.njoya.seed@agriculnet.local','West','Bafoussam','Bamboutos Highland Farms','Arabica Coffee',ARRAY['Arabica Coffee','Irish Potato','Cabbage']),
    ('farmer','Patrick','Fotso','+237683100005','patrick.fotso.seed@agriculnet.local','West','Dschang','Menoua Roots Cooperative','Irish Potato',ARRAY['Irish Potato','Beans','Maize']),
    ('farmer','Esther','Kamga','+237683100006','esther.kamga.seed@agriculnet.local','West','Foumbot','Noun Valley Growers','Tomato',ARRAY['Tomato','Onion','Maize']),
    ('farmer','Samuel','Ewane','+237683100007','samuel.ewane.seed@agriculnet.local','Littoral','Nkongsamba','Mungo Coffee Estate','Robusta Coffee',ARRAY['Robusta Coffee','Pineapple','Papaya']),
    ('farmer','Grace','Moungo','+237683100008','grace.moungo.seed@agriculnet.local','Littoral','Melong','Melong Fruit Cooperative','Pineapple',ARRAY['Pineapple','Banana','Robusta Coffee']),
    ('farmer','David','Etame','+237683100009','david.etame.seed@agriculnet.local','Littoral','Edea','Sanaga Palm Producers','Palm Oil',ARRAY['Palm Oil','Cassava','Plantain']),
    ('farmer','Marthe','Abena','+237683100010','marthe.abena.seed@agriculnet.local','Centre','Mbalmayo','Nyong Agro Group','Cassava',ARRAY['Cassava','Maize','Groundnuts']),
    ('farmer','Joseph','Mvondo','+237683100011','joseph.mvondo.seed@agriculnet.local','Centre','Obala','Lekie Grain Farmers','Maize',ARRAY['Maize','Soybeans','Groundnuts']),
    ('farmer','Solange','Ngo','+237683100012','solange.ngo.seed@agriculnet.local','Centre','Yaounde','Mfoundi Market Gardens','Okra',ARRAY['Okra','Tomato','Pepper']),
    ('farmer','Hamadou','Bello','+237683100013','hamadou.bello.seed@agriculnet.local','North','Garoua','Benoue Cotton Farms','Cotton',ARRAY['Cotton','Sorghum','Maize']),
    ('farmer','Fadimatou','Oumar','+237683100014','fadimatou.oumar.seed@agriculnet.local','North','Guider','Mayo Louti Grains','Sorghum',ARRAY['Sorghum','Millet','Groundnuts']),
    ('farmer','Ibrahim','Moussa','+237683100015','ibrahim.moussa.seed@agriculnet.local','North','Poli','Faro Valley Producers','Sesame',ARRAY['Sesame','Maize','Cowpea']),
    ('reseller','Nadine','Besong','+237683100016','nadine.besong.seed@agriculnet.local','South West','Buea','Buea Agro Sourcing','Cocoa Beans',ARRAY['Cocoa Beans','Plantain','White Pepper']),
    ('reseller','Eric','Fongang','+237683100017','eric.fongang.seed@agriculnet.local','West','Mbouda','Highland Produce Traders','Irish Potato',ARRAY['Irish Potato','Arabica Coffee','Beans']),
    ('reseller','Lucie','Mambo','+237683100018','lucie.mambo.seed@agriculnet.local','Littoral','Douala','Wouri Fresh Supply','Pineapple',ARRAY['Pineapple','Palm Oil','Plantain']),
    ('reseller','Andre','Biya','+237683100019','andre.biya.seed@agriculnet.local','Centre','Yaounde','Centre Agro Distribution','Maize',ARRAY['Maize','Cassava','Tomato']),
    ('reseller','Aissatou','Yerima','+237683100020','aissatou.yerima.seed@agriculnet.local','North','Garoua','Sahel Crop Traders','Sorghum',ARRAY['Sorghum','Sesame','Cotton']),
    ('reseller','Brenda','Tabe','+237683100021','brenda.tabe.seed@agriculnet.local','South West','Muyuka','Muyuka Bulk Foods','Cassava',ARRAY['Cassava','Cocoa Beans','Banana']),
    ('reseller','Michel','Tchoumi','+237683100022','michel.tchoumi.seed@agriculnet.local','West','Bafang','Nkam Wholesale Produce','Beans',ARRAY['Beans','Tomato','Irish Potato']),
    ('reseller','Carine','Ebanda','+237683100023','carine.ebanda.seed@agriculnet.local','Littoral','Yabassi','Nkam River Aggregators','Palm Oil',ARRAY['Palm Oil','Papaya','Robusta Coffee']),
    ('reseller','Rene','Essono','+237683100024','rene.essono.seed@agriculnet.local','Centre','Akonolinga','Nyong Crop Links','Groundnuts',ARRAY['Groundnuts','Okra','Maize']),
    ('reseller','Maimouna','Adama','+237683100025','maimouna.adama.seed@agriculnet.local','North','Lagdo','Lagdo Grain Exchange','Millet',ARRAY['Millet','Cowpea','Sesame'])
  ) AS s(role, first_name, last_name, phone, email, region, city, business_name, primary_crop, crops)
),
inserted_users AS (
  INSERT INTO users (
    role, status, first_name, last_name, phone, email, password_hash,
    phone_verified, email_verified, region, city, country
  )
  SELECT
    role::user_role,
    'active'::user_status,
    first_name,
    last_name,
    phone,
    email,
    '$2a$12$zJZVvD8XUHyRtK2N0R8yO.vbS4b9fL3eEwX8PyO8uBV.kE21oVN8O',
    TRUE,
    TRUE,
    region,
    city,
    'Cameroon'
  FROM seed_sellers
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    region = EXCLUDED.region,
    city = EXCLUDED.city
  RETURNING id, role, email
),
farmer_rows AS (
  INSERT INTO farmer_profiles (
    user_id, farm_name, cooperative_name, primary_crop, crops_grown,
    identity_verification_status, bio
  )
  SELECT u.id, s.business_name, s.business_name, s.primary_crop, s.crops,
         'not_started', 'Seeded unverified farmer profile for marketplace rendering.'
  FROM inserted_users u
  JOIN seed_sellers s ON s.email = u.email
  WHERE u.role = 'farmer'
  ON CONFLICT (user_id) DO UPDATE SET
    farm_name = EXCLUDED.farm_name,
    primary_crop = EXCLUDED.primary_crop,
    crops_grown = EXCLUDED.crops_grown,
    identity_verification_status = 'not_started'
  RETURNING id, user_id, 'farmer'::text AS seller_type
),
reseller_rows AS (
  INSERT INTO reseller_profiles (
    user_id, business_name, primary_crop, crops_sold,
    identity_verification_status, about
  )
  SELECT u.id, s.business_name, s.primary_crop, s.crops,
         'not_started', 'Seeded unverified reseller profile for marketplace rendering.'
  FROM inserted_users u
  JOIN seed_sellers s ON s.email = u.email
  WHERE u.role = 'reseller'
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    primary_crop = EXCLUDED.primary_crop,
    crops_sold = EXCLUDED.crops_sold,
    identity_verification_status = 'not_started'
  RETURNING id, user_id, 'reseller'::text AS seller_type
),
seller_profiles AS (
  SELECT * FROM farmer_rows
  UNION ALL
  SELECT * FROM reseller_rows
)
INSERT INTO listings (
  farmer_id, reseller_id, crop_name_fallback, quantity, quantity_unit,
  price_per_unit, currency, status, grade, delivery_window, summary,
  description, location_name, specs, is_export_ready, published_at
)
SELECT
  CASE WHEN sp.seller_type = 'farmer' THEN sp.id ELSE NULL END,
  CASE WHEN sp.seller_type = 'reseller' THEN sp.id ELSE NULL END,
  crop_name,
  quantity,
  'kg',
  price,
  'XAF',
  'active',
  grade,
  'Available within 7-14 days',
  crop_name || ' available from a seeded unverified Cameroon seller.',
  'Removable seed listing for UI and marketplace realism. Verification is not completed.',
  s.city || ', ' || s.region,
  jsonb_build_object('seeded', true, 'region', s.region, 'sellerRole', sp.seller_type),
  export_ready,
  NOW()
FROM seller_profiles sp
JOIN inserted_users u ON u.id = sp.user_id
JOIN seed_sellers s ON s.email = u.email
CROSS JOIN LATERAL (
  VALUES
    (s.crops[1], 1200 + (length(s.email) * 10), 900 + (length(s.city) * 25), 'Grade A', TRUE),
    (s.crops[2], 900 + (length(s.region) * 15), 650 + (length(s.first_name) * 30), 'Standard', FALSE),
    (s.crops[3], 700 + (length(s.last_name) * 20), 500 + (length(s.last_name) * 20), 'Cleaned', FALSE)
) AS listing_data(crop_name, quantity, price, grade, export_ready);
