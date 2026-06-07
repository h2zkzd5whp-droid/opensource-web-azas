CREATE DATABASE IF NOT EXISTS code_editor;
CREATE USER IF NOT EXISTS 'codeuser'@'localhost' IDENTIFIED BY 'codepass123';
GRANT ALL PRIVILEGES ON code_editor.* TO 'codeuser'@'localhost';
FLUSH PRIVILEGES;

USE code_editor;

CREATE TABLE IF NOT EXISTS Users (
  userId      INTEGER PRIMARY KEY AUTO_INCREMENT,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  nickname    VARCHAR(50) NOT NULL,
  theme       VARCHAR(10) DEFAULT 'light',
  fontSize    INTEGER DEFAULT 14,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Codes (
  codeId      INTEGER PRIMARY KEY AUTO_INCREMENT,
  userId      INTEGER NOT NULL,
  title       VARCHAR(255) DEFAULT 'Untitled',
  language    VARCHAR(20) NOT NULL,
  source      TEXT NOT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS TeamMembers (
  memberId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  imgKey VARCHAR(255),
  githubUrl VARCHAR(255)

);

INSERT INTO TeamMembers (name, role, email, imgKey,githubUrl) VALUES
('KimHyeonSik', 'Backend Developerr', 'gudtlr3308@naver.com', 'hsk.png','https://github.com/suda5936'),
('NamYooSeong', 'Backend Developer', 'smeteor0213@chungbuk.ac.kr', 'ysn.png','https://github.com/h2zkzd5whp-droid'),
('JeonSeongHyun', 'Frontend Developer', 'jsh147301@naver.com', 'shj.png','https://github.com/whiteblack1858'),
('Khulan Gurdor', 'Frontend Developer', 'khulnnmr@gmail.com', 'khu.png','https://github.com/gen426');