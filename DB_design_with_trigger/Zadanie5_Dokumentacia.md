# Zadanie 5, DBS Dokumentácia, Viktor Bejtic

## Fyzický model

![Fyzický model](Physical_model.jpg)

## Zmeny oproti 4. zadaniu.

1. Odstránil som tabuľku exposition_history a spojil som ju spolu s expozition_info (v expozition info sa teraz nachádzajú nielen expozície, ktoré prebiehjú a ktoré sa pripravujú ale aj tie, ktoré už skončili)
2. Odstránil som tabuľku Maintenace 
3. Do tabuľky Specimens som pridal maintenance_duration čo je dĺžka údržby exempláru, beginning_at čo je čas zapožičania exempláru, end_at čo je koniec zapožičanie exempláru a owner som premenoval na institution.
4. Vytvoril som novú tabuľku specimens_history, kde je historía požičania exemplárov.

## Opis procesov

#### Naplánovanie expozície
Keď chceme naplánovať expozíciu tak na to použijeme funkciu ```insert_new_exposition```. Príklad naplánovanie expozície s ID 1 v zóne 1 s exemplárom s ID 1 v čase od 24.4.2024 9:00 do 30.4.2024 19:00: 
```sql
SELECT insert_new_exposition(1, 1, 1, 'in preparation', '2024-04-24 09:00:00', '2024-04-30 19:00:00');
```

Triggre sa postarajú o overenie či tú expozíciu v takom čase a s takým exemplárom môžem naplánovať. ```specimen_check``` overí či je exemplár dosptupný na danú expozíciu a ```zone_check``` overí či je zóna dostupná pre danú expozíciu.

Príklad chybového volania:
Exemplár s ID 4 je práve požičaný inej inštitúcii a vráti sa až 25.4.2024 o 12:00 a preto sním nemôžme naplánovať expozíciu, ktorá má začiatok 24.4.2024 o 9:00
```sql
SELECT insert_new_exposition(1, 1, 4, 'in preparation', '2024-04-24 09:00:00', '2024-04-30 19:00:00');
```

Ďalej keď máme expozíciu naplánovanú a chcem je čas na jej začiatok použijeme funkciu ```start_exposition```, ktorá nastaví expozícii status ```'in progress'```. Príklad začatia expozície, ktorú sme vytvorili:
```sql
SELECT start_exposition(1);
```
Trigger ```update_when_start``` sa postará o to, že sa updatne status všetkých exemplárov, ktoré sa nachádzajú v expozícii a nastaví im status ```'on display'``` a upraví čas kedy budú znova dostupné na čas kedy expozícia končí.

Po skončení expozície použijeme funkciu ```end_exposition```, ktorá nastaví expozícii status ```'ended'```. Príklad ukončenia expozície, ktorú sme vytvorili:
```sql
SELECT end_exposition(1);
```
Trigger ```update_when_end``` sa postará o to, že všetky exempláre, ktoré sa nachádzali v expozícii budú mať status, že sú znova dostupné.

#### Vkladanie nového exempláru
Pre vloženie nového exempláru použijeme funkciu ```insert_new_specimen```, ktorá nám vloží do tabuľky ```specimens``` nový exemplár podľa zadaných parametrov.
Pre vloženie exempláru s ID 26, menom Crown of Alexander The Great čo spadá pod kategóriu s ID 5, ktorého údržba trvá 15 hodín, je vlastnený múzeom a je hneď dostupný:
```sql
SELECT insert_new_specimen(26, 5, 'Crown of Alexander The Great', '15 hours', 'available', 'owned', NULL, NULL, NULL)
```
Trigger ```not_enough_info_check``` overí si je zadaných dostatok informácii (keď pridávame nový požičaný exemplár tak pozrie, čí sú tam info ako od kedy do kedy je požičaný a od akej inštitúcie). Trigger ```invalid_status_insert_check``` overí či je správny status pri vkladaní exempláru (nemožeme vložiť exemplár čo je na expozícii alebo ktorý sme už vrátili alebo, ktorý sme požicali). Trigger ```invalid_status_ownership_check``` kontroluje či je správne zadaná kombinácia statusu a ownershipu.

Príklad chybového volanie:
Pri vkladaní nového požičaného exempláru sme zabudli zadať do kedy ho máme požičaný.
```sql
SELECT insert_new_specimen(26, 5, 'Crown of Alexander The Great', '15 hours', 'away', 'borrowed from', 'Munich Museum', NOW(), NULL)
```

#### Presun exempláru do inej zóny
Pri presune exempláru použijeme funkciu ```move_zone```.
Príklad presunu exempláru s ID 9 v expozícii s 2 zo zóne 8 do zóny 7:
```sql
SELECT move_zone(9, 7);
```
Trigger ```zone_check``` overí či sa v tej zóne nenachádza žiadna iná expozícia alebo či tam nieje naplánovaná iná expozícia, ktorej sa časy konfliktujú s tou našou.

Príklad chybového volania:
V zóne 4 sa práve nachádza expozícia s ID 5, čiže nemôžme 
exemplár s ID 9 v expozícii s ID 2 premiestniť exemplár do zóny 2, kde sa nachádza iná expozícia.
```sql
SELECT move_zone(9, 2);
```

#### Prevzatie exempláru z inej inštitúcie
Pre zapožičanie exmpláru z inej inštitúcie za predpokladu, že sme ho už niekedy mali požičaný a máme o ňom záznam v tabuľke ```specimens``` (ak nie tak použijeme taký istý postup ako pri vkladaní nového exempláru) použijeme funkciu ```borrow_from_start```, ktorá nastaví stav exempláru na ```'away'```, ownership na ```'borrowed_from'``` a pomocou zadaných parametrov nastaví od kedy do kedy máme exemplár zapožičaný. Príklad pre požičanie, exempláru s ID 17 od 24.4.2024 08:00 do 28.4.2024 19:00: 
```sql
SELECT borrow_from_start(17, '2024-04-24 08:00:00', '2024-04-28 19:00:00');
```
Potom keď exemplár dorazí do múzea potrebujeme na ňom urobiť údržbu a na to použijeme funkciu ```start_maintenance```, ktorá nastaví stav ```'in maintenance'```. Príklad pre začatie exemplára čo sme si požičali:
```sql
SELECT start_maintenance(17);
```
Trigger ```calculate_when_available``` vypočíta podľa toho ako dlhotrvá údržba, že kedy bude exemplár dostupný a updatne stĺpec ```when_available``` s časom dostupnosti.

Keď údržba skončí použijeme funckiu ```end_maintenance``` na ukončenie údržby a nastavenie exempláru, že je znova dostupný. Príklad pre ukončenie údržby exempláru čo sme si požičali.

```sql
SELECT end_maintenance(17);
```
Trigger ```when_available_update``` vynuluje stĺpec ```when_available```.

Po skončení času požičania použijeme funkciu ```borrow_from_end```, ktorá nastaví exempláru stav ```'returned'``` čo indikuje, že exemplár bol vrátený pôvodnej inštitúcii. Príklad vrátenia exempláru čo sme si požičalí:
```sql
SELECT borrow_from_end(17);
```
Trigger ```insert_to_history``` automaticky uloží udaje do tabuľky ```specimen_history``` s údajmi, ktoré sú pri danom exempláru (id speciminu, ownership či exemplár bol požičaný od inej institúcie alebo inej inštitúcii, od kedy, do kedy) a potom ten exemplár updatne v tabuľke ```specimens``` a vynuluje sa mu ```when_available```,```beginning_at```,```end_at```.


#### Zapožičanie exempláru inej inštitúcii
Pre zapožičanie exempláru inej inštitúcii použijeme funkciu ```borrow_to_start```, ktorá nastaví stav exempláru na ```'away'```, ownership na ```'borrowed_to'``` a pomocou zadaných parametrov nastaví inštitúciu, ktorej bol exemplár požičaný a od kedy do kedy je exemplár zapožičaný. Príklad pre požičanie exempláru s ID 16 inštitúcii menom Smithsonian National Museum od teraz po dobu 10 dní:
```sql
SELECT borrow_to_start(16, 'Smithsonian National Museum' , NOW(), NOW() + '10 days');
```
Trigger ```borrow_to_availability``` overí či je exemplár dostupný na požičanie. A trigger ```calculate_when_available``` vypočíta podľa dĺžky údržby a času skončenia požičania, že kedy bude exemplár dostupný a updatne stĺpec ```when_available``` s časom dostupnosti.

Príklad chybového volanie:
Exemplár s ID 8 je práve na expozícii a preto nemôže byť požičaný.
```sql
SELECT borrow_to_start(8, 'Smithsonian National Museum' , NOW(), NOW() + '10 days');
```
Po skončení času požičania použijeme funkciu ```borrow_to_end```, ktorá nastaví stav ```'in maintenance'``` čo indikuje, že exemplár bol vrátený z inštitúcie, ktorej bol zapožičaný. Príklad prijatia exempláru čo sme požičalí:
```sql
SELECT borrow_to_end(16);
```
Trigger ```insert_to_history``` automaticky uloží udaje do tabuľky ```specimen_history``` s údajmi, ktoré sú pri danom exempláru (id speciminu, ownership či exemplár bol požičaný od inej institúcie alebo inej inštitúcii, od kedy, do kedy) a potom ten exemplár updatne v tabuľke ```specimens```, nastaví sa ```ownership``` na ```'owned'``` a vynuluje sa mu ```institution```,```beginning_at```,```end_at```.

Keď údržba skončí použijeme funckiu ```end_maintenance``` na ukončenie údržby a nastavenie exempláru, že je znova dostupný. Príklad pre ukončenie údržby exempláru čo sme si požičali.

```sql
SELECT end_maintenance(16);
```



