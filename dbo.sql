
CREATE SCHEMA IF NOT EXISTS dbo AUTHORIZATION postgres;

CREATE OR REPLACE PROCEDURE dbo.drop_all_tables()
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'dbo'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS dbo.%I CASCADE;', r.tablename);
    END LOOP;
END;
$$;

CALL dbo.drop_all_tables();

CREATE TABLE IF NOT EXISTS dbo."File"
(
    "FileId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "FileName" text COLLATE pg_catalog."default" NOT NULL,
    "Url" text COLLATE pg_catalog."default",
    "GUID" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT pk_files_901578250 PRIMARY KEY ("FileId")
);

CREATE TABLE IF NOT EXISTS dbo."Roles"
(
    "RoleId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "RoleCode" character varying COLLATE pg_catalog."default",
    "Name" character varying COLLATE pg_catalog."default" NOT NULL,
    "AccessPages" jsonb NOT NULL DEFAULT '[]'::json,
    "CreatedBy" BIGINT NOT NULL,
    "UpdatedBy" BIGINT NULL,
    "DateCreated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LastUpdatedAt" timestamp with time zone NULL ,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("RoleId")
);


ALTER TABLE IF EXISTS dbo."Roles"
    OWNER to postgres;
-- Index: Role_Name_Active_idx

-- DROP INDEX IF EXISTS dbo."Role_Name_Active_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "Role_Name_Active_idx"
    ON dbo."Roles" USING btree
    ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

-- Foreign key constraints for dbo."Roles" should be added after dbo."EmployeeUsers" table is created.


CREATE TABLE IF NOT EXISTS dbo."EmployeeUsers"
(
    "EmployeeUserId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "EmployeeUserCode" character varying COLLATE pg_catalog."default",
    "RoleId" bigint NOT NULL,
    "UserName" character varying COLLATE pg_catalog."default" NOT NULL,
    "Password" character varying COLLATE pg_catalog."default" NOT NULL,
    "FirstName" character varying COLLATE pg_catalog."default" NOT NULL,
    "LastName" character varying COLLATE pg_catalog."default" NOT NULL,
    "Email" character varying COLLATE pg_catalog."default" NOT NULL,
    "ContactNo" character varying COLLATE pg_catalog."default" NOT NULL,
    "AccessGranted" boolean NOT NULL DEFAULT false,
    "InvitationCode" text COLLATE pg_catalog."default" NOT NULL,
    "CreatedBy" BIGINT NOT NULL,
    "UpdatedBy" BIGINT NULL,
    "DateCreated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LastUpdatedAt" timestamp with time zone NULL ,
    "RefreshToken" character varying COLLATE pg_catalog."default",
    "HasActiveSession" boolean NOT NULL DEFAULT false,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "EmployeeUsers_pkey" PRIMARY KEY ("EmployeeUserId")
);

INSERT INTO dbo."Roles" (
    "RoleCode",
    "Name", 
    "CreatedBy",
    "Active",
    "AccessPages"
)
VALUES (
    '000001',
    'Admin',
    1,
    true,
    '[
        {
        "page": "Dashboard",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Unit Tracker",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Unit Logs",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Reports and Statistics",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Employee Users",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Roles",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "CBU",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Location",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "Model",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "RFID Scanner",
        "view": true,
        "modify": true,
        "rights": []
        },
        {
        "page": "System Config",
        "view": true,
        "modify": true,
        "rights": []
        }
    ]'
);

INSERT INTO dbo."EmployeeUsers" (
    "EmployeeUserCode",
    "UserName",
    "Password", 
    "FirstName",
    "LastName",
    "Email",
    "ContactNo",
    "AccessGranted",
    "RoleId",
    "InvitationCode",
    "CreatedBy"
)
VALUES (
    '000001',
    'admin',
    '$2b$10$LqN3kzfgaYnP5PfDZFfT4edUFqh5Lu7amIxeDDDmu/KEqQFze.p8a',  
    'Admin',
    'Admin',
    'admin@gmail.com',
    '0000',
    true,
    1,
    0,
    1
    );

-- Index: EmployeeUsers_UserName_Active_idx

-- DROP INDEX IF EXISTS dbo."EmployeeUsers_UserName_Active_idx";

ALTER TABLE IF EXISTS dbo."EmployeeUsers"
    OWNER to postgres;
-- Index: EmployeeUsers_Email_Active_idx

-- DROP INDEX IF EXISTS dbo."EmployeeUsers_Email_Active_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeUsers_Email_Active_idx"
    ON dbo."EmployeeUsers" USING btree
    ("Email" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;
-- Index: EmployeeUsers_UserName_Active_idx

-- DROP INDEX IF EXISTS dbo."EmployeeUsers_UserName_Active_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeUsers_UserName_Active_idx"
    ON dbo."EmployeeUsers" USING btree
    ("UserName" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

-- After CREATE TABLE dbo."EmployeeUsers"
ALTER TABLE IF EXISTS dbo."EmployeeUsers"
    ADD CONSTRAINT "fk_EmployeeUsers_Roles" FOREIGN KEY ("RoleId")
        REFERENCES dbo."Roles" ("RoleId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

ALTER TABLE IF EXISTS dbo."EmployeeUsers"
    ADD CONSTRAINT "fk_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

ALTER TABLE IF EXISTS dbo."EmployeeUsers"
    ADD CONSTRAINT "fk_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

-- Now add foreign key constraints for dbo."Roles"
ALTER TABLE IF EXISTS dbo."Roles"
    ADD CONSTRAINT "fk_Roles_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

ALTER TABLE IF EXISTS dbo."Roles"
    ADD CONSTRAINT "fk_Roles_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

CREATE TABLE dbo."EmployeeUserActivityLogs" (
    "EmployeeUserActivityLogId" SERIAL PRIMARY KEY,
    "EmployeeUserId" BIGINT NOT NULL,
    "Action" VARCHAR(255),
    "Timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_EmployeeUserActivityLogs_EmployeeUsers" FOREIGN KEY ("EmployeeUserId") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE dbo."Status" ( "StatusId" BIGINT PRIMARY KEY, "Name" character varying COLLATE pg_catalog."default" NOT NULL);

INSERT INTO dbo."Status"(
	"StatusId", "Name")
	VALUES (1, 'REGISTERED'),
	(2, 'STORAGE'),
	(3, 'READY'),
	(4, 'HOLD'),
	(5, 'DELIVERED'),
	(6, 'CLOSED');

CREATE TABLE IF NOT EXISTS dbo."Locations" (
    "LocationId" BIGINT GENERATED ALWAYS AS IDENTITY (MINVALUE 1 INCREMENT BY 1),
    "LocationCode" character varying COLLATE pg_catalog."default" NOT NULL,
    "Name" character varying COLLATE pg_catalog."default" NOT NULL,
    "CreatedBy" BIGINT NOT NULL,
    "UpdatedBy" BIGINT NULL,
    "DateCreated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LastUpdatedAt" timestamp with time zone NULL ,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "Locations_pkey" PRIMARY KEY ("LocationId"),
    CONSTRAINT "fk_Locations_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Locations_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS dbo."Locations"
    OWNER to postgres;

CREATE UNIQUE INDEX IF NOT EXISTS "Locations_Name_Active_idx"
    ON dbo."Locations" USING btree
    ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;


CREATE TABLE IF NOT EXISTS dbo."Scanner" (
    "ScannerId" BIGINT GENERATED ALWAYS AS IDENTITY (MINVALUE 1 INCREMENT BY 1),
    "ScannerCode" character varying COLLATE pg_catalog."default" NOT NULL,
    "Name" character varying COLLATE pg_catalog."default" NOT NULL,
    "LocationId" BIGINT NOT NULL,
    "StatusId" BIGINT NOT NULL,
    "AssignedEmployeeUserId" BIGINT NOT NULL,
    "CreatedBy" BIGINT NOT NULL,
    "UpdatedBy" BIGINT NULL,
    "DateCreated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LastUpdatedAt" timestamp with time zone NULL ,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "Scanner_pkey" PRIMARY KEY ("ScannerId"),
    CONSTRAINT "fk_Scanner_Locations" FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Scanner_Status" FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Scanner_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Scanner_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Scanner_AssignedEmployeeUser" FOREIGN KEY ("AssignedEmployeeUserId")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE IF EXISTS dbo."Scanner"
    OWNER to postgres;

CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_Name_Active_idx"
    ON dbo."Scanner" USING btree
    ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_Name_LocationId_Active_idx"
    ON dbo."Scanner" USING btree
    ("Name" COLLATE pg_catalog."default" ASC NULLS LAST, "LocationId" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "Scanner_ScannerCode_Active_idx"
    ON dbo."Scanner" USING btree
    ("ScannerCode" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

CREATE TABLE IF NOT EXISTS dbo."Model"
(
    "ModelId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "SequenceId" bigint NOT NULL DEFAULT 0,
    "ModelName" character varying COLLATE pg_catalog."default" NOT NULL,
    "Description" character varying COLLATE pg_catalog."default",
    "ThumbnailFileId" bigint,
    "CreatedBy" bigint NOT NULL,
    "UpdatedBy" bigint,
    "DateCreated" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastUpdatedAt" timestamp with time zone,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "Model_pkey" PRIMARY KEY ("ModelId"),
    CONSTRAINT "fk_CategoryThumbnailFile_File" FOREIGN KEY ("ThumbnailFileId")
        REFERENCES dbo."File" ("FileId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Model_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "fk_Model_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE IF EXISTS dbo."Model"
    OWNER to postgres;
-- Index: Model_ModelName_Active_idx

-- DROP INDEX IF EXISTS dbo."Model_ModelName_Active_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "Model_ModelName_Active_idx"
    ON dbo."Model" USING btree
    ("ModelName" COLLATE pg_catalog."default" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

-- Foreign key constraints for dbo."Roles" should be added after dbo."EmployeeUsers" table is created.

CREATE TABLE IF NOT EXISTS dbo."Units" (
    "UnitId" BIGINT GENERATED ALWAYS AS IDENTITY (MINVALUE 1 INCREMENT BY 1),
    "UnitCode" character varying COLLATE pg_catalog."default",
    "RFID" character varying COLLATE pg_catalog."default" NOT NULL,
    "ChassisNo" character varying COLLATE pg_catalog."default" NOT NULL,
    "ModelId" BIGINT NOT NULL,
    "Color" character varying COLLATE pg_catalog."default" NOT NULL,
    "Description" TEXT NOT NULL,
    "CreatedBy" BIGINT NOT NULL,
    "UpdatedBy" BIGINT NULL,
    "DateCreated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LastUpdatedAt" timestamp with time zone NULL ,
    "StatusId" BIGINT NOT NULL,
    "LocationId" BIGINT NOT NULL,
    "Active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "Units_pkey" PRIMARY KEY ("UnitId"),
    CONSTRAINT "fk_Units_Model" FOREIGN KEY ("ModelId") REFERENCES dbo."Model"("ModelId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Units_Status" FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Units_Location" FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Units_EmployeeUsers_CreatedBy" FOREIGN KEY ("CreatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_Units_EmployeeUsers_UpdatedBy" FOREIGN KEY ("UpdatedBy")
        REFERENCES dbo."EmployeeUsers" ("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS dbo."Units"
    OWNER to postgres;

CREATE UNIQUE INDEX IF NOT EXISTS "Units_ModelId_Active_idx"
    ON dbo."Units" USING btree
    ("ModelId" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "Units_RFID_Active_idx"
    ON dbo."Units" USING btree
    ("RFID" ASC NULLS LAST, "Active" ASC NULLS LAST)
    WITH (deduplicate_items=False)
    TABLESPACE pg_default
    WHERE "Active" = true;


CREATE TABLE IF NOT EXISTS dbo."UnitLogs" (
    "UnitLogId" BIGINT GENERATED ALWAYS AS IDENTITY (MINVALUE 1 INCREMENT BY 1),
    "UnitId" BIGINT NULL,
    "StatusId" BIGINT NULL,
    "PrevStatusId" BIGINT NULL,
    "LocationId" BIGINT NULL,
    "EmployeeUserId" BIGINT NULL,
    "Timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "UnitLogs_pkey" PRIMARY KEY ("UnitLogId"),
    CONSTRAINT "fk_UnitLogs_Unit" FOREIGN KEY ("UnitId") REFERENCES dbo."Units"("UnitId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_UnitLogs_Status" FOREIGN KEY ("StatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_UnitLogs_PrevStatus" FOREIGN KEY ("PrevStatusId") REFERENCES dbo."Status"("StatusId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_UnitLogs_Locations" FOREIGN KEY ("LocationId") REFERENCES dbo."Locations"("LocationId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk_UnitLogs_EmployeeUsers" FOREIGN KEY ("EmployeeUserId") REFERENCES dbo."EmployeeUsers"("EmployeeUserId") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS dbo."SystemConfig"
(
    "Key" character varying COLLATE pg_catalog."default" NOT NULL,
    "Value" character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("Key")
);


-- ...existing code...

CREATE OR REPLACE PROCEDURE dbo.usp_reset()
LANGUAGE plpgsql
AS $BODY$
BEGIN
    DELETE FROM dbo."EmployeeUserActivityLogs";
    DELETE FROM dbo."UnitLogs";
    DELETE FROM dbo."Scanner";
    DELETE FROM dbo."Locations";
    DELETE FROM dbo."Units";
    DELETE FROM dbo."File";
    DELETE FROM dbo."EmployeeUsers";
    DELETE FROM dbo."Roles";

    ALTER SEQUENCE dbo."EmployeeUserActivityLogs_EmployeeUserActivityLogId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."UnitLogs_UnitLogId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."Scanner_ScannerId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."Locations_LocationId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."Units_UnitId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."File_FileId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."EmployeeUsers_EmployeeUserId_seq" RESTART WITH 1;
    ALTER SEQUENCE dbo."Roles_RoleId_seq" RESTART WITH 1;

    INSERT INTO dbo."Roles" (
        "RoleCode",
        "Name", 
        "Active",
        "AccessPages"
    )
    VALUES (
        '000001',
        'Admin',
        true,
        '[
          {
            "page": "Dashboard",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Unit Tracker",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Unit Logs",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Reports and Statistics",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Employee Users",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Roles",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "CBU",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Location",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "Model",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "RFID Scanner",
            "view": true,
            "modify": true,
            "rights": []
          },
          {
            "page": "System Config",
            "view": true,
            "modify": true,
            "rights": []
          }
        ]'
    );

    INSERT INTO dbo."EmployeeUsers" (
        "EmployeeUserCode",
        "UserName",
        "Password", 
        "FirstName",
        "LastName",
        "Email",
        "ContactNo",
        "AccessGranted",
        "RoleId",
        "InvitationCode"
    )
    VALUES (
        '000001',
        'admin',
        '$2b$10$LqN3kzfgaYnP5PfDZFfT4edUFqh5Lu7amIxeDDDmu/KEqQFze.p8a',  
        'Admin',
        'Admin',
        'admin@gmail.com',
        '0000',
        true,
        1,
        0
    );
END;
$BODY$;
