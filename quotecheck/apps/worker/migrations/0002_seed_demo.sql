-- Seed data for QuoteCheck v1

INSERT INTO pricing_versions (version_name, description, is_active, created_by)
VALUES ('v1.0', 'Initial launch pricing', 1, 'system');

-- Insert all 6 launch categories
INSERT INTO categories (slug, name, description, unit, example_use, display_order)
VALUES
  ('interior_painting', 'Interior Painting', 'Room or full house interior', 'sqm', 'Paint interior walls and ceilings', 1),
  ('drywall_plaster', 'Drywall / Plaster Repair', 'Patch small holes or large repairs', 'job', 'Fix damaged drywall or plaster', 2),
  ('gutter_cleaning', 'Gutter Cleaning', 'Clean gutters and downpipes', 'm', 'Remove debris from gutters', 3),
  ('pressure_washing', 'Pressure Washing', 'Driveway, patio, siding', 'sqm', 'Clean exterior surfaces', 4),
  ('junk_removal', 'Junk Removal', 'Haul away unwanted items', 'job', 'Remove old furniture, debris', 5),
  ('ceiling_fan_light', 'Ceiling Fan / Light Fixture', 'Install or replace fixtures', 'job', 'Install ceiling fan or light', 6);

-- Insert 3 sample areas
INSERT INTO area_profiles (area_code, area_name, state_code, country_code, cost_index, population_tier, notes)
VALUES
  ('78704', 'Austin, TX', 'TX', 'US', 0.95, 'metro', 'Austin metro area'),
  ('10001', 'New York, NY', 'NY', 'US', 1.45, 'metro', 'NYC metro area - premium pricing'),
  ('90210', 'Los Angeles, CA', 'CA', 'US', 1.35, 'metro', 'LA metro area - west coast premium');

-- Insert pricing for Austin (area 1)
INSERT INTO pricing_tables (pricing_version_id, category_id, area_id, base_low, base_typical, base_high, confidence_boost, notes)
VALUES
  (1, 1, 1, 800, 1200, 1600, 1.0, 'Interior painting Austin'),
  (1, 2, 1, 300, 500, 800, 1.0, 'Drywall repair Austin'),
  (1, 3, 1, 500, 800, 1200, 1.0, 'Gutter cleaning Austin'),
  (1, 4, 1, 600, 1000, 1500, 1.0, 'Pressure washing Austin'),
  (1, 5, 1, 900, 1400, 2000, 1.0, 'Junk removal Austin'),
  (1, 6, 1, 200, 350, 500, 1.0, 'Ceiling fan/light Austin');

-- Insert pricing for NYC (area 2)
INSERT INTO pricing_tables (pricing_version_id, category_id, area_id, base_low, base_typical, base_high, confidence_boost, notes)
VALUES
  (1, 1, 2, 1450, 1800, 2400, 0.85, 'Interior painting NYC'),
  (1, 2, 2, 450, 750, 1200, 0.85, 'Drywall repair NYC'),
  (1, 3, 2, 700, 1000, 1500, 0.85, 'Gutter cleaning NYC'),
  (1, 4, 2, 900, 1400, 2100, 0.85, 'Pressure washing NYC'),
  (1, 5, 2, 1200, 1800, 2700, 0.85, 'Junk removal NYC'),
  (1, 6, 2, 350, 550, 800, 0.85, 'Ceiling fan/light NYC');

-- Insert pricing for LA (area 3)
INSERT INTO pricing_tables (pricing_version_id, category_id, area_id, base_low, base_typical, base_high, confidence_boost, notes)
VALUES
  (1, 1, 3, 1200, 1650, 2200, 0.90, 'Interior painting LA'),
  (1, 2, 3, 400, 650, 1000, 0.90, 'Drywall repair LA'),
  (1, 3, 3, 600, 900, 1350, 0.90, 'Gutter cleaning LA'),
  (1, 4, 3, 800, 1200, 1800, 0.90, 'Pressure washing LA'),
  (1, 5, 3, 1000, 1600, 2400, 0.90, 'Junk removal LA'),
  (1, 6, 3, 300, 500, 750, 0.90, 'Ceiling fan/light LA');

-- Question sets for each category
INSERT INTO question_sets (category_id, display_order) VALUES (1, 1);
INSERT INTO question_sets (category_id, display_order) VALUES (2, 1);
INSERT INTO question_sets (category_id, display_order) VALUES (3, 1);
INSERT INTO question_sets (category_id, display_order) VALUES (4, 1);
INSERT INTO question_sets (category_id, display_order) VALUES (5, 1);
INSERT INTO question_sets (category_id, display_order) VALUES (6, 1);

-- Interior Painting Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (1, 'area_sqm', 'What is the approximate area in square meters?', 'number', 'Total wall and ceiling area to paint', 1, 1, NULL),
  (1, 'condition', 'Current condition of walls?', 'radio', 'Choose the worst condition found', 1, 2, '{"excellent":"Excellent","good":"Good","fair":"Fair","poor":"Poor"}'),
  (1, 'access_difficulty', 'How difficult is access?', 'radio', 'Are ceilings high? Narrow spaces?', 1, 3, '{"easy":"Easy","normal":"Normal","hard":"Hard to reach","very_hard":"Very difficult"}'),
  (1, 'trim_work', 'Trim painting needed?', 'radio', 'Paint wooden trim/baseboards?', 0, 4, '{"yes":"Yes","no":"No","unsure":"Not sure"}');

-- Drywall Repair Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (2, 'num_patches', 'How many patches needed?', 'radio', 'Rough count of damaged areas', 1, 1, '{"one":"1 small patch","few":"2-3 patches","several":"4-6 patches","many":"7+ patches"}'),
  (2, 'size_level', 'Damage severity?', 'radio', 'Small holes vs large damage?', 1, 2, '{"small":"Small holes","medium":"Medium damage","large":"Large repair needed"}'),
  (2, 'prep_needed', 'Prep work required?', 'radio', 'Removing old material?', 0, 3, '{"minimal":"Minimal","moderate":"Moderate","extensive":"Extensive"}');

-- Gutter Cleaning Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (3, 'length_m', 'Approximate gutter length in meters?', 'number', 'Total linear meters of gutters', 1, 1, NULL),
  (3, 'stories', 'How many stories?', 'radio', 'Single story, 2-story, 3+ story?', 1, 2, '{"one":"1 story (easy access)","two":"2 stories","three":"3+ stories (difficult)"}'),
  (3, 'debris_level', 'Debris level?', 'radio', 'Light leaves or heavy debris?', 1, 3, '{"light":"Light (leaves)","moderate":"Moderate","heavy":"Heavy (dirt, debris)"}');

-- Pressure Washing Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (4, 'area_sqm', 'Approximate area in square meters?', 'number', 'Total surface area to wash', 1, 1, NULL),
  (4, 'surface_type', 'What surface?', 'radio', 'Driveway, patio, siding, etc.?', 1, 2, '{"driveway":"Driveway (concrete)","patio":"Patio (pavers/concrete)","siding":"Siding (vinyl/wood)","deck":"Deck (wood)","other":"Other"}'),
  (4, 'dirt_level', 'Dirt/algae level?', 'radio', 'Light or heavy accumulation?', 1, 3, '{"light":"Light (routine clean)","moderate":"Moderate","heavy":"Heavy (algae, stains)"}');

-- Junk Removal Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (5, 'num_loads', 'How many truck loads?', 'radio', 'Rough estimate of junk volume', 1, 1, '{"small":"Small load (pickup bed)","medium":"Medium load (1 full truck)","large":"Large (1.5 trucks)","xlarge":"Very large (2+ trucks)"}'),
  (5, 'item_types', 'What type of junk?', 'radio', 'Furniture, construction, general?', 1, 2, '{"furniture":"Furniture","construction":"Construction debris","mixed":"Mixed items","hazmat":"Possible hazmat"}'),
  (5, 'access_difficulty', 'Access difficulty?', 'radio', 'Easy access or hard to reach?', 0, 3, '{"easy":"Easy access","normal":"Normal","difficult":"Difficult (stairs, etc.)"}');

-- Ceiling Fan / Light Questions
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, help_text, required, display_order, options)
VALUES
  (6, 'num_fixtures', 'How many fixtures?', 'number', 'Number of fans or lights to install', 1, 1, NULL),
  (6, 'complexity', 'Installation complexity?', 'radio', 'Simple swap vs new wiring?', 1, 2, '{"simple":"Simple swap (existing box)","moderate":"Some wiring","complex":"Major electrical work"}'),
  (6, 'fixture_type', 'Fixture type?', 'radio', 'Ceiling fan, light, or both?', 1, 3, '{"fan":"Ceiling fan","light":"Light fixture","both":"Ceiling fan with lights"}');

-- Pricing rules
INSERT INTO pricing_rules (category_id, rule_name, rule_type, condition_field, condition_value, adjustment_value, notes)
VALUES
  (1, 'High access difficulty', 'multiply', 'access_difficulty', 'hard,very_hard', 1.2, 'Add 20% for difficult access'),
  (1, 'Poor condition prep', 'multiply', 'condition', 'poor', 1.3, 'Add 30% for extensive prep'),
  (2, 'Many patches', 'multiply', 'num_patches', 'many', 1.4, 'Add 40% for extensive repairs'),
  (3, 'Tall building', 'multiply', 'stories', 'three', 1.25, 'Add 25% for 3+ story buildings'),
  (3, 'Heavy debris', 'multiply', 'debris_level', 'heavy', 1.2, 'Add 20% for heavy debris'),
  (4, 'Heavy stains', 'multiply', 'dirt_level', 'heavy', 1.15, 'Add 15% for algae/heavy stains'),
  (5, 'Hazmat items', 'add_fixed', 'item_types', 'hazmat', 300, 'Add $300 hazmat handling'),
  (6, 'Complex electrical', 'multiply', 'complexity', 'complex', 1.5, 'Add 50% for complex electrical');
