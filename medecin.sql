-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 27 avr. 2026 à 14:10
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `medecin`
--

-- --------------------------------------------------------

--
-- Structure de la table `authentification`
--

DROP TABLE IF EXISTS `authentification`;
CREATE TABLE IF NOT EXISTS `authentification` (
  `token` varchar(191) NOT NULL,
  `idPatient` int NOT NULL,
  `ipAppareil` varchar(45) NOT NULL,
  PRIMARY KEY (`token`),
  KEY `fk_auth_patient` (`idPatient`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `authentification`
--

INSERT INTO `authentification` (`token`, `idPatient`, `ipAppareil`) VALUES
('gvIjWRy4GBf8r69MrDNHDMtAhwbZlLQkLBOjZ863gPj6I5MNqPTgldqSVPf5lJLp', 1, '127.0.0.1'),
('p47u5FLKR9gco9JJk8m1h9tgUF6PsWtkbR19BjO2iBB3rJ4zGrA2coppsVmXlbOk', 1, '127.0.0.1'),
('Xekjg2WDDg2uFCi0uhARI1azGlx0PaozQL8Ph5JWGQ3hRsX5HmLBLuFeDj7Uw6R6', 1, '127.0.0.1'),
('V7LUjTYuLfkMxO9BQxrGCOUWW50bUSSAfFyU1MuM2oCuUjGexjJqqaNHmUfZlRTI', 2, '127.0.0.1'),
('dmSU0y7HBLr1VCgYJieZP3MI41hs6rRw8NqATXx1l0LO1ct1jWyhouo6R0c3SdSd', 2, '127.0.0.1'),
('WcJSrP5NuNFx3Tt3uSxxEboAqbpBw1oWQiGlWqHeHz7RIw4MuTjnePAF8nAAYXpH', 3, '127.0.0.1'),
('P6Tu9AUgVRm95A1ZT2hYTPPxaquGIp3QpkLA9T4j3Hujs0iQsKtEBpukDB7MKDNE', 3, '127.0.0.1'),
('aHOqKBNvf1V5FDSGwG5k4ByF483pjqS4FenoBvvgtws7Swwcr4jubbywWjscfITP', 3, '127.0.0.1'),
('4HiMPnqGw0kikQXBq98FCe97nLNuEVDxUNH9AW1hyjBUHFpQBHClaLONGd88CJ1A', 3, '127.0.0.1'),
('xmQi22E3d64E61C0A6tZN8G07tFPUrKW75MPPZJmsUlqHogA2gE7JoY4PTU19Jgp', 3, '127.0.0.1'),
('xnagr8VfE03vBwCQzOCmYQHoZuET5MsCplxLjZLVf95Sv324V8XryJHmVUVPgfas', 3, '127.0.0.1'),
('ZdCanRsOuUbo936xGf8zZSD9LugR669TZp9slozY4mFj7MJ4hQcZ2ZXSP5MtgmHy', 3, '127.0.0.1'),
('xYmGHEfnL9slsl0VD5K9cJjaWrQRJSCfCgcRDBLyEJyw5OaKKvWkNYLroyJ6hLE0', 3, '127.0.0.1'),
('3KIfJNd0NUeFhbDO3c0VkNryb8uoYUWV0ayJyRETtLcGEOTQKejqmmINpMTnx64k', 3, '127.0.0.1'),
('D19B6jpl2R9J54nmtAJl2q0rBRNE1tRB0Vq72JsAWgAA6pttwScH1yHeTQOdHjJW', 3, '127.0.0.1'),
('w5XHW1xOsSWmLEutLAekaVtvhb9DeDdkJBgNFU5QbpIa3UyXtNSNF8SoGZggBiKl', 3, '127.0.0.1'),
('dtWjiSAIVmlD1tejd1g5qOAPSw7zIYa5eDEN4pn8PnY6GT3uXGgevOgJYFjRzOp2', 4, '127.0.0.1'),
('Gz4g3XjrArqEZdvdCtJP3Fq8QiWAydgXBojf2coep4ja1KgEBMpqHGXyfi2EKNyr', 5, '127.0.0.1'),
('GPO0w1JkfH1UHsIrk1FzrVkrxpppUiHtBMBbYOcFgiwRQMYKnXjTvxPUCgP8sMym', 3, '127.0.0.1');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_03_12_000001_create_patient_table', 2),
(6, '2026_03_12_000002_create_rdv_table', 2),
(7, '2026_03_12_000003_create_authentification_table', 2),
(8, '2026_03_19_000004_add_idmedecin_to_rdv_table', 3);

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `patient`
--

DROP TABLE IF EXISTS `patient`;
CREATE TABLE IF NOT EXISTS `patient` (
  `idPatient` int NOT NULL AUTO_INCREMENT,
  `nomPatient` varchar(100) NOT NULL,
  `prenomPatient` varchar(100) NOT NULL,
  `ruePatient` varchar(150) NOT NULL,
  `cpPatient` varchar(10) NOT NULL,
  `villePatient` varchar(100) NOT NULL,
  `telPatient` varchar(20) NOT NULL,
  `loginPatient` varchar(120) NOT NULL,
  `mdpPatient` varchar(255) NOT NULL,
  PRIMARY KEY (`idPatient`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `patient`
--

INSERT INTO `patient` (`idPatient`, `nomPatient`, `prenomPatient`, `ruePatient`, `cpPatient`, `villePatient`, `telPatient`, `loginPatient`, `mdpPatient`) VALUES
(1, 'Dupont', 'Jean', '10 rue de Paris', '75001', 'Paris', '0612345678', 'jean.dupont@mail.com', '$2y$10$pIVjiRODP3U9F4VMvl6lrubu3Y3bMDIvLygUhcFjB0ZhUzFx0pu.u'),
(2, 'User', 'Test', '', '', '', '0600000000', 'testuser@example.com', '$2y$10$mLQFcHOYjC/cNuwOIIw.S.fEAehwElouXx4H71I1F6.0zEvmhkloO'),
(3, 'Akiyama', 'Maxime', '', '', '', '+33680940465', 'maximeblogueurs@gmail.com', '$2y$10$aRJxg/SpduT9t1pV9rZhIubN3g4FpTdo9ayu93gj6XhHoaNO2XjuO'),
(4, 'User', 'Test', '', '', '', '0102030405', 'testagain@example.com', '$2y$10$OxFva.9hbVCnZ2YVX8fyMO3bCUUYOkEpppEuLdT.xkgGfybEqJwoW'),
(5, 'Test 2', 'Port', '', '', '', '0102030405', 'porttest2@example.com', '$2y$10$081dUNH2CARUCRLjgTlaruEQDoONOYu7lMViFKyM3MdwDG7R4eHO.');

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rdv`
--

DROP TABLE IF EXISTS `rdv`;
CREATE TABLE IF NOT EXISTS `rdv` (
  `idRdv` int NOT NULL AUTO_INCREMENT,
  `dateHeureRdv` datetime NOT NULL,
  `idPatient` int NOT NULL,
  `idMedecin` varchar(191) DEFAULT NULL,
  `nomMedecin` varchar(100) NOT NULL,
  `prenomMedecin` varchar(100) NOT NULL,
  PRIMARY KEY (`idRdv`),
  KEY `fk_rdv_patient` (`idPatient`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `rdv`
--

INSERT INTO `rdv` (`idRdv`, `dateHeureRdv`, `idPatient`, `idMedecin`, `nomMedecin`, `prenomMedecin`) VALUES
(1, '2026-03-12 09:40:00', 1, NULL, 'Praticien #2', 'Dr'),
(10, '2026-04-09 16:40:00', 3, 'madame|mariam|gackou|49 avenue victor cresson|92130|issy les moulineaux', 'GACKOU', 'MARIAM'),
(9, '2026-04-09 15:00:00', 3, 'madame|rolande|keglo|21 rue marceau|92130|issy les moulineaux', 'KEGLO', 'ROLANDE');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
