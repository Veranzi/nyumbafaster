-- Keja: required Postgres extensions
create extension if not exists "pgcrypto";    -- gen_random_uuid()
create extension if not exists "postgis";     -- geography(Point, 4326)
create extension if not exists "pg_trgm";     -- fuzzy search on titles/estates
create extension if not exists "unaccent";    -- diacritic-insensitive search
