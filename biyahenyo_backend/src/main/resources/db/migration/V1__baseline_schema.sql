-- Biyahenyo baseline schema (captures the schema previously managed by hibernate.ddl-auto=update)

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(255) NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE fare_matrix (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type    VARCHAR(255),
    distance_min    DOUBLE,
    distance_max    DOUBLE,
    regular_fare    DOUBLE,
    student_fare    DOUBLE,
    senior_fare     DOUBLE
);

CREATE TABLE routes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_location  VARCHAR(255),
    end_location    VARCHAR(255),
    route_name      VARCHAR(255),
    estimated_time  VARCHAR(255),
    traffic_level   VARCHAR(255)
);

CREATE TABLE traffic_data (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    location        VARCHAR(255),
    traffic_level   VARCHAR(255),
    estimated_time  VARCHAR(255)
);

CREATE TABLE transport_routes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_location  VARCHAR(255),
    end_location    VARCHAR(255),
    vehicle_type    VARCHAR(255),
    route_steps     TEXT,
    landmark        VARCHAR(255)
);

CREATE TABLE transit_routes (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(255) NOT NULL,
    display_name        VARCHAR(255) NOT NULL,
    mode                VARCHAR(255) NOT NULL,
    origin_label        VARCHAR(255) NOT NULL,
    destination_label   VARCHAR(255) NOT NULL,
    base_fare           DOUBLE NOT NULL,
    active              BOOLEAN NOT NULL,
    color               VARCHAR(255),
    CONSTRAINT uk_transit_routes_code UNIQUE (code)
);

CREATE TABLE transit_stops (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    latitude    DOUBLE NOT NULL,
    longitude   DOUBLE NOT NULL,
    area_label  VARCHAR(255) NOT NULL,
    CONSTRAINT uk_transit_stops_name UNIQUE (name)
);

CREATE TABLE transit_route_stops (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id        BIGINT NOT NULL,
    stop_id         BIGINT NOT NULL,
    sequence_number INTEGER NOT NULL,
    CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES transit_routes (id),
    CONSTRAINT fk_route_stops_stop FOREIGN KEY (stop_id) REFERENCES transit_stops (id)
);

CREATE TABLE transit_vehicles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    plate_number    VARCHAR(255) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    driver_name     VARCHAR(255) NOT NULL,
    driver_email    VARCHAR(255) NOT NULL,
    status          VARCHAR(255) NOT NULL,
    route_id        BIGINT NOT NULL,
    CONSTRAINT uk_transit_vehicles_plate UNIQUE (plate_number),
    CONSTRAINT fk_vehicles_route FOREIGN KEY (route_id) REFERENCES transit_routes (id)
);

CREATE TABLE vehicle_locations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id  BIGINT NOT NULL,
    latitude    DOUBLE NOT NULL,
    longitude   DOUBLE NOT NULL,
    updated_at  TIMESTAMP NOT NULL,
    CONSTRAINT uk_vehicle_locations_vehicle UNIQUE (vehicle_id),
    CONSTRAINT fk_locations_vehicle FOREIGN KEY (vehicle_id) REFERENCES transit_vehicles (id)
);

CREATE TABLE reports (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type     VARCHAR(255),
    location        VARCHAR(255),
    description     TEXT,
    timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
