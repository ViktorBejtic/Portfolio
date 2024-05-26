-- Trigger funkcia 'insert_to_history' spravuje vkladanie záznamov o exemplároch do histórie po ich aktualizácii.

CREATE OR REPLACE FUNCTION insert_to_history() RETURNS TRIGGER AS $$
BEGIN
    -- Ak sa exemplár vrátil k povôdnému majiteľovi, vloží sa nový záznam do histórie a aktualizujú sa údaje o exemplári.
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        INSERT INTO Specimen_history (specimen_id, ownership, institution, beginning_at, ended_at)
        VALUES (NEW.id, NEW.ownership, NEW.institution, NEW.beginning_at, NEW.end_at);

        UPDATE Specimens
        SET when_available = NULL, end_at = NULL, beginning_at = NULL
        WHERE id = NEW.id;

    -- Ak sa exemplár vrátil od inštitúcie, ktorá ho mala požičaný, vloží sa nový záznam do histórie a aktualizujú sa údaje o exemplári.
    ELSIF NEW.status = 'in maintenance' AND NEW.ownership = 'borrowed to' THEN
        INSERT INTO Specimen_history (specimen_id, ownership, institution, beginning_at, ended_at)
        VALUES (NEW.id, NEW.ownership, NEW.institution, NEW.beginning_at, NEW.end_at);

        UPDATE Specimens
        SET ownership = 'owned', institution = NULL, beginning_at = NULL, end_at = NULL
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'insert_to_history_trigger' sa spustí po aktualizácii záznamov v tabuľke 'Specimens' a vykoná funkciu 'insert_to_history'.
CREATE OR REPLACE TRIGGER insert_to_history_trigger
AFTER UPDATE ON Specimens
FOR EACH ROW
EXECUTE FUNCTION insert_to_history(); 

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'borrow_from_start' označuje exemplár s daným identifikátorom ako požičanú od daného dátumu do určeného dátumu.
CREATE OR REPLACE FUNCTION borrow_from_start(p_id INT, p_beginning_at TIMESTAMP WITH TIME ZONE, p_end_at TIMESTAMP WITH TIME ZONE) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje záznam v tabuľke 'Specimens', nastavujúc stav exempláru na 'away' a začiatočný a koncový dátum požičania, ak je stav 'returned'.
    UPDATE Specimens
    SET status = 'away', beginning_at = p_beginning_at, end_at = p_end_at
    WHERE id = p_id AND status = 'returned';
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'borrow_from_end' označuje exemplár s daným identifikátorom ako vrátenú.
CREATE OR REPLACE FUNCTION borrow_from_end(p_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje záznam v tabuľke 'Specimens', nastavujúc stav na 'returned', čím sa označuje, že exemplár bol vrátený.
    UPDATE Specimens
    SET status = 'returned'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'end_maintenance' ukončuje údržbu exempláru s daným identifikátorom.
CREATE OR REPLACE FUNCTION end_maintenance(p_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje stav vzorky na 'available', čím oznamuje, že údržba bola ukončená.
    UPDATE Specimens
    SET status = 'available'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'start_maintenance' začína údržbu exempláru s daným identifikátorom.
CREATE OR REPLACE FUNCTION start_maintenance(p_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje stav vzorky na 'in maintenance', čím oznamuje, že začala údržba.
    UPDATE Specimens
    SET status = 'in maintenance'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

