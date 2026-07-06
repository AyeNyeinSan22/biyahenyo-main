-- Tighten Report column lengths to match validation constraints
ALTER TABLE reports ALTER COLUMN report_type VARCHAR(50) NOT NULL;
ALTER TABLE reports ALTER COLUMN location VARCHAR(200) NOT NULL;
