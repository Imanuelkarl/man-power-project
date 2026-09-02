-- Convert legacy numeric user bindings to the manufacturer's public manId.
UPDATE "User" AS u
SET "manufacturerId" = m."manId"
FROM "Manufacturer" AS m
WHERE u."manufacturerId" = m."id"::text;
