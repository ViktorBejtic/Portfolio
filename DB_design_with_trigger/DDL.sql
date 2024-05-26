DROP TYPE IF EXISTS expositions_status CASCADE;
CREATE TYPE expositions_status AS ENUM (
  'in progress',
  'in preparation',
  'ended'
);

DROP TYPE IF EXISTS specimens_status CASCADE;
CREATE TYPE specimens_status AS ENUM (
  'available',
  'on display',
  'in maintenance',
  'away',
  'returned'
);

DROP TYPE IF EXISTS specimens_ownership CASCADE;
CREATE TYPE specimens_ownership AS ENUM (
  'owned',
  'borrowed to',
  'borrowed from'
);

DROP TABLE IF EXISTS Categories CASCADE;
CREATE TABLE Categories (
  id BIGINT PRIMARY KEY NOT NULL,
  name varchar UNIQUE NOT NULL
);

DROP TABLE IF EXISTS Specimens CASCADE;
CREATE TABLE Specimens (
  id BIGINT UNIQUE PRIMARY KEY NOT NULL,
  category_id int NOT NULL REFERENCES Categories (id),
  name varchar UNIQUE NOT NULL,
  maintenance_duration interval NOT NULL CHECK (maintenance_duration > '0 minutes'),
  status specimens_status NOT NULL,
  ownership specimens_ownership NOT NULL,
  institution varchar,
  when_available timestamp,
  beginning_at timestamp,
  end_at timestamp CHECK (end_at > beginning_at)
);

DROP TABLE IF EXISTS Zones CASCADE;
CREATE TABLE Zones (
  id BIGINT UNIQUE PRIMARY KEY NOT NULL,
  name varchar UNIQUE NOT NULL
);

DROP TABLE IF EXISTS Expositions CASCADE;
CREATE TABLE Expositions (
  id BIGINT PRIMARY KEY NOT NULL,
  name varchar UNIQUE NOT NULL
);

DROP TABLE IF EXISTS Exposition_info CASCADE;
CREATE TABLE Exposition_info (
  id SERIAL NOT NULL PRIMARY KEY,
  exposition_id BIGINT NOT NULL REFERENCES Expositions (id),
  zone_id BIGINT NOT NULL REFERENCES Zones (id),
  specimen_id BIGINT NOT NULL REFERENCES Specimens (id),
  status expositions_status NOT NULL,
  start_at timestamp NOT NULL,
  end_at timestamp NOT NULL CHECK (end_at > start_at)
);

DROP TABLE IF EXISTS Specimen_history CASCADE;
CREATE TABLE Specimen_history (
  id SERIAL NOT NULL PRIMARY KEY,
  specimen_id BIGINT NOT NULL REFERENCES Specimens (id),
  ownership specimens_ownership NOT NULL,
  institution varchar NOT NULL,
  beginning_at timestamp NOT NULL,
  ended_at timestamp NOT NULL CHECK (ended_at > beginning_at)
);