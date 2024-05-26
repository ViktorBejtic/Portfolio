
-- Trigger funkcia 'specimen_check' zabezpečuje, že vkladané záznamy do tabuľky 'exposition_info' sú v súlade s pravidlami dostupnosti exemplárov.
CREATE OR REPLACE FUNCTION specimen_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontrola či nový záznam konfliktuje s existujúcimi expozíciami teho istého exempláru.
    IF NEW.specimen_id IN (
            SELECT specimen_id 
            FROM exposition_info 
            WHERE specimen_id = NEW.specimen_id 
                AND status != 'ended' 
                AND (NEW.start_at < end_at OR NEW.end_at > start_at)
        ) THEN
        -- Ak áno, vyhodí výnimku.
        RAISE EXCEPTION 'Specimen is not available.';
    
    -- Kontrola či nový záznam konfliktuje s existujúcimi stavmi exemplárov v tabuľke 'specimens'.
    ELSIF NEW.specimen_id IN (
            SELECT id 
            FROM specimens
            WHERE id = NEW.specimen_id 
                AND NEW.status != 'ended' 
                AND (when_available > NEW.start_at AND ownership = 'borrowed to') 
                OR (NEW.end_at > end_at AND ownership = 'borrowed from')
        ) THEN
        -- Ak áno, vyhodí výnimku.
        RAISE EXCEPTION 'Specimen is not available.';
    
    -- Kontrola či exemplár už nebol vrátený.
    ELSIF NEW.specimen_id IN (
            SELECT id 
            FROM specimens
            WHERE id = NEW.specimen_id 
                AND NEW.status != 'ended' 
                AND status = 'returned'
        ) THEN
        -- Ak áno, vyhodí výnimku.
        RAISE EXCEPTION 'Specimen is not available';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'specimen_check_trigger' spúšťa funkciu 'specimen_check' pred vložením nového záznamu do tabuľky 'exposition_info'.
CREATE OR REPLACE TRIGGER specimen_check_trigger
BEFORE INSERT ON exposition_info
FOR EACH ROW
EXECUTE FUNCTION specimen_check();


------------------------------------------------------------------------------------------------------------------------------------

-- Táto trigger funkcia je navrhnutá na aktualizáciu informácií o exemplári, keď sa začne nová expozícia.
CREATE OR REPLACE FUNCTION update_when_start() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či nový stav expozície je 'in progress'.
    IF NEW.status = 'in progress' THEN
        -- Ak áno, aktualizuje stav exempláru na 'on display' a nastaví čas, kedy bude znovu dostupný na koniec expozície.
        UPDATE specimens
        SET status = 'on display', when_available = NEW.end_at
        WHERE id = NEW.specimen_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tento trigger sa spustí pred aktualizáciou alebo vložením nového záznamu do tabuľky exposition_info.
CREATE OR REPLACE TRIGGER update_when_start_trigger
BEFORE UPDATE OR INSERT ON exposition_info
FOR EACH ROW
EXECUTE FUNCTION update_when_start();



------------------------------------------------------------------------------------------------------------------------------------

-- Trigger funkcia 'update_when_end' aktualizuje informácií o exemplári po ukončení expozície.
CREATE OR REPLACE FUNCTION update_when_end() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje, či nový stav expozície je 'ended' a zároveň predchádzajúci stav bol 'in progress'.
    IF NEW.status = 'ended' AND OLD.status = 'in progress' THEN
        -- Ak áno, aktualizuje stav exempláru na 'available' a vynuluje čas, kedy bude opäť dostupná.
        UPDATE specimens
        SET status = 'available', when_available = NULL
        WHERE id = NEW.specimen_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 'update_when_end_trigger' spúšťa funkciu 'update_when_end' pred aktualizáciou každého záznamu v tabuľke 'exposition_info'.
CREATE OR REPLACE TRIGGER update_when_end_trigger
BEFORE UPDATE ON exposition_info
FOR EACH ROW
EXECUTE FUNCTION update_when_end();


------------------------------------------------------------------------------------------------------------------------------------

-- Trigger funkcia 'invalid_status_check' kontroluje platnosť zmeny stavov exemplárov pri aktualizácii záznamov.
CREATE OR REPLACE FUNCTION invalid_status_check() RETURNS TRIGGER AS $$
BEGIN
    -- Kontroluje rôzne kombinácie nového a starého stavu.
    IF (OLD.status = 'returned' AND (NEW.status = 'on display' OR NEW.status = 'available')) OR
        (OLD.status = 'on display' AND NEW.status != 'available') OR
        (OLD.status = 'in maintenance' AND NEW.status != 'available') OR
        (OLD.status = 'away' AND NEW.status != 'in maintenance')
    THEN
        -- Ak nie je zmena stavu platná, vyvolá výnimku.
        RAISE EXCEPTION 'Invalid status. Entry not inserted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger 'invalid_status_insert_trigger' spúšťa funkciu 'invalid_status_check' pred vložením nového záznamu do tabuľky 'Specimens'.

CREATE OR REPLACE TRIGGER invalid_status_insert_trigger
BEFORE INSERT ON Specimens
FOR EACH ROW
EXECUTE FUNCTION invalid_status_check();

------------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'insert_new_exposition' vkladá nové záznamy o expozíciách do tabuľky 'Exposition_info'.
CREATE OR REPLACE FUNCTION insert_new_exposition(p_exposition_id INT, p_zone_id INT, p_specimen_id INT, p_status expositions_status, 
                                                p_start_at TIMESTAMP WITH TIME ZONE, p_end_at TIMESTAMP WITH TIME ZONE) RETURNS VOID AS $$
BEGIN
    -- Vkladá nový záznam o expozícii do tabuľky 'Exposition_info' s parametrami zadanými ako vstupné argumenty.
    INSERT INTO Exposition_info (exposition_id, zone_id, specimen_id, status, start_at, end_at)
    VALUES  (p_exposition_id, p_zone_id, p_specimen_id, p_status, p_start_at, p_end_at);
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'start_exposition' začína expozíciu s daným identifikátorom.
CREATE OR REPLACE FUNCTION start_exposition(p_exposition_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje stav expozície na 'in progress', ak je jej aktuálny stav 'in preparation'.
    UPDATE exposition_info
    SET status = 'in progress'
    WHERE exposition_id = p_exposition_id AND status = 'in preparation';
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------------------------------------------------------------------------------

-- Funkcia 'end_exposition' ukončuje expozíciu s daným identifikátorom.
CREATE OR REPLACE FUNCTION end_exposition(p_exposition_id INT) RETURNS VOID AS $$
BEGIN
    -- Aktualizuje stav expozície na 'ended', ak je jej aktuálny stav 'in progress'.
    UPDATE exposition_info
    SET status = 'ended'
    WHERE exposition_id = p_exposition_id AND status = 'in progress';
END;
$$ LANGUAGE plpgsql;


