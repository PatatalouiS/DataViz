

USE dataset;

DROP VIEW IF EXISTS GlobalCountriesPollution;

CREATE VIEW IF NOT EXISTS GlobalCountriesPollution
AS (SELECT idC, continent, name, year, value 
    FROM Pollution 
    NATURAL JOIN Countries );

DROP VIEW IF EXISTS PerCapitaCountriesPollution;

CREATE VIEW IF NOT EXISTS PerCapitaCountriesPollution
AS (SELECT idC, continent, name, year, valuePerCapita
    FROM Pollution
    NATURAL JOIN Countries );



