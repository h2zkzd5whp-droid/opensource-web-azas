# Users Table

| Column | Type | Description |
| --- | --- | --- |
| userId | INTEGER, PK, AUTO_INCREMENT | Unique user ID |
| email | VARCHAR(255), UNIQUE, NOT NULL | Email (login ID) |
| password | VARCHAR(255), NOT NULL | Password (bcrypt hash) |
| nickname | VARCHAR(50), NOT NULL | Nickname |
| theme | VARCHAR(10), DEFAULT 'light' | Theme (dark / light) |
| fontSize | INTEGER, DEFAULT 14 | Font size (12–24) |
| createdAt | DATETIME, NOT NULL | Created at |
| updatedAt | DATETIME, NOT NULL | Updated at |

---

# Codes Table

| Column | Type | Description |
| --- | --- | --- |
| codeId | INTEGER, PK, AUTO_INCREMENT | Unique code ID |
| userId | INTEGER, FK → Users(userId), NOT NULL | Owner (user reference) |
| title | VARCHAR(255), DEFAULT 'Untitled' | Code title |
| language | VARCHAR(20), NOT NULL | Language |
| source | TEXT, NOT NULL | Source code body |
| createdAt | DATETIME, NOT NULL | Created at |
| updatedAt | DATETIME, NOT NULL | Updated at |

---

# Relationship

Users 1 : N Codes (one user owns multiple codes)

---

