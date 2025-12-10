-- Ensure schema exists (outside the procedure, runs once)
CREATE SCHEMA IF NOT EXISTS dbo AUTHORIZATION postgres;

-- One-button rebuild + reseed
CREATE OR REPLACE PROCEDURE dbo.reset()
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    -- 1) Drop all tables in dbo (any order; CASCADE clears dependencies)
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'dbo'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS dbo.%I CASCADE;', r.tablename);
    END LOOP;

    -- 2) Recreate tables with UPDATED structure

    -- dbo."File"
    CREATE TABLE dbo."File" (
        "FileId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "FileName" TEXT COLLATE pg_catalog."default" NOT NULL,
        "PublicId" TEXT COLLATE pg_catalog."default" NOT NULL,
        "SecureUrl" TEXT COLLATE pg_catalog."default" NOT NULL,
        "Bytes" BIGINT NULL,
        "Format" VARCHAR COLLATE pg_catalog."default",
        "Width" BIGINT NULL,
        "Height" BIGINT NULL,
        CONSTRAINT pk_files_901578250 PRIMARY KEY ("FileId")
    );

    -- dbo."Status"
    CREATE TABLE dbo."Status" (
        "StatusId" BIGINT PRIMARY KEY,
        "Name" VARCHAR COLLATE pg_catalog."default" NOT NULL
    );

    -- dbo."Locations" - UPDATED: VARCHAR ID with fixed values
    CREATE TABLE dbo."Locations" (
        "LocationId" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "LocationCode" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Name" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT NULL,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ NULL,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Locations_pkey" PRIMARY KEY ("LocationId")
    );

    -- dbo."Roles" - WITHOUT foreign keys initially
    CREATE TABLE dbo."Roles" (
        "RoleId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "RoleCode" VARCHAR COLLATE pg_catalog."default",
        "Name" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "AccessPages" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT NULL,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ NULL,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Role_pkey" PRIMARY KEY ("RoleId")
    );

    -- dbo."EmployeeUsers" - WITHOUT foreign keys initially
    CREATE TABLE dbo."EmployeeUsers" (
        "EmployeeUserId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "EmployeeUserCode" VARCHAR COLLATE pg_catalog."default",
        "RoleId" BIGINT NOT NULL,
        "PictureFileId" BIGINT,
        "UserName" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Password" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "FirstName" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "LastName" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Email" VARCHAR COLLate pg_catalog."default" NOT NULL,
        "ContactNo" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "AccessGranted" BOOLEAN NOT NULL DEFAULT false,
        "InvitationCode" TEXT COLLATE pg_catalog."default" NOT NULL,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT NULL,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ NULL,
        "RefreshToken" VARCHAR COLLATE pg_catalog."default",
        "HasActiveSession" BOOLEAN NOT NULL DEFAULT false,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "EmployeeUsers_pkey" PRIMARY KEY ("EmployeeUserId")
    );

    -- dbo."EmployeeUserActivityLogs"
    CREATE TABLE dbo."EmployeeUserActivityLogs" (
        "EmployeeUserActivityLogId" SERIAL PRIMARY KEY,
        "EmployeeUserId" BIGINT NOT NULL,
        "Action" VARCHAR(255),
        "Timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- dbo."Scanner" - ✅ FIXED: ScannerType column IS DEFINED
    CREATE TABLE dbo."Scanner" (
        "ScannerId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "ScannerCode" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Name" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "ScannerType" VARCHAR COLLATE pg_catalog."default" DEFAULT 'LOCATION', -- ✅ THIS EXISTS
        "LocationId" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "StatusId" BIGINT NOT NULL,
        "AssignedEmployeeUserId" BIGINT NOT NULL,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT NULL,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ NULL,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Scanner_pkey" PRIMARY KEY ("ScannerId")
    );

    -- dbo."Model"
    CREATE TABLE dbo."Model" (
        "ModelId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "SequenceId" BIGINT NOT NULL DEFAULT 0,
        "ModelName" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Description" VARCHAR COLLATE pg_catalog."default",
        "ThumbnailFileId" BIGINT,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Model_pkey" PRIMARY KEY ("ModelId")
    );

    -- dbo."Units" - UPDATED: VARCHAR LocationId
    CREATE TABLE dbo."Units" (
        "UnitId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "UnitCode" VARCHAR COLLATE pg_catalog."default",
        "RFID" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "ChassisNo" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "ModelId" BIGINT NOT NULL,
        "Color" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Description" TEXT NOT NULL,
        "CreatedBy" BIGINT NOT NULL,
        "UpdatedBy" BIGINT NULL,
        "DateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMPTZ NULL,
        "StatusId" BIGINT NOT NULL,
        "LocationId" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Units_pkey" PRIMARY KEY ("UnitId")
    );

    -- dbo."UnitLogs" - UPDATED: VARCHAR LocationId
    CREATE TABLE dbo."UnitLogs" (
        "UnitLogId" BIGINT GENERATED ALWAYS AS IDENTITY,
        "UnitId" BIGINT NULL,
        "StatusId" BIGINT NULL,
        "PrevStatusId" BIGINT NULL,
        "LocationId" VARCHAR COLLATE pg_catalog."default" NULL,
        "EmployeeUserId" BIGINT NULL,
        "Timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UnitLogs_pkey" PRIMARY KEY ("UnitLogId")
    );

    -- dbo."SystemConfig"
    CREATE TABLE dbo."SystemConfig" (
        "Key" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        "Value" VARCHAR COLLATE pg_catalog."default" NOT NULL,
        CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("Key")
    );

    -- 3) Seed data (Status, FIXED Locations, Roles, Admin user)
    -- Insert Status first (no dependencies)
    INSERT INTO dbo."Status" ("StatusId","Name") VALUES
        (1,'FOR DELIVERY'),
        (2,'IN STORAGE'),
        (3,'READY'),
        (4,'HOLD'),
        (5,'DELIVERED'),
        (6,'CLOSED');

    -- Insert Admin Role FIRST (without foreign key validation)
    INSERT INTO dbo."Roles" (
        "RoleCode","Name","CreatedBy","Active","AccessPages"
    ) VALUES (
        '000001',
        'Admin',
        1,  -- This will work now because we haven't added foreign keys yet
        true,
        '[
          {"page":"Dashboard","view":true,"modify":true,"rights":[]},
          {"page":"Unit Tracker","view":true,"modify":true,"rights":[]},
          {"page":"Reports and Statistics","view":true,"modify":true,"rights":[]},
          {"page":"Employee Users","view":true,"modify":true,"rights":[]},
          {"page":"Roles","view":true,"modify":true,"rights":[]},
          {"page":"CBU","view":true,"modify":true,"rights":[]},
          {"page":"Locations","view":true,"modify":true,"rights":[]},
          {"page":"Model","view":true,"modify":true,"rights":[]},
          {"page":"RFID Scanner","view":true,"modify":true,"rights":[]},
          {"page":"System Config","view":true,"modify":true,"rights":[]}
        ]'
    );

    -- Insert Admin User SECOND
    INSERT INTO dbo."EmployeeUsers" (
        "EmployeeUserCode","UserName","Password","FirstName","LastName",
        "Email","ContactNo","AccessGranted","RoleId","InvitationCode","CreatedBy"
    ) VALUES (
        '000001',
        'admin',
        '$2b$10$LqN3kzfgaYnP5PfDZFfT4edUFqh5Lu7amIxeDDDmu/KEqQFze.p8a',
        'Admin','Admin',
        'admin@gmail.com','0000',
        true,
        1,  -- RoleId 1 exists now
        '0',
        1   -- CreatedBy 1 (self-reference, will work after FK added)
    );

    -- FIXED LOCATIONS (4 locations)
    INSERT INTO dbo."Locations" ("LocationId", "LocationCode", "Name", "CreatedBy", "Active", "DateCreated")
    VALUES 
        ('OPEN_AREA', 'OPEN_AREA', 'Open Area', 1, true, CURRENT_TIMESTAMP),
        ('WAREHOUSE_4', 'WAREHOUSE_4', 'Warehouse 4', 1, true, CURRENT_TIMESTAMP),
        ('WAREHOUSE_5', 'WAREHOUSE_5', 'Warehouse 5', 1, true, CURRENT_TIMESTAMP),
        ('DELIVERED', 'DELIVERED', 'Delivered', 1, true, CURRENT_TIMESTAMP);

    -- 4) Create indexes
    CREATE UNIQUE INDEX IF NOT EXISTS "Role_Name_Active_idx"
        ON dbo."Roles" ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeUsers_Email_Active_idx"
        ON dbo."EmployeeUsers" ("Email" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeUsers_UserName_Active_idx"
        ON dbo."EmployeeUsers" ("UserName" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Locations_Name_Active_idx"
        ON dbo."Locations" ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_Name_Active_idx"
        ON dbo."Scanner" ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_Name_LocationId_Active_idx"
        ON dbo."Scanner" ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "LocationId" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_ScannerCode_Active_idx"
        ON dbo."Scanner" ("ScannerCode" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_ScannerType_idx"
        ON dbo."Scanner" ("ScannerType" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Model_ModelName_Active_idx"
        ON dbo."Model" ("ModelName" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Units_RFID_ModelId_Active_idx"
        ON dbo."Units" USING btree
        ("RFID" COLLATE pg_catalog."default" ASC NULLS LAST, "ModelId" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WITH (deduplicate_items=False)
        TABLESPACE pg_default
        WHERE "Active" = true;

    CREATE UNIQUE INDEX IF NOT EXISTS "Units_RFID_Active_idx"
        ON dbo."Units" ("RFID" ASC NULLS LAST, "Active" ASC NULLS LAST)
        WHERE "Active" = true;

    -- 5) Add foreign keys LAST (after all data is inserted)
    -- This prevents circular dependency errors during seeding
    
    -- EmployeeUsers ↔ Roles, self refs
    ALTER TABLE dbo."EmployeeUsers"
      ADD CONSTRAINT "fk_EmployeeUsers_Roles"
        FOREIGN KEY ("RoleId") REFERENCES dbo."Roles"("RoleId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."EmployeeUsers"
      ADD CONSTRAINT "fk_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."EmployeeUsers"
      ADD CONSTRAINT "fk_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."EmployeeUsers"
      ADD CONSTRAINT "fk_EmployeeUsers_PictureFile" 
        FOREIGN KEY ("PictureFileId") REFERENCES dbo."File" ("FileId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- Roles → EmployeeUsers (CreatedBy/UpdatedBy)
    ALTER TABLE dbo."Roles"
      ADD CONSTRAINT "fk_Roles_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Roles"
      ADD CONSTRAINT "fk_Roles_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- EmployeeUserActivityLogs → EmployeeUsers (EmployeeUserId)
    ALTER TABLE dbo."EmployeeUserActivityLogs"
      ADD CONSTRAINT "fk_EmployeeUserActivityLogs_EmployeeUsers"
        FOREIGN KEY ("EmployeeUserId") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- Locations → EmployeeUsers
    ALTER TABLE dbo."Locations"
      ADD CONSTRAINT "fk_Locations_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Locations"
      ADD CONSTRAINT "fk_Locations_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- Scanner → Locations (VARCHAR), Status, EmployeeUsers
    ALTER TABLE dbo."Scanner"
      ADD CONSTRAINT "fk_Scanner_Locations"
        FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Scanner"
      ADD CONSTRAINT "fk_Scanner_Status"
        FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Scanner"
      ADD CONSTRAINT "fk_Scanner_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Scanner"
      ADD CONSTRAINT "fk_Scanner_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Scanner"
      ADD CONSTRAINT "fk_Scanner_AssignedEmployeeUser"
        FOREIGN KEY ("AssignedEmployeeUserId") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- Model → File, EmployeeUsers
    ALTER TABLE dbo."Model"
      ADD CONSTRAINT "fk_CategoryThumbnailFile_File"
        FOREIGN KEY ("ThumbnailFileId") REFERENCES dbo."File"("FileId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Model"
      ADD CONSTRAINT "fk_Model_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE dbo."Model"
      ADD CONSTRAINT "fk_Model_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION;

    -- Units → Model, Status, Locations (VARCHAR), EmployeeUsers
    ALTER TABLE dbo."Units"
      ADD CONSTRAINT "fk_Units_Model"
        FOREIGN KEY ("ModelId") REFERENCES dbo."Model"("ModelId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Units"
      ADD CONSTRAINT "fk_Units_Status"
        FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Units"
      ADD CONSTRAINT "fk_Units_Location"
        FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Units"
      ADD CONSTRAINT "fk_Units_EmployeeUsers_CreatedBy"
        FOREIGN KEY ("CreatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."Units"
      ADD CONSTRAINT "fk_Units_EmployeeUsers_UpdatedBy"
        FOREIGN KEY ("UpdatedBy") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    -- UnitLogs → Units, Status (current & prev), Locations (VARCHAR), EmployeeUsers
    ALTER TABLE dbo."UnitLogs"
      ADD CONSTRAINT "fk_UnitLogs_Unit"
        FOREIGN KEY ("UnitId") REFERENCES dbo."Units"("UnitId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."UnitLogs"
      ADD CONSTRAINT "fk_UnitLogs_Status"
        FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."UnitLogs"
      ADD CONSTRAINT "fk_UnitLogs_PrevStatus"
        FOREIGN KEY ("PrevStatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."UnitLogs"
      ADD CONSTRAINT "fk_UnitLogs_Locations"
        FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    ALTER TABLE dbo."UnitLogs"
      ADD CONSTRAINT "fk_UnitLogs_EmployeeUsers"
        FOREIGN KEY ("EmployeeUserId") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID;

    RAISE NOTICE 'Database reset completed successfully! ScannerType column is present.';
END;
$$;

-- Use:
CALL dbo.reset();