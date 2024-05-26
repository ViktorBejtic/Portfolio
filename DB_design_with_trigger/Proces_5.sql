-- Trigger funkcia 'borrow_to_availability' kontroluje dostupnosť exemplárov pre požičanie.
CREATE OR REPLACE FUNCTION borrow_to_availability() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či exemplár nie je k dispozícii alebo nie je vlastnený inou inštitúciou.
    IF OLD.ownership = 'owned' AND NEW.ownership = 'borrowed to' AND (OLD.status != 'available' OR OLD.ownership != 'owned') THEN
        -- Ak nie je k dispozícii alebo nie je vlastnený múzeom, vyvolá výnimku.
        RAISE EXCEPTION 'Specimen is not available.';
    
    -- Kontroluje, či má konfliktujúci čas s plánovanou expozíciou.
    ELSIF NEW.id in (
            SELECT specimen_id FROM Exposition_info 
            WHERE status = 'in preparation' AND start_at < NEW.end_at
        ) THEN
        -- Ak exemplár je v príprave na expozíciu a má časový konflikt s plánovanou expozíciou, vyvolá výnimku.
        RAISE EXCEPTION 'Specimen is not available.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'borrow_to_availability_trigger' sa spustí pred aktualizáciou záznamov v tabuľke 'Specimens' a vykoná funkciu 'borrow_to_availability'.
CREATE OR REPLACE TRIGGER borrow_to_availability_trigger
BEFORE UPDATE ON Specimens
FOR EACH ROW
EXECUTE FUNCTION borrow_to_availability();

-----------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'borrow_to_start' označuje exemplár s daným identifikátorom ako požičanú inštitúciou.
CREATE OR REPLACE FUNCTION borrow_to_start(p_id INT, p_institution VARCHAR, p_beginning_at TIMESTAMP WITH TIME ZONE, p_end_at TIMESTAMP WITH TIME ZONE) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje záznam v tabuľke 'Specimens', nastavujúc stav na 'away', vlastníctvo na 'borrowed to', informácie o inštitúcii a dátum začiatku a konca požičania.
    UPDATE Specimens
    SET status = 'away', ownership = 'borrowed to', institution = p_institution, beginning_at = p_beginning_at, end_at = p_end_at
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'borrow_to_end' označuje exemplár s daným identifikátorom ako vrátenú požičiavajúcou inštitúciou a prechádza ju do stavu údržby.
CREATE OR REPLACE FUNCTION borrow_to_end(p_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje záznam v tabuľke 'Specimens', nastavujúc stav na 'in maintenance', čím sa označuje, že exemplár bol vrátený požičiavajúcou inštitúciou a prechádza do stavu údržby.
    UPDATE Specimens
    SET status = 'in maintenance'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

