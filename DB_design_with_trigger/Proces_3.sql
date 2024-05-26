
-- Trigger funkcia 'zone_check' zabezpečuje kontrolu dostupnosti zón pri aktualizácii expozícií.
CREATE OR REPLACE FUNCTION zone_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či má zóna konfliktujúce expozície v priebehu.
    IF NEW.status = 'in progress' AND 
        NEW.zone_id IN (
            SELECT zone_id 
            FROM exposition_info 
            WHERE zone_id = NEW.zone_id 
                AND exposition_id != NEW.exposition_id 
                AND status = 'in progress'
        ) THEN
        -- Ak áno, vyvolá výnimku.
        RAISE EXCEPTION 'Zone is not available. Not updated.';
    
    -- Kontroluje, či má zóna konfliktujúce expozície v príprave.
    ELSIF NEW.status = 'in progress' AND 
            NEW.zone_id IN (
                SELECT zone_id 
                FROM exposition_info 
                WHERE zone_id = NEW.zone_id 
                    AND exposition_id != NEW.exposition_id 
                    AND status = 'in preparation' 
                    AND start_at < NEW.end_at
            ) THEN
        -- Ak áno, vyvolá výnimku.
        RAISE EXCEPTION 'Zone is not available. Not updated.';
    
    -- Kontroluje, či má zóna konfliktujúce expozície v priebehu alebo v príprave s plánovanou expozíciu.
    ELSIF NEW.status = 'in preparation' AND 
            NEW.zone_id IN (
                SELECT zone_id 
                FROM exposition_info 
                WHERE zone_id = NEW.zone_id 
                    AND status != 'ended' 
                    AND exposition_id != NEW.exposition_id 
                    AND (NEW.start_at < end_at OR NEW.end_at > start_at)
            ) THEN
        -- Ak áno, vyvolá výnimku.
        RAISE EXCEPTION 'Zone is not available. Not updated.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'zone_check_trigger' sa spustí pred aktualizáciou alebo vložením nového záznamu do tabuľky 'exposition_info' a vykoná funkciu 'zone_check'.
CREATE OR REPLACE TRIGGER zone_check_trigger
BEFORE UPDATE OR INSERT ON exposition_info
FOR EACH ROW
EXECUTE FUNCTION zone_check();


--------------------------------------------------------------------------------------------------------------------------------------

-- Trigger funkcia 'invalid_status_exposition_check' kontroluje platnosť zmeny stavov expozícií pri aktualizácii.
CREATE OR REPLACE FUNCTION invalid_status_exposition_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje rôzne kombinácie starého a nového stavu expozícií.
    IF (OLD.status = 'ended' AND NEW.status != 'ended') OR
        (OLD.status = 'in progress' AND NEW.status != 'ended') OR
        (OLD.status = 'in preparation' AND NEW.status != 'in progress')
    THEN
        -- Ak nie je zmena stav expozície platná, vyvolá výnimku.
        RAISE EXCEPTION 'Invalid status. Table not updated.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'invalid_status_exposition_trigger' sa spustí pred vložením nového záznamu do tabuľky 'exposition_indo' a vykoná funkciu 'invalid_status_exposition_check'.
CREATE OR REPLACE TRIGGER invalid_status_exposition_trigger
BEFORE INSERT ON exposition_info
FOR EACH ROW
EXECUTE FUNCTION invalid_status_exposition_check();

-------------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'move_zone' presúva exemplár s daným identifikátorom do inej zóny.
CREATE OR REPLACE FUNCTION move_zone(p_id INT, p_zone_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje záznam v tabuľke 'exposition_info', nastavujúc nový identifikátor zóny pre exemplár, ak je jeho stav 'in progress'.
    UPDATE exposition_info
    SET zone_id = p_zone_id
    WHERE specimen_id = p_id AND status = 'in progress';
END;
$$ LANGUAGE plpgsql;



