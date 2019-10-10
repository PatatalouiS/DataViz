

USE dataset;

CREATE VIEW IF NOT EXISTS countriespollution
AS (SELECT * 
    FROM Pollution 
    NATURAL JOIN Countries );



