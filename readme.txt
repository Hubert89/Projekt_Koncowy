Projekt końcowy – Sklep internetowy (AGH)

Autor: Hubert Seweryn

1) Wymagania środowiskowe
   • Java 17+
   • Maven 3.8+
   • Node.js 18+ (npm 9+)
   • PostgreSQL 15+
   • Przeglądarka Chrome/Firefox/Edge

2) Konfiguracja bazy danych
   • Baza:       Projekt_Koncowy
   • Host/port:  localhost:5432
   • Użytkownik: postgres
   • Hasło:      HasloDoProjektu321!
   • Inicjalizacja: uruchom skrypt z katalogu /database/schema.sql
     (opcjonalnie /database/data.sql z danymi startowymi)

3) Konfiguracja backendu (Spring Boot)
   • Plik: /src/main/resources/application.properties ma już ustawione:
       spring.datasource.url=jdbc:postgresql://localhost:5432/Projekt_Koncowy
       spring.datasource.username=postgres
       spring.datasource.password=HasloDoProjektu321!
   • Uruchom:  mvn spring-boot:run
   • Adres:    http://localhost:8080

4) Konfiguracja frontendu (React + Vite + TS)
   • Przejdź do katalogu /frontend
   • Zainstaluj zależności:  npm install
   • Ustaw URL backendu (opcjonalnie w .env):
       VITE_API_URL=http://localhost:8080
   • Uruchom dev server:     npm run dev
   • Frontend:               http://localhost:5173

5) Konta testowe i role
   • Klient (ROLE_KLIENT):     client / client123
   • Pracownik (ROLE_PRACOWNIK): staff / staff123
   • ADMINISTRATOR (ROLE_ADMINISTRATOR): admin / admin123

6) Funkcjonalności
   • Klient: logowanie, koszyk, składanie zamówienia, podgląd historii.
   • Pracownik: lista zamówień, miękkie usuwanie (soft delete), zmiana statusów.
   • Administrator (jeśli dod: zarządzanie produktami (CRUD).

7) Struktura paczki do oceny (wg wytycznych)
   Backend/src         – kod źródłowy backendu (Java, Spring Boot)
   Frontend/src        – kod frontendu (React + Vite)
   /database           – schema.sql, Schemat_bazy_danych.png
   /docs               – instrukcja użytkownika + dokumentacja techniczna (PDF)
   readme.txt          – ten plik

8) Uruchomienie krok po kroku
   1. Upewnij się, że działa PostgreSQL i istnieje baza Projekt_Koncowy.
   2. Uruchom /database/schema.sql w psql lub z IDE (Database → Run).
   3. Backend: w katalogu backend: mvn spring-boot:run.
   4. Frontend: w katalogu frontend: npm install && npm run dev.
   5. Zaloguj się danymi testowymi (client/client123 lub staff/staff123 lub admin/admin123).

9) Kontakt
   W razie problemów: sprawdź logi aplikacji (konsola), połączenie DB oraz CORS/URL API w .env.
