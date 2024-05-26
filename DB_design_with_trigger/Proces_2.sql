-- Trigger funkcia 'not_enough_info_check' kontroluje dostatočnosť informácií pri vkladaní alebo aktualizácii exemplárov.
CREATE OR REPLACE FUNCTION not_enough_info_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či sú zadané dostatočné informácie.
    IF (NEW.ownership != 'owned' AND (NEW.institution IS NULL OR NEW.beginning_at IS NULL OR NEW.end_at IS NULL)) 
    THEN
        -- Ak nie sú zadané dostatočné informácie vyvolá výnimku.
        RAISE EXCEPTION 'Not enough information provided. Entry not inserted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'not_enough_info_trigger' sa spustí pred vložením alebo aktualizáciou záznamov v tabuľke 'Specimens' a vykoná funkciu 'not_enough_info_check'.
CREATE OR REPLACE TRIGGER not_enough_info_trigger
BEFORE INSERT ON Specimens
FOR EACH ROW
EXECUTE FUNCTION not_enough_info_check();


---------------------------------------------------------------------------------------------------------------------------------

-- Trigger funkcia 'invalid_status_insert_check' kontroluje platnosť stavov pri vkladaní nových záznamov.
CREATE OR REPLACE FUNCTION invalid_status_insert_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či nový stav je 'returned' alebo 'on display'.
    IF NEW.status = 'returned' OR NEW.status = 'on display' OR NEW.ownership = 'borrowed to' THEN
        -- Ak áno, vyvolá výnimku.
        RAISE EXCEPTION 'Invalid status. Entry not inserted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'invalid_status_insert_trigger' sa spustí pred vložením nového záznamu do tabuľky 'Specimens' a vykoná funkciu 'invalid_status_insert_check'.
CREATE OR REPLACE TRIGGER invalid_status_insert_trigger
BEFORE INSERT ON Specimens
FOR EACH ROW
EXECUTE FUNCTION invalid_status_insert_check();

---------------------------------------------------------------------------------------------------------------------------------

-- Trigger funkcia 'invalid_status_ownership_check' kontroluje platnosť kombinácií stavov a vlastníctva pri vkladaní alebo aktualizácii exemplárov.
CREATE OR REPLACE FUNCTION invalid_status_ownership_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje rôzne kombinácie stavov a vlastníctva exemplárov.
    IF (NEW.ownership = 'owned' AND (NEW.institution IS NOT NULL OR NEW.beginning_at IS NOT NULL OR NEW.end_at IS NOT NULL)) OR
        -- Napríklad, že vrátený exemplár musí byť označená ako 'borrowed from'.
        (NEW.status = 'returned' AND NEW.ownership != 'borrowed from') OR
        -- Napríklad, že exemplár čo je preč nemôže mať vlastnítvo 'owned'.
        (NEW.status = 'away' AND NEW.ownership = 'owned')
    THEN
        -- Ak nie sú kombinácie stavov a vlastníctva platné, vyvolá výnimku.
        RAISE EXCEPTION 'Invalid status. Entry not inserted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'invalid_status_ownership_trigger' sa spustí pred vložením alebo aktualizáciou záznamov v tabuľke 'Specimens' a vykoná funkciu 'invalid_status_ownership_check'.
CREATE OR REPLACE TRIGGER invalid_status_ownership_trigger
BEFORE INSERT OR UPDATE ON Specimens
FOR EACH ROW
EXECUTE FUNCTION invalid_status_ownership_check();


---------------------------------------------------------------------------------------------------------------------------------


-- Trigger funkcia 'calculate_when_available' vypočíta dátum, kedy bude exemplár opäť k dispozícii.
CREATE OR REPLACE FUNCTION calculate_when_available() RETURNS TRIGGER AS $$
BEGIN
    -- Ak je exemplár požičaný inej inštitúcii, vypočíta sa dátum dostupnosti na základe dátumu návratu a doby údržby.
    IF NEW.status = 'away' AND NEW.ownership = 'borrowed to' THEN
        NEW.when_available := NEW.end_at + NEW.maintenance_duration;
    
    -- Ak je exemplár požičaný od inej inštitúcii, vypočíta sa dátum dostupnosti na základe dátumu požičania a doby údržby.
    ELSIF NEW.status = 'away' AND NEW.ownership = 'borrowed from' THEN
        NEW.when_available := NEW.beginning_at + NEW.maintenance_duration;
    
    -- Ak je exemplár v údržbe, vypočíta sa dátum dostupnosti na základe súčasného dátumu a doby údržby.
    ELSIF NEW.status = 'in maintenance' THEN
        NEW.when_available := NOW() + NEW.maintenance_duration;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'calculate_when_available_trigger' sa spustí pred vložením alebo aktualizáciou záznamov v tabuľke 'Specimens' a vykoná funkciu 'calculate_when_available'.
CREATE OR REPLACE TRIGGER calculate_when_available_trigger
BEFORE INSERT OR UPDATE ON Specimens
FOR EACH ROW
EXECUTE FUNCTION calculate_when_available();


---------------------------------------------------------------------------------------------------------------------------------
-- Trigger funkcia 'when_available_update' aktualizuje dátum dostupnosti exemplárov na NULL, ak sa ich stav zmení na 'available'.
CREATE OR REPLACE FUNCTION when_available_update() RETURNS TRIGGER AS $$
BEGIN
    -- Ak sa stav exempláru zmení na 'available' a predtým nebol 'available', aktualizuje sa dátum dostupnosti na NULL.
    IF NEW.status = 'available' AND OLD.status != 'available' THEN
        UPDATE specimens
        SET when_available = NULL
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'when_available_update_trigger' sa spustí po vložení alebo aktualizácii záznamov v tabuľke 'Specimens' a vykoná funkciu 'when_available_update'.
CREATE OR REPLACE TRIGGER when_available_update_trigger
AFTER UPDATE OR INSERT ON Specimens
FOR EACH ROW
EXECUTE FUNCTION when_available_update();

---------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'insert_new_specimen' vkladá nové exempláre do tabuľky 'Specimens'.
CREATE OR REPLACE FUNCTION insert_new_specimen(p_id INT, p_category_id INT, p_name VARCHAR, p_maintenance_duration INTERVAL, p_status specimens_status,
                                            p_ownership specimens_ownership, p_institution VARCHAR, p_beginning_at TIMESTAMP WITH TIME ZONE, p_end_at TIMESTAMP WITH TIME ZONE) RETURNS VOID AS $$
BEGIN
    -- Vkladá nový záznam o vzorke do tabuľky 'Specimens' s parametrami zadanými ako vstupné argumenty.
    INSERT INTO Specimens(id, category_id, name, maintenance_duration, status, ownership, institution, when_available, beginning_at, end_at) 
    VALUES (p_id, p_category_id, p_name, p_maintenance_duration, p_status, p_ownership, p_institution, NULL, p_beginning_at, p_end_at);
END;
$$ LANGUAGE plpgsql;







