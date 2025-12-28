-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: srv1592.hstgr.io    Database: u728977135_aegisdb
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` varchar(36) NOT NULL,
  `companyId` varchar(255) NOT NULL,
  `keyName` varchar(255) NOT NULL,
  `apiKey` varchar(255) NOT NULL,
  `apiSecret` varchar(255) DEFAULT NULL,
  `scopes` text NOT NULL,
  `rateLimit` int(11) NOT NULL DEFAULT 1000,
  `lastUsedAt` timestamp NULL DEFAULT NULL,
  `requestsThisMonth` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdById` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c7aff6a05a446eb70579dda84e` (`apiKey`),
  KEY `FK_40fbec27ca4b3ac70b1bbf23016` (`companyId`),
  KEY `FK_bdf7b6da2e124011d405f5ce831` (`createdById`),
  CONSTRAINT `FK_40fbec27ca4b3ac70b1bbf23016` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_bdf7b6da2e124011d405f5ce831` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;
