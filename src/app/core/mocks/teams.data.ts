import { Team } from '../models/team';

const t = (id: string, name: string, code: string, flag: string, confederation: Team['confederation'], group: string, fifaRank: number): Team =>
  ({ id, name, code, flag, confederation, group, fifaRank });

export const TEAMS: Team[] = [

  t('mex', 'México', 'MEX', '🇲🇽', 'CONCACAF', 'A', 14),
  t('rsa', 'Sudáfrica', 'RSA', '🇿🇦', 'CAF', 'A', 56),
  t('kor', 'Corea del Sur', 'KOR', '🇰🇷', 'AFC', 'A', 23),
  t('cze', 'República Checa', 'CZE', '🇨🇿', 'UEFA', 'A', 38),

  t('can', 'Canadá', 'CAN', '🇨🇦', 'CONCACAF', 'B', 30),
  t('bih', 'Bosnia y Herzegovina', 'BIH', '🇧🇦', 'UEFA', 'B', 73),
  t('qat', 'Catar', 'QAT', '🇶🇦', 'AFC', 'B', 53),
  t('sui', 'Suiza', 'SUI', '🇨🇭', 'UEFA', 'B', 17),

  t('bra', 'Brasil', 'BRA', '🇧🇷', 'CONMEBOL', 'C', 5),
  t('mar', 'Marruecos', 'MAR', '🇲🇦', 'CAF', 'C', 12),
  t('hai', 'Haití', 'HAI', '🇭🇹', 'CONCACAF', 'C', 83),
  t('sco', 'Escocia', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'UEFA', 'C', 39),

  t('usa', 'Estados Unidos', 'USA', '🇺🇸', 'CONCACAF', 'D', 16),
  t('par', 'Paraguay', 'PAR', '🇵🇾', 'CONMEBOL', 'D', 41),
  t('aus', 'Australia', 'AUS', '🇦🇺', 'AFC', 'D', 26),
  t('tur', 'Turquía', 'TUR', '🇹🇷', 'UEFA', 'D', 27),

  t('ger', 'Alemania', 'GER', '🇩🇪', 'UEFA', 'E', 9),
  t('cuw', 'Curazao', 'CUW', '🇨🇼', 'CONCACAF', 'E', 85),
  t('civ', 'Costa de Marfil', 'CIV', '🇨🇮', 'CAF', 'E', 42),
  t('ecu', 'Ecuador', 'ECU', '🇪🇨', 'CONMEBOL', 'E', 25),

  t('ned', 'Países Bajos', 'NED', '🇳🇱', 'UEFA', 'F', 7),
  t('jpn', 'Japón', 'JPN', '🇯🇵', 'AFC', 'F', 18),
  t('swe', 'Suecia', 'SWE', '🇸🇪', 'UEFA', 'F', 32),
  t('tun', 'Túnez', 'TUN', '🇹🇳', 'CAF', 'F', 45),

  t('bel', 'Bélgica', 'BEL', '🇧🇪', 'UEFA', 'G', 8),
  t('egy', 'Egipto', 'EGY', '🇪🇬', 'CAF', 'G', 36),
  t('irn', 'Irán', 'IRN', '🇮🇷', 'AFC', 'G', 21),
  t('nzl', 'Nueva Zelanda', 'NZL', '🇳🇿', 'OFC', 'G', 88),

  t('esp', 'España', 'ESP', '🇪🇸', 'UEFA', 'H', 3),
  t('cpv', 'Cabo Verde', 'CPV', '🇨🇻', 'CAF', 'H', 70),
  t('ksa', 'Arabia Saudí', 'KSA', '🇸🇦', 'AFC', 'H', 58),
  t('uru', 'Uruguay', 'URU', '🇺🇾', 'CONMEBOL', 'H', 13),

  t('fra', 'Francia', 'FRA', '🇫🇷', 'UEFA', 'I', 2),
  t('sen', 'Senegal', 'SEN', '🇸🇳', 'CAF', 'I', 20),
  t('irq', 'Irak', 'IRQ', '🇮🇶', 'AFC', 'I', 57),
  t('nor', 'Noruega', 'NOR', '🇳🇴', 'UEFA', 'I', 31),

  t('arg', 'Argentina', 'ARG', '🇦🇷', 'CONMEBOL', 'J', 1),
  t('alg', 'Argelia', 'ALG', '🇩🇿', 'CAF', 'J', 40),
  t('aut', 'Austria', 'AUT', '🇦🇹', 'UEFA', 'J', 22),
  t('jor', 'Jordania', 'JOR', '🇯🇴', 'AFC', 'J', 64),

  t('por', 'Portugal', 'POR', '🇵🇹', 'UEFA', 'K', 6),
  t('cod', 'RD del Congo', 'COD', '🇨🇩', 'CAF', 'K', 60),
  t('uzb', 'Uzbekistán', 'UZB', '🇺🇿', 'AFC', 'K', 62),
  t('col', 'Colombia', 'COL', '🇨🇴', 'CONMEBOL', 'K', 10),

  t('eng', 'Inglaterra', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'UEFA', 'L', 4),
  t('cro', 'Croacia', 'CRO', '🇭🇷', 'UEFA', 'L', 11),
  t('gha', 'Ghana', 'GHA', '🇬🇭', 'CAF', 'L', 78),
  t('pan', 'Panamá', 'PAN', '🇵🇦', 'CONCACAF', 'L', 35),
];
