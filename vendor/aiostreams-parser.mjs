var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vendor/aiostreams-source/parser/regex.ts
var createRegex = (pattern) => new RegExp(
  `(?<![^\\s\\[(_\\-.,])(${pattern})(?=[\\s\\[(\\)\\]_.\\-,]|$)`,
  "i"
);
var createLanguageRegex = (pattern) => createRegex(`${pattern}(?![ .\\-_]?sub(title)?s?)`);
var PARSE_REGEX = {
  resolutions: {
    "2160p": createRegex(
      "(bd|hd|m)?(4k|2160(p|i)?)|u(ltra)?[ .\\-_]?hd|3840\\s?x\\s?(\\d{4})"
    ),
    "1440p": createRegex(
      "(bd|hd|m)?(1440(p|i)?)|2k|w?q(uad)?[ .\\-_]?hd|2560\\s?x(\\d{4})"
    ),
    "1080p": createRegex(
      "(bd|hd|m)?(1080(p|i)?)|f(ull)?[ .\\-_]?hd|1920\\s?x\\s?(\\d{3,4})"
    ),
    "720p": createRegex(
      "(bd|hd|m)?((720|800)(p|i)?)|hd|1280\\s?x\\s?(\\d{3,4})"
    ),
    "576p": createRegex("(bd|hd|m)?((576|534)(p|i)?)"),
    "480p": createRegex("(bd|hd|m)?(480(p|i)?)|sd"),
    "360p": createRegex("(bd|hd|m)?(360(p|i)?)"),
    "240p": createRegex("(bd|hd|m)?(240(p|i)?)"),
    "144p": createRegex("(bd|hd|m)?(144(p|i)?)")
  },
  qualities: {
    "BluRay REMUX": createRegex("(?<!dvd.*)(bd|br|b|uhd)?remux(?!.*dvd)"),
    BluRay: createRegex(
      "(?<!remux.*)((bd|blu[ .\\-_]?ray)([ .\\-_]?rip)?|br[ .\\-_]?rip)(?!.*remux)"
    ),
    "WEB-DL": createRegex("web[ .\\-_]?(dl)?(?![ .\\-_]?(rip|DLRip|cam))"),
    WEBRip: createRegex("web[ .\\-_]?rip"),
    HDRip: createRegex("hd[ .\\-_]?rip|web[ .\\-_]?dl[ .\\-_]?rip"),
    "HC HD-Rip": createRegex("hc|hd[ .\\-_]?rip"),
    "DVD REMUX": createRegex(
      "(hd[ .\\-_]?)?dvd.*remux|remux.*(hd[ .\\-_]?)?dvd"
    ),
    DVDRip: createRegex("dvd[ .\\-_]?(rip|mux|r|full|5|9)?"),
    HDTV: createRegex(
      "(hd|pd)tv|tv[ .\\-_]?rip|hdtv[ .\\-_]?rip|dsr(ip)?|sat[ .\\-_]?rip"
    ),
    CAM: createRegex("cam|hdcam|cam[ .\\-_]?rip"),
    TS: createRegex("telesync|ts|hd[ .\\-_]?ts|pdvd|predvd(rip)?"),
    TC: createRegex("telecine|tc|hd[ .\\-_]?tc"),
    SCR: createRegex("((dvd|bd|web|hd)?[ .\\-_]?)?(scr(eener)?)")
  },
  visualTags: {
    "10bit": createRegex("10[ .\\-_]?bit|hi10p?"),
    "HDR10+": createRegex("hdr[ .\\-_]?10[ .\\-_]?(p(lus)?|[+])"),
    HDR10: createRegex("hdr[ .\\-_]?10(?![ .\\-_]?(?:\\+|p(?:lus)?|bit|hi))"),
    HDR: createRegex(
      "hdr(?![ .\\-_]?(?:10(?![ .\\-_]?(?:bit|hi))|\\+|p(?:lus)?))"
    ),
    HLG: createRegex("hlg"),
    DV: createRegex("do?(lby)?[ .\\-_]?vi?(sion)?(?:[ .\\-_]?atmos)?|dv"),
    "3D": createRegex("(bd)?(3|three)[ .\\-_]?(d(imension)?(al)?)"),
    IMAX: createRegex("imax"),
    AI: createRegex("ai|ai(enhanced?|re[ .\\-_]?graded?)"),
    Upscaled: createRegex("(ai)?(uprez|ups(uhd|cal(ed?|ing)(uhd)?))(ai)?"),
    SDR: createRegex("sdr"),
    "H-OU": createRegex("h?(alf)?[ .\\-_]?(ou|over[ .\\-_]?under)"),
    "H-SBS": createRegex("h?(alf)?[ .\\-_]?(sbs|side[ .\\-_]?by[ .\\-_]?side)")
  },
  audioTags: {
    Atmos: createRegex("atmos|ddpa\\d?"),
    "DD+": createRegex(
      "(d(olby)?[ .\\-_]?d(igital)?[ .\\-_]?((p(lus)?|\\+)a?)(?:[ .\\-_]?(2[ .\\-_]?0|5[ .\\-_]?1|7[ .\\-_]?1))?)|e[ .\\-_]?ac[ .\\-_]?3"
    ),
    DD: createRegex(
      "(d(olby)?[ .\\-_]?d(igital)?(?:[ .\\-_]?(5[ .\\-_]?1|7[ .\\-_]?1|2[ .\\-_]?0?))?)|(?<!e[ .\\-_]?)ac[ .\\-_]?3"
    ),
    "DTS:X": createRegex("dts[ .\\-:_]?x"),
    "DTS-HD MA": createRegex("dts[ .\\-_]?hd[ .\\-_]?ma"),
    "DTS-HD": createRegex("dts[ .\\-_]?hd(?![ .\\-_]?ma)"),
    "DTS-ES": createRegex("dts[ .\\-_]?es"),
    DTS: createRegex(
      "dts(?![ .\\-:_]?(x(?=[\\s\\[(\\)\\]_.\\-,]|$)|hd[ .\\-_]?(ma)?|es))"
    ),
    TrueHD: createRegex("true[ .\\-_]?hd"),
    PCM: createRegex("l?pcm"),
    OPUS: createRegex("opus"),
    AAC: createRegex("q?aac(?:[ .\\-_]?2)?"),
    FLAC: createRegex("flac(?:[ .\\-_]?(lossless|2\\.0|x[2-4]))?")
  },
  audioChannels: {
    "2.0": createRegex("(d(olby)?[ .\\-_]?d(igital)?)?2[ .\\-_]?0(ch)?"),
    "5.1": createRegex(
      "(d(olby)?[ .\\-_]?d(igital)?[ .\\-_]?((p(lus)?|\\+)a?)?)?5[ .\\-_]?1(ch)?"
    ),
    "6.1": createRegex(
      "(d(olby)?[ .\\-_]?d(igital)?[ .\\-_]?((p(lus)?|\\+)a?)?)?6[ .\\-_]?1(ch)?"
    ),
    "7.1": createRegex(
      "(d(olby)?[ .\\-_]?d(igital)?[ .\\-_]?((p(lus)?|\\+)a?)?)?7[ .\\-_]?1(ch)?"
    )
  },
  encodes: {
    HEVC: createRegex("hevc[ .\\-_]?(10)?|[xh][ .\\-_]?265"),
    AVC: createRegex("avc|[xh][ .\\-_]?264"),
    AV1: createRegex("av1"),
    "VC-1": createRegex("vc[ .\\-_]?1"),
    XviD: createRegex("xvid"),
    DivX: createRegex("divx|dvix"),
    "MPEG-4": createRegex("mpeg[ .\\-_]?4")
  },
  languages: {
    Multi: createLanguageRegex("multi"),
    "Dual Audio": createLanguageRegex(
      "dual[ .\\-_]?(audio|lang(uage)?|flac|ac3|aac2?)"
    ),
    Dubbed: createLanguageRegex("dub(s|bed|bing)?"),
    English: createLanguageRegex("english|eng"),
    Japanese: createLanguageRegex("japanese|jap|jpn"),
    Chinese: createLanguageRegex("chinese|chi"),
    Russian: createLanguageRegex("russian|rus"),
    Arabic: createLanguageRegex("arabic|ara"),
    Portuguese: createLanguageRegex("portuguese"),
    "Portuguese (Brazil)": createLanguageRegex(
      "portuguese[ .\\-_]?brazil|pt[ .\\-_]?br"
    ),
    Spanish: createLanguageRegex("spanish|spa|esp"),
    French: createLanguageRegex("french|fra|fr|vf|vff|vfi|vf2|vfq|truefrench"),
    German: createLanguageRegex("deu(tsch)?(land)?|ger(man)?"),
    Italian: createLanguageRegex("italian|ita"),
    Korean: createLanguageRegex("korean|kor"),
    Hindi: createLanguageRegex("hindi|hin"),
    Bengali: createLanguageRegex("bengali|ben(?![ .\\-_]?the[ .\\-_]?men)"),
    Punjabi: createLanguageRegex("punjabi|pan"),
    Marathi: createLanguageRegex("marathi|mar"),
    Gujarati: createLanguageRegex("gujarati|guj"),
    Tamil: createLanguageRegex("tamil|tam"),
    Telugu: createLanguageRegex("telugu|tel"),
    Kannada: createLanguageRegex("kannada|kan"),
    Malayalam: createLanguageRegex("malayalam|mal"),
    Thai: createLanguageRegex("thai|tha"),
    Vietnamese: createLanguageRegex("vietnamese|vie"),
    Indonesian: createLanguageRegex("indonesian|ind"),
    Turkish: createLanguageRegex("turkish|tur"),
    Hebrew: createLanguageRegex("hebrew|heb"),
    Persian: createLanguageRegex("persian|per"),
    Ukrainian: createLanguageRegex("ukrainian|ukr"),
    Greek: createLanguageRegex("greek|ell"),
    Lithuanian: createLanguageRegex("lithuanian|lit"),
    Latvian: createLanguageRegex("latvian|lav"),
    Estonian: createLanguageRegex("estonian|est"),
    Polish: createLanguageRegex("polish|pol"),
    Czech: createLanguageRegex("czech|cze"),
    Slovak: createLanguageRegex("slovak|slo"),
    Hungarian: createLanguageRegex("hungarian|hun"),
    Romanian: createLanguageRegex("romanian|rum"),
    Bulgarian: createLanguageRegex("bulgarian|bul"),
    Serbian: createLanguageRegex("serbian|srp"),
    Croatian: createLanguageRegex("croatian|hrv"),
    Slovenian: createLanguageRegex("slovenian|slv"),
    Dutch: createLanguageRegex("dutch|dut"),
    Danish: createLanguageRegex("danish|dan"),
    Finnish: createLanguageRegex("finnish|fin"),
    Swedish: createLanguageRegex("swedish|swe"),
    Norwegian: createLanguageRegex("norwegian|nor"),
    Malay: createLanguageRegex("malay"),
    Latino: createLanguageRegex("latino|lat")
  }
};

// vendor/aiostreams-source/parser/title.ts
import { parseTorrentTitle } from "@viren070/parse-torrent-title";

// vendor/aiostreams-source/utils/constants.ts
var constants_exports = {};
__export(constants_exports, {
  ADDON_CATALOG_RESOURCE: () => ADDON_CATALOG_RESOURCE,
  AIOSTREAMS_SERVICE: () => AIOSTREAMS_SERVICE,
  ALLDEBRID_SERVICE: () => ALLDEBRID_SERVICE,
  ALTMOUNT_SERVICE: () => ALTMOUNT_SERVICE,
  ANIME_TYPE: () => ANIME_TYPE,
  APIError: () => APIError,
  API_VERSION: () => API_VERSION,
  ARCHIVE_STREAM_TYPE: () => ARCHIVE_STREAM_TYPE,
  AUDIO_CHANNELS: () => AUDIO_CHANNELS,
  AUDIO_TAGS: () => AUDIO_TAGS,
  AUTO_PLAY_ATTRIBUTES: () => AUTO_PLAY_ATTRIBUTES,
  AUTO_PLAY_METHODS: () => AUTO_PLAY_METHODS,
  AUTO_PLAY_METHOD_DETAILS: () => AUTO_PLAY_METHOD_DETAILS,
  BUILTIN_PROXY_PATH_PREFIX: () => BUILTIN_PROXY_PATH_PREFIX,
  BUILTIN_SERVICE: () => BUILTIN_SERVICE,
  BUILTIN_SUPPORTED_SERVICES: () => BUILTIN_SUPPORTED_SERVICES,
  CATALOG_RESOURCE: () => CATALOG_RESOURCE,
  CHANNEL_TYPE: () => CHANNEL_TYPE,
  CUSTOM_FORMATTER: () => CUSTOM_FORMATTER,
  DEBRIDER_SERVICE: () => DEBRIDER_SERVICE,
  DEBRIDLINK_SERVICE: () => DEBRIDLINK_SERVICE,
  DEBRID_STREAM_TYPE: () => DEBRID_STREAM_TYPE,
  DEDUPLICATOR_KEYS: () => DEDUPLICATOR_KEYS,
  DEDUPLICATOR_LIBRARY_BEHAVIOURS: () => DEDUPLICATOR_LIBRARY_BEHAVIOURS,
  DEDUPLICATOR_MERGE_FIELDS: () => DEDUPLICATOR_MERGE_FIELDS,
  DEDUPLICATOR_TIEBREAKERS: () => DEDUPLICATOR_TIEBREAKERS,
  DEFAULT_AUTO_PLAY_ATTRIBUTES: () => DEFAULT_AUTO_PLAY_ATTRIBUTES,
  DEFAULT_FAILOVER_CONTENT_TYPES: () => DEFAULT_FAILOVER_CONTENT_TYPES,
  DEFAULT_FAILOVER_DUPLICATE_STAGGER_MS: () => DEFAULT_FAILOVER_DUPLICATE_STAGGER_MS,
  DEFAULT_FAILOVER_INCLUDE_EXTERNAL: () => DEFAULT_FAILOVER_INCLUDE_EXTERNAL,
  DEFAULT_FAILOVER_MAX_ATTEMPTS: () => DEFAULT_FAILOVER_MAX_ATTEMPTS,
  DEFAULT_FAILOVER_MAX_WAIT_MS: () => DEFAULT_FAILOVER_MAX_WAIT_MS,
  DEFAULT_FAILOVER_ONLY_SAME_RELEASE: () => DEFAULT_FAILOVER_ONLY_SAME_RELEASE,
  DEFAULT_FAILOVER_PARALLEL: () => DEFAULT_FAILOVER_PARALLEL,
  DEFAULT_FAILOVER_PREFERRED_GRACE_MS: () => DEFAULT_FAILOVER_PREFERRED_GRACE_MS,
  DEFAULT_FAILOVER_SAME_RELEASE_LIMIT: () => DEFAULT_FAILOVER_SAME_RELEASE_LIMIT,
  DEFAULT_FAILOVER_STAGGER_MS: () => DEFAULT_FAILOVER_STAGGER_MS,
  DEFAULT_PRECACHE_SELECTOR: () => DEFAULT_PRECACHE_SELECTOR,
  DEFAULT_PRELOAD_SELECTOR: () => DEFAULT_PRELOAD_SELECTOR,
  DEFAULT_REPOST_SUFFIXES: () => DEFAULT_REPOST_SUFFIXES,
  DEFAULT_SMART_DETECT_ATTRIBUTES: () => DEFAULT_SMART_DETECT_ATTRIBUTES,
  EASYDEBRID_SERVICE: () => EASYDEBRID_SERVICE,
  EASYNEWS_SERVICE: () => EASYNEWS_SERVICE,
  ENCODES: () => ENCODES,
  ERROR_STREAM_TYPE: () => ERROR_STREAM_TYPE,
  EXTERNAL_STREAM_TYPE: () => EXTERNAL_STREAM_TYPE,
  ErrorCode: () => ErrorCode,
  ErrorMap: () => ErrorMap,
  FAKE_VISUAL_TAGS: () => FAKE_VISUAL_TAGS,
  FORMATTERS: () => FORMATTERS,
  FORMATTER_DETAILS: () => FORMATTER_DETAILS,
  GDRIVE_FORMATTER: () => GDRIVE_FORMATTER,
  HEADERS_FOR_IP_FORWARDING: () => HEADERS_FOR_IP_FORWARDING,
  HTTP_STREAM_TYPE: () => HTTP_STREAM_TYPE,
  INFO_STREAM_TYPE: () => INFO_STREAM_TYPE,
  INTERNAL_PROXY_MARKER: () => INTERNAL_PROXY_MARKER,
  INTERNAL_SECRET_HEADER: () => INTERNAL_SECRET_HEADER,
  LANGUAGES: () => LANGUAGES,
  LIGHT_GDRIVE_FORMATTER: () => LIGHT_GDRIVE_FORMATTER,
  LIVE_STREAM_TYPE: () => LIVE_STREAM_TYPE,
  MAX_AGE_HOURS: () => MAX_AGE_HOURS,
  MAX_BITRATE: () => MAX_BITRATE,
  MAX_SEEDERS: () => MAX_SEEDERS,
  MAX_SIZE: () => MAX_SIZE,
  MEDIAFLOW_SERVICE: () => MEDIAFLOW_SERVICE,
  META_RESOURCE: () => META_RESOURCE,
  MINIMALISTIC_GDRIVE_FORMATTER: () => MINIMALISTIC_GDRIVE_FORMATTER,
  MIN_AGE_HOURS: () => MIN_AGE_HOURS,
  MIN_BITRATE: () => MIN_BITRATE,
  MIN_SEEDERS: () => MIN_SEEDERS,
  MIN_SIZE: () => MIN_SIZE,
  MOVIE_TYPE: () => MOVIE_TYPE,
  NZBDAV_SERVICE: () => NZBDAV_SERVICE,
  OFFCLOUD_SERVICE: () => OFFCLOUD_SERVICE,
  P2P_STREAM_TYPE: () => P2P_STREAM_TYPE,
  PASSTHROUGH_STAGES: () => PASSTHROUGH_STAGES,
  PIKPAK_SERVICE: () => PIKPAK_SERVICE,
  PLAY_PATH_MARKER: () => PLAY_PATH_MARKER,
  PREMIUMIZE_SERVICE: () => PREMIUMIZE_SERVICE,
  PRESET_CATEGORIES: () => PRESET_CATEGORIES,
  PRISM_FORMATTER: () => PRISM_FORMATTER,
  PROXY_SERVICES: () => PROXY_SERVICES,
  PROXY_SERVICE_DETAILS: () => PROXY_SERVICE_DETAILS,
  PUTIO_SERVICE: () => PUTIO_SERVICE,
  PresetCategory: () => PresetCategory,
  QUALITIES: () => QUALITIES,
  REALDEBRID_SERVICE: () => REALDEBRID_SERVICE,
  REDIS_PREFIX: () => REDIS_PREFIX,
  RESOLUTIONS: () => RESOLUTIONS,
  RESOURCES: () => RESOURCES,
  RESOURCE_LABELS: () => RESOURCE_LABELS,
  SEEDR_SERVICE: () => SEEDR_SERVICE,
  SEGMENT_PROVIDERS: () => SEGMENT_PROVIDERS,
  SERIES_TYPE: () => SERIES_TYPE,
  SERVICES: () => SERVICES,
  SERVICE_DETAILS: () => SERVICE_DETAILS,
  SMART_DETECT_ATTRIBUTES: () => SMART_DETECT_ATTRIBUTES,
  SNIPPETS: () => SNIPPETS,
  SORT_CRITERIA: () => SORT_CRITERIA,
  SORT_CRITERIA_DETAILS: () => SORT_CRITERIA_DETAILS,
  SORT_DIRECTIONS: () => SORT_DIRECTIONS,
  STATISTIC_STREAM_TYPE: () => STATISTIC_STREAM_TYPE,
  STREAM_RESOURCE: () => STREAM_RESOURCE,
  STREAM_TYPES: () => STREAM_TYPES,
  STREMIO_NNTP_SERVICE: () => STREMIO_NNTP_SERVICE,
  STREMIO_USENET_STREAM_TYPE: () => STREMIO_USENET_STREAM_TYPE,
  STREMTHRU_NEWZ_SERVICE: () => STREMTHRU_NEWZ_SERVICE,
  STREMTHRU_SERVICE: () => STREMTHRU_SERVICE,
  SUBTITLES_RESOURCE: () => SUBTITLES_RESOURCE,
  SUGGESTION_PROVIDERS: () => SUGGESTION_PROVIDERS,
  TAMTARO_FORMATTER: () => TAMTARO_FORMATTER,
  TOP_LEVEL_OPTION_DETAILS: () => TOP_LEVEL_OPTION_DETAILS,
  TORBOX_FORMATTER: () => TORBOX_FORMATTER,
  TORBOX_SERVICE: () => TORBOX_SERVICE,
  TORRENTIO_FORMATTER: () => TORRENTIO_FORMATTER,
  TORRIN_SERVICE: () => TORRIN_SERVICE,
  TV_TYPE: () => TV_TYPE,
  TYPES: () => TYPES,
  TYPE_LABELS: () => TYPE_LABELS,
  USENET_STREAM_TYPE: () => USENET_STREAM_TYPE,
  VISUAL_TAGS: () => VISUAL_TAGS,
  WATCH_STATE_MANIFEST_KEY: () => WATCH_STATE_MANIFEST_KEY,
  WATCH_STATE_RESOURCE: () => WATCH_STATE_RESOURCE,
  YOUTUBE_STREAM_TYPE: () => YOUTUBE_STREAM_TYPE
});

// vendor/aiostreams-source/utils/language-list.ts
var FULL_LANGUAGE_MAPPING = [
  // A
  {
    iso_639_1: "aa",
    iso_639_2: "aar",
    iso_3166_1: "ET",
    flag: "\u{1F1EA}\u{1F1F9}",
    english_name: "Afar",
    name: "Qaf\xE1r af"
  },
  {
    iso_639_1: "ab",
    iso_639_2: "abk",
    iso_3166_1: "GE",
    flag: "\u{1F1EC}\u{1F1EA}",
    english_name: "Abkhazian",
    name: "\u0410\u04A7\u0441\u0443\u0430 \u0431\u044B\u0437\u0448\u04D9\u0430"
  },
  {
    iso_639_1: "ae",
    iso_639_2: "ave",
    iso_3166_1: "IR",
    flag: "\u{1F1EE}\u{1F1F7}",
    english_name: "Avestan",
    name: "Avesta"
  },
  {
    iso_639_1: "af",
    iso_639_2: "afr",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Afrikaans",
    name: "Afrikaans"
  },
  {
    iso_639_1: "ak",
    iso_639_2: "aka",
    iso_3166_1: "GH",
    flag: "\u{1F1EC}\u{1F1ED}",
    english_name: "Akan",
    name: "Akan"
  },
  {
    iso_639_1: "am",
    iso_639_2: "amh",
    iso_3166_1: "ET",
    flag: "\u{1F1EA}\u{1F1F9}",
    english_name: "Amharic",
    name: "\u12A0\u121B\u122D\u129B"
  },
  {
    iso_639_1: "an",
    iso_639_2: "arg",
    iso_3166_1: "ES",
    flag: "\u{1F1EA}\u{1F1F8}",
    english_name: "Aragonese",
    name: "Aragon\xE9s"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "SA",
    flag: "\u{1F1F8}\u{1F1E6}",
    flag_priority: true,
    english_name: "Arabic",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "AE",
    flag: "\u{1F1E6}\u{1F1EA}",
    english_name: "Arabic (UAE)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "EG",
    flag: "\u{1F1EA}\u{1F1EC}",
    english_name: "Arabic (Egypt)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "as",
    iso_639_2: "asm",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Assamese",
    name: "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE"
  },
  {
    iso_639_1: "av",
    iso_639_2: "ava",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Avaric",
    name: "\u0410\u0432\u0430\u0440 \u043C\u0430\u0446\u04C0"
  },
  {
    iso_639_1: "ay",
    iso_639_2: "aym",
    iso_3166_1: "BO",
    flag: "\u{1F1E7}\u{1F1F4}",
    english_name: "Aymara",
    name: "Aymar aru"
  },
  {
    iso_639_1: "az",
    iso_639_2: "aze",
    iso_3166_1: "AZ",
    flag: "\u{1F1E6}\u{1F1FF}",
    english_name: "Azerbaijani",
    name: "Az\u0259rbaycan"
  },
  // B
  {
    iso_639_1: "ba",
    iso_639_2: "bak",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Bashkir",
    name: "\u0411\u0430\u0448\u04A1\u043E\u0440\u0442 \u0442\u0435\u043B\u0435"
  },
  {
    iso_639_1: "be",
    iso_639_2: "bel",
    iso_3166_1: "BY",
    flag: "\u{1F1E7}\u{1F1FE}",
    english_name: "Belarusian",
    name: "\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0430\u044F \u043C\u043E\u0432\u0430"
  },
  {
    iso_639_1: "bg",
    iso_639_2: "bul",
    iso_3166_1: "BG",
    flag: "\u{1F1E7}\u{1F1EC}",
    english_name: "Bulgarian",
    name: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438 \u0435\u0437\u0438\u043A"
  },
  {
    iso_639_1: "bi",
    iso_639_2: "bis",
    iso_3166_1: "VU",
    flag: "\u{1F1FB}\u{1F1FA}",
    english_name: "Bislama",
    name: "Bislama"
  },
  {
    iso_639_1: "bm",
    iso_639_2: "bam",
    iso_3166_1: "ML",
    flag: "\u{1F1F2}\u{1F1F1}",
    english_name: "Bambara",
    name: "Bamanankan"
  },
  {
    iso_639_1: "bn",
    iso_639_2: "ben",
    iso_3166_1: "BD",
    flag: "\u{1F1E7}\u{1F1E9}",
    flag_priority: true,
    english_name: "Bengali",
    name: "\u09AC\u09BE\u0982\u09B2\u09BE"
  },
  {
    iso_639_1: "bo",
    iso_639_2: "bod",
    iso_3166_1: "CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    english_name: "Tibetan",
    name: "\u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42"
  },
  {
    iso_639_1: "br",
    iso_639_2: "bre",
    iso_3166_1: "FR",
    flag: "\u{1F1EB}\u{1F1F7}",
    english_name: "Breton",
    name: "Brezhoneg"
  },
  {
    iso_639_1: "bs",
    iso_639_2: "bos",
    iso_3166_1: "BA",
    flag: "\u{1F1E7}\u{1F1E6}",
    english_name: "Bosnian",
    name: "Bosanski"
  },
  // C
  {
    iso_639_1: "ca",
    iso_639_2: "cat",
    iso_3166_1: "ES",
    flag: "\u{1F1EA}\u{1F1F8}",
    english_name: "Catalan",
    name: "Catal\xE0"
  },
  {
    iso_639_1: "ce",
    iso_639_2: "che",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Chechen",
    name: "\u041D\u043E\u0445\u0447\u0438\u0439\u043D \u043C\u043E\u0442\u0442"
  },
  {
    iso_639_1: "ch",
    iso_639_2: "cha",
    iso_3166_1: "MP",
    flag: "\u{1F1F2}\u{1F1F5}",
    english_name: "Chamorro",
    name: "Finu' Chamorro"
  },
  {
    iso_639_1: "co",
    iso_639_2: "cos",
    iso_3166_1: "FR",
    flag: "\u{1F1EB}\u{1F1F7}",
    english_name: "Corsican",
    name: "Corsu"
  },
  {
    iso_639_1: "cr",
    iso_639_2: "cre",
    iso_3166_1: "CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    english_name: "Cree",
    name: "\u14C0\u1426\u1403\u152D\u140D\u140F\u1423"
  },
  {
    iso_639_1: "cs",
    iso_639_2: "ces",
    iso_3166_1: "CZ",
    flag: "\u{1F1E8}\u{1F1FF}",
    english_name: "Czech",
    name: "\u010Cesk\xFD"
  },
  {
    iso_639_1: "cu",
    iso_639_2: "chu",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Church Slavic",
    name: "\u0421\u043B\u043E\u0432\u0463\u043D\u044C\u0441\u043A\u044A"
  },
  {
    iso_639_1: "cv",
    iso_639_2: "chv",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Chuvash",
    name: "\u0427\u04D1\u0432\u0430\u0448 \u0447\u04D7\u043B\u0445\u0438"
  },
  {
    iso_639_1: "cy",
    iso_639_2: "cym",
    iso_3166_1: "GB",
    flag: "\u{1F1EC}\u{1F1E7}",
    english_name: "Welsh",
    name: "Cymraeg"
  },
  // D
  {
    iso_639_1: "da",
    iso_639_2: "dan",
    iso_3166_1: "DK",
    flag: "\u{1F1E9}\u{1F1F0}",
    flag_priority: true,
    english_name: "Danish",
    name: "Dansk"
  },
  {
    iso_639_1: "de",
    iso_639_2: "deu",
    iso_3166_1: "DE",
    flag: "\u{1F1E9}\u{1F1EA}",
    flag_priority: true,
    english_name: "German",
    name: "Deutsch"
  },
  {
    iso_639_1: "dv",
    iso_639_2: "div",
    iso_3166_1: "MV",
    flag: "\u{1F1F2}\u{1F1FB}",
    english_name: "Divehi",
    name: "\u078B\u07A8\u0788\u07AC\u0780\u07A8"
  },
  {
    iso_639_1: "dz",
    iso_639_2: "dzo",
    iso_3166_1: "BT",
    flag: "\u{1F1E7}\u{1F1F9}",
    english_name: "Dzongkha",
    name: "\u0F62\u0FAB\u0F7C\u0F44\u0F0B\u0F41"
  },
  // E
  {
    iso_639_1: "ee",
    iso_639_2: "ewe",
    iso_3166_1: "GH",
    flag: "\u{1F1EC}\u{1F1ED}",
    english_name: "Ewe",
    name: "\xC8\u028Begbe"
  },
  {
    iso_639_1: "el",
    iso_639_2: "ell",
    iso_3166_1: "GR",
    flag: "\u{1F1EC}\u{1F1F7}",
    english_name: "Greek",
    name: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "GB",
    flag: "\u{1F1EC}\u{1F1E7}",
    flag_priority: true,
    english_name: "English (UK)",
    name: "English"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "US",
    flag: "\u{1F1FA}\u{1F1F8}",
    english_name: "English (US)",
    name: "English"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "AU",
    flag: "\u{1F1E6}\u{1F1FA}",
    english_name: "English (Australia)",
    name: "English"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    english_name: "English (Canada)",
    name: "English"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "IE",
    flag: "\u{1F1EE}\u{1F1EA}",
    english_name: "English (Ireland)",
    name: "English"
  },
  {
    iso_639_1: "en",
    iso_639_2: "eng",
    iso_3166_1: "NZ",
    flag: "\u{1F1F3}\u{1F1FF}",
    english_name: "English (New Zealand)",
    name: "English"
  },
  {
    iso_639_1: "eo",
    iso_639_2: "epo",
    iso_3166_1: null,
    flag: "\u{1F310}",
    english_name: "Esperanto",
    name: "Esperanto"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "ES",
    flag: "\u{1F1EA}\u{1F1F8}",
    flag_priority: true,
    english_name: "Spanish",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "et",
    iso_639_2: "est",
    iso_3166_1: "EE",
    flag: "\u{1F1EA}\u{1F1EA}",
    english_name: "Estonian",
    name: "Eesti"
  },
  {
    iso_639_1: "eu",
    iso_639_2: "eus",
    iso_3166_1: "ES",
    flag: "\u{1F3F4}",
    english_name: "Basque",
    name: "Euskera"
  },
  // F
  {
    iso_639_1: "fa",
    iso_639_2: "fas",
    iso_3166_1: "IR",
    flag: "\u{1F1EE}\u{1F1F7}",
    english_name: "Persian",
    name: "\u0641\u0627\u0631\u0633\u06CC"
  },
  {
    iso_639_1: "ff",
    iso_639_2: "ful",
    iso_3166_1: "SN",
    flag: "\u{1F1F8}\u{1F1F3}",
    english_name: "Fulah",
    name: "Fulfulde"
  },
  {
    iso_639_1: "fi",
    iso_639_2: "fin",
    iso_3166_1: "FI",
    flag: "\u{1F1EB}\u{1F1EE}",
    english_name: "Finnish",
    name: "Suomi"
  },
  {
    iso_639_1: "fj",
    iso_639_2: "fij",
    iso_3166_1: "FJ",
    flag: "\u{1F1EB}\u{1F1EF}",
    english_name: "Fijian",
    name: "Vosa Vakaviti"
  },
  {
    iso_639_1: "fo",
    iso_639_2: "fao",
    iso_3166_1: "FO",
    flag: "\u{1F1EB}\u{1F1F4}",
    english_name: "Faroese",
    name: "F\xF8royskt"
  },
  {
    iso_639_1: "fr",
    iso_639_2: "fra",
    iso_3166_1: "FR",
    flag: "\u{1F1EB}\u{1F1F7}",
    flag_priority: true,
    english_name: "French",
    name: "Fran\xE7ais"
  },
  {
    iso_639_1: "fy",
    iso_639_2: "fry",
    iso_3166_1: "NL",
    flag: "\u{1F1F3}\u{1F1F1}",
    english_name: "Western Frisian",
    name: "Frysk"
  },
  // G
  {
    iso_639_1: "ga",
    iso_639_2: "gle",
    iso_3166_1: "IE",
    flag: "\u{1F1EE}\u{1F1EA}",
    english_name: "Irish",
    name: "Gaeilge"
  },
  {
    iso_639_1: "gd",
    iso_639_2: "gla",
    iso_3166_1: "GB",
    flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
    english_name: "Scottish Gaelic",
    name: "G\xE0idhlig"
  },
  {
    iso_639_1: "gl",
    iso_639_2: "glg",
    iso_3166_1: "ES",
    flag: "\u{1F1EA}\u{1F1F8}",
    english_name: "Galician",
    name: "Galego"
  },
  {
    iso_639_1: "gn",
    iso_639_2: "grn",
    iso_3166_1: "PY",
    flag: "\u{1F1F5}\u{1F1FE}",
    english_name: "Guarani",
    name: "Ava\xF1e'\u1EBD"
  },
  {
    iso_639_1: "gu",
    iso_639_2: "guj",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Gujarati",
    name: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0"
  },
  {
    iso_639_1: "gv",
    iso_639_2: "glv",
    iso_3166_1: "IM",
    flag: "\u{1F1EE}\u{1F1F2}",
    english_name: "Manx",
    name: "Gaelg"
  },
  // H
  {
    iso_639_1: "ha",
    iso_639_2: "hau",
    iso_3166_1: "NG",
    flag: "\u{1F1F3}\u{1F1EC}",
    english_name: "Hausa",
    name: "Hausa"
  },
  {
    iso_639_1: "he",
    iso_639_2: "heb",
    iso_3166_1: "IL",
    flag: "\u{1F1EE}\u{1F1F1}",
    flag_priority: true,
    english_name: "Hebrew",
    name: "\u05E2\u05B4\u05D1\u05B0\u05E8\u05B4\u05D9\u05EA"
  },
  {
    iso_639_1: "hi",
    iso_639_2: "hin",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    flag_priority: true,
    english_name: "Hindi",
    name: "\u0939\u093F\u0928\u094D\u0926\u0940"
  },
  {
    iso_639_1: "ho",
    iso_639_2: "hmo",
    iso_3166_1: "PG",
    flag: "\u{1F1F5}\u{1F1EC}",
    english_name: "Hiri Motu",
    name: "Hiri Motu"
  },
  {
    iso_639_1: "hr",
    iso_639_2: "hrv",
    iso_3166_1: "HR",
    flag: "\u{1F1ED}\u{1F1F7}",
    english_name: "Croatian",
    name: "Hrvatski"
  },
  {
    iso_639_1: "ht",
    iso_639_2: "hat",
    iso_3166_1: "HT",
    flag: "\u{1F1ED}\u{1F1F9}",
    english_name: "Haitian; Haitian Creole",
    name: "Krey\xF2l ayisyen"
  },
  {
    iso_639_1: "hu",
    iso_639_2: "hun",
    iso_3166_1: "HU",
    flag: "\u{1F1ED}\u{1F1FA}",
    english_name: "Hungarian",
    name: "Magyar"
  },
  {
    iso_639_1: "hy",
    iso_639_2: "hye",
    iso_3166_1: "AM",
    flag: "\u{1F1E6}\u{1F1F2}",
    english_name: "Armenian",
    name: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576"
  },
  {
    iso_639_1: "hz",
    iso_639_2: "her",
    iso_3166_1: "NA",
    flag: "\u{1F1F3}\u{1F1E6}",
    english_name: "Herero",
    name: "Otjiherero"
  },
  // I
  {
    iso_639_1: "ia",
    iso_639_2: "ina",
    iso_3166_1: null,
    flag: "\u{1F310}",
    english_name: "Interlingua",
    name: "Interlingua"
  },
  {
    iso_639_1: "id",
    iso_639_2: "ind",
    iso_3166_1: "ID",
    flag: "\u{1F1EE}\u{1F1E9}",
    flag_priority: true,
    english_name: "Indonesian",
    name: "Bahasa Indonesia"
  },
  {
    iso_639_1: "ie",
    iso_639_2: "ile",
    iso_3166_1: null,
    flag: "\u{1F310}",
    english_name: "Interlingue",
    name: "Interlingue"
  },
  {
    iso_639_1: "ig",
    iso_639_2: "ibo",
    iso_3166_1: "NG",
    flag: "\u{1F1F3}\u{1F1EC}",
    english_name: "Igbo",
    name: "As\u1EE5s\u1EE5 Igbo"
  },
  {
    iso_639_1: "ii",
    iso_639_2: "iii",
    iso_3166_1: "CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    english_name: "Sichuan Yi; Nuosu",
    name: "\uA188\uA320\uA259"
  },
  {
    iso_639_1: "ik",
    iso_639_2: "ipk",
    iso_3166_1: "US",
    flag: "\u{1F1FA}\u{1F1F8}",
    english_name: "Inupiaq",
    name: "I\xF1upiaq"
  },
  {
    iso_639_1: "io",
    iso_639_2: "ido",
    iso_3166_1: null,
    flag: "\u{1F310}",
    english_name: "Ido",
    name: "Ido"
  },
  {
    iso_639_1: "is",
    iso_639_2: "isl",
    iso_3166_1: "IS",
    flag: "\u{1F1EE}\u{1F1F8}",
    english_name: "Icelandic",
    name: "\xCDslenska"
  },
  {
    iso_639_1: "it",
    iso_639_2: "ita",
    iso_3166_1: "IT",
    flag: "\u{1F1EE}\u{1F1F9}",
    flag_priority: true,
    english_name: "Italian",
    name: "Italiano"
  },
  {
    iso_639_1: "iu",
    iso_639_2: "iku",
    iso_3166_1: "CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    english_name: "Inuktitut",
    name: "\u1403\u14C4\u1483\u144E\u1450\u1466"
  },
  // J
  {
    iso_639_1: "ja",
    iso_639_2: "jpn",
    iso_3166_1: "JP",
    flag: "\u{1F1EF}\u{1F1F5}",
    english_name: "Japanese",
    name: "\u65E5\u672C\u8A9E"
  },
  {
    iso_639_1: "jv",
    iso_639_2: "jav",
    iso_3166_1: "ID",
    flag: "\u{1F1EE}\u{1F1E9}",
    english_name: "Javanese",
    name: "Basa Jawa"
  },
  // K
  {
    iso_639_1: "ka",
    iso_639_2: "kat",
    iso_3166_1: "GE",
    flag: "\u{1F1EC}\u{1F1EA}",
    english_name: "Georgian",
    name: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8"
  },
  {
    iso_639_1: "kg",
    iso_639_2: "kon",
    iso_3166_1: "CD",
    flag: "\u{1F1E8}\u{1F1E9}",
    english_name: "Kongo",
    name: "KiKongo"
  },
  {
    iso_639_1: "ki",
    iso_639_2: "kik",
    iso_3166_1: "KE",
    flag: "\u{1F1F0}\u{1F1EA}",
    english_name: "Kikuyu; Gikuyu",
    name: "G\u0129k\u0169y\u0169"
  },
  {
    iso_639_1: "kj",
    iso_639_2: "kua",
    iso_3166_1: "AO",
    flag: "\u{1F1E6}\u{1F1F4}",
    english_name: "Kuanyama; Kwanyama",
    name: "Kuanyama"
  },
  {
    iso_639_1: "kk",
    iso_639_2: "kaz",
    iso_3166_1: "KZ",
    flag: "\u{1F1F0}\u{1F1FF}",
    english_name: "Kazakh",
    name: "\u049A\u0430\u0437\u0430\u049B"
  },
  {
    iso_639_1: "kl",
    iso_639_2: "kal",
    iso_3166_1: "GL",
    flag: "\u{1F1EC}\u{1F1F1}",
    english_name: "Kalaallisut; Greenlandic",
    name: "Kalaallisut"
  },
  {
    iso_639_1: "km",
    iso_639_2: "khm",
    iso_3166_1: "KH",
    flag: "\u{1F1F0}\u{1F1ED}",
    english_name: "Central Khmer",
    name: "\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A"
  },
  {
    iso_639_1: "kn",
    iso_639_2: "kan",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Kannada",
    name: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1"
  },
  {
    iso_639_1: "ko",
    iso_639_2: "kor",
    iso_3166_1: "KR",
    flag: "\u{1F1F0}\u{1F1F7}",
    english_name: "Korean",
    name: "\uD55C\uAD6D\uC5B4/\uC870\uC120\uB9D0"
  },
  {
    iso_639_1: "kr",
    iso_639_2: "kau",
    iso_3166_1: "NE",
    flag: "\u{1F1F3}\u{1F1EA}",
    english_name: "Kanuri",
    name: "Kanuri"
  },
  {
    iso_639_1: "ks",
    iso_639_2: "kas",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Kashmiri",
    name: "\u0915\u0936\u094D\u092E\u0940\u0930\u0940"
  },
  {
    iso_639_1: "ku",
    iso_639_2: "kur",
    iso_3166_1: "TR",
    flag: "\u{1F1F9}\u{1F1F7}",
    english_name: "Kurdish",
    name: "Kurd\xEE"
  },
  {
    iso_639_1: "kv",
    iso_639_2: "kom",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Komi",
    name: "\u041A\u043E\u043C\u0438 \u043A\u044B\u0432"
  },
  {
    iso_639_1: "kw",
    iso_639_2: "cor",
    iso_3166_1: "GB",
    flag: "\u{1F1EC}\u{1F1E7}",
    english_name: "Cornish",
    name: "Kernewek"
  },
  {
    iso_639_1: "ky",
    iso_639_2: "kir",
    iso_3166_1: "KG",
    flag: "\u{1F1F0}\u{1F1EC}",
    english_name: "Kirghiz; Kyrgyz",
    name: "\u041A\u044B\u0440\u0433\u044B\u0437\u0447\u0430"
  },
  // L
  {
    iso_639_1: "la",
    iso_639_2: "lat",
    iso_3166_1: "VA",
    flag: "\u{1F1FB}\u{1F1E6}",
    english_name: "Latin",
    name: "Latine"
  },
  {
    iso_639_1: "lb",
    iso_639_2: "ltz",
    iso_3166_1: "LU",
    flag: "\u{1F1F1}\u{1F1FA}",
    english_name: "Luxembourgish; Letzeburgesch",
    name: "L\xEBtzebuergesch"
  },
  {
    iso_639_1: "lg",
    iso_639_2: "lug",
    iso_3166_1: "UG",
    flag: "\u{1F1FA}\u{1F1EC}",
    english_name: "Ganda",
    name: "Luganda"
  },
  {
    iso_639_1: "li",
    iso_639_2: "lim",
    iso_3166_1: "NL",
    flag: "\u{1F1F3}\u{1F1F1}",
    english_name: "Limburgan; Limburger; Limburgish",
    name: "Limburgs"
  },
  {
    iso_639_1: "ln",
    iso_639_2: "lin",
    iso_3166_1: "CD",
    flag: "\u{1F1E8}\u{1F1E9}",
    english_name: "Lingala",
    name: "Ling\xE1la"
  },
  {
    iso_639_1: "lo",
    iso_639_2: "lao",
    iso_3166_1: "LA",
    flag: "\u{1F1F1}\u{1F1E6}",
    english_name: "Lao",
    name: "\u0E9E\u0EB2\u0EAA\u0EB2\u0EA5\u0EB2\u0EA7"
  },
  {
    iso_639_1: "lt",
    iso_639_2: "lit",
    iso_3166_1: "LT",
    flag: "\u{1F1F1}\u{1F1F9}",
    english_name: "Lithuanian",
    name: "Lietuvi\u0173"
  },
  {
    iso_639_1: "lu",
    iso_639_2: "lub",
    iso_3166_1: "CD",
    flag: "\u{1F1E8}\u{1F1E9}",
    english_name: "Luba-Katanga",
    name: "Tshiluba"
  },
  {
    iso_639_1: "lv",
    iso_639_2: "lav",
    iso_3166_1: "LV",
    flag: "\u{1F1F1}\u{1F1FB}",
    english_name: "Latvian",
    name: "Latvie\u0161u"
  },
  // M
  {
    iso_639_1: "mg",
    iso_639_2: "mlg",
    iso_3166_1: "MG",
    flag: "\u{1F1F2}\u{1F1EC}",
    english_name: "Malagasy",
    name: "Malagasy"
  },
  {
    iso_639_1: "mh",
    iso_639_2: "mah",
    iso_3166_1: "MH",
    flag: "\u{1F1F2}\u{1F1ED}",
    english_name: "Marshallese",
    name: "Kajin M\u0327aje\u013C"
  },
  {
    iso_639_1: "mi",
    iso_639_2: "mri",
    iso_3166_1: "NZ",
    flag: "\u{1F1F3}\u{1F1FF}",
    english_name: "Maori",
    name: "Te Reo M\u0101ori"
  },
  {
    iso_639_1: "mk",
    iso_639_2: "mkd",
    iso_3166_1: "MK",
    flag: "\u{1F1F2}\u{1F1F0}",
    english_name: "Macedonian",
    name: "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438 \u0458\u0430\u0437\u0438\u043A"
  },
  {
    iso_639_1: "ml",
    iso_639_2: "mal",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Malayalam",
    name: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02"
  },
  {
    iso_639_1: "mn",
    iso_639_2: "mon",
    iso_3166_1: "MN",
    flag: "\u{1F1F2}\u{1F1F3}",
    english_name: "Mongolian",
    name: "\u041C\u043E\u043D\u0433\u043E\u043B"
  },
  {
    iso_639_1: "mr",
    iso_639_2: "mar",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Marathi",
    name: "\u092E\u0930\u093E\u0920\u0940"
  },
  {
    iso_639_1: "ms",
    iso_639_2: "msa",
    iso_3166_1: "MY",
    flag: "\u{1F1F2}\u{1F1FE}",
    english_name: "Malay",
    name: "Bahasa Melayu"
  },
  {
    iso_639_1: "mt",
    iso_639_2: "mlt",
    iso_3166_1: "MT",
    flag: "\u{1F1F2}\u{1F1F9}",
    english_name: "Maltese",
    name: "Malti"
  },
  {
    iso_639_1: "my",
    iso_639_2: "mya",
    iso_3166_1: "MM",
    flag: "\u{1F1F2}\u{1F1F2}",
    english_name: "Burmese",
    name: "\u1017\u1019\u102C\u1005\u102C"
  },
  // N
  {
    iso_639_1: "na",
    iso_639_2: "nau",
    iso_3166_1: "NR",
    flag: "\u{1F1F3}\u{1F1F7}",
    english_name: "Nauru",
    name: "Dorerin Naoero"
  },
  {
    iso_639_1: "nb",
    iso_639_2: "nob",
    iso_3166_1: "NO",
    flag: "\u{1F1F3}\u{1F1F4}",
    english_name: "Bokm\xE5l, Norwegian; Norwegian Bokm\xE5l",
    internal_english_name: "Norwegian",
    name: "Bokm\xE5l"
  },
  {
    iso_639_1: "nd",
    iso_639_2: "nde",
    iso_3166_1: "ZW",
    flag: "\u{1F1FF}\u{1F1FC}",
    english_name: "Ndebele, North; North Ndebele",
    name: "IsiNdebele"
  },
  {
    iso_639_1: "ne",
    iso_639_2: "nep",
    iso_3166_1: "NP",
    flag: "\u{1F1F3}\u{1F1F5}",
    english_name: "Nepali",
    name: "\u0928\u0947\u092A\u093E\u0932\u0940"
  },
  {
    iso_639_1: "ng",
    iso_639_2: "ndo",
    iso_3166_1: "NA",
    flag: "\u{1F1F3}\u{1F1E6}",
    english_name: "Ndonga",
    name: "Owambo"
  },
  {
    iso_639_1: "nl",
    iso_639_2: "nld",
    iso_3166_1: "NL",
    flag: "\u{1F1F3}\u{1F1F1}",
    flag_priority: true,
    english_name: "Dutch; Flemish",
    name: "Nederlands"
  },
  {
    iso_639_1: "nn",
    iso_639_2: "nno",
    iso_3166_1: "NO",
    flag: "\u{1F1F3}\u{1F1F4}",
    english_name: "Norwegian Nynorsk; Nynorsk, Norwegian",
    internal_english_name: "Norwegian",
    name: "Nynorsk"
  },
  {
    iso_639_1: "no",
    iso_639_2: "nor",
    iso_3166_1: "NO",
    flag: "\u{1F1F3}\u{1F1F4}",
    flag_priority: true,
    english_name: "Norwegian",
    name: "Norsk"
  },
  {
    iso_639_1: "nr",
    iso_639_2: "nbl",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Ndebele, South; South Ndebele",
    name: "IsiNdebele"
  },
  {
    iso_639_1: "nv",
    iso_639_2: "nav",
    iso_3166_1: "US",
    flag: "\u{1F1FA}\u{1F1F8}",
    english_name: "Navajo; Navaho",
    name: "Din\xE9 bizaad"
  },
  {
    iso_639_1: "ny",
    iso_639_2: "nya",
    iso_3166_1: "MW",
    flag: "\u{1F1F2}\u{1F1FC}",
    english_name: "Chichewa; Chewa; Nyanja",
    name: "ChiChe\u0175a"
  },
  // O
  {
    iso_639_1: "oc",
    iso_639_2: "oci",
    iso_3166_1: "FR",
    flag: "\u{1F1EB}\u{1F1F7}",
    english_name: "Occitan (post 1500)",
    name: "Occitan"
  },
  {
    iso_639_1: "oj",
    iso_639_2: "oji",
    iso_3166_1: "CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    english_name: "Ojibwa",
    name: "\u140A\u14C2\u1511\u14C8\u142F\u14A7\u140E\u14D0"
  },
  {
    iso_639_1: "om",
    iso_639_2: "orm",
    iso_3166_1: "ET",
    flag: "\u{1F1EA}\u{1F1F9}",
    english_name: "Oromo",
    name: "Afaan Oromoo"
  },
  {
    iso_639_1: "or",
    iso_639_2: "ori",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Oriya",
    name: "\u0B13\u0B21\u0B3C\u0B3F\u0B06"
  },
  {
    iso_639_1: "os",
    iso_639_2: "oss",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Ossetian; Ossetic",
    name: "\u0418\u0440\u043E\u043D \xE6\u0432\u0437\u0430\u0433"
  },
  // P
  {
    iso_639_1: "pa",
    iso_639_2: "pan",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Panjabi; Punjabi",
    name: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40"
  },
  {
    iso_639_1: "pi",
    iso_639_2: "pli",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Pali",
    name: "\u092A\u093E\u0934\u093F"
  },
  {
    iso_639_1: "pl",
    iso_639_2: "pol",
    iso_3166_1: "PL",
    flag: "\u{1F1F5}\u{1F1F1}",
    english_name: "Polish",
    name: "Polski"
  },
  {
    iso_639_1: "ps",
    iso_639_2: "pus",
    iso_3166_1: "AF",
    flag: "\u{1F1E6}\u{1F1EB}",
    english_name: "Pushto; Pashto",
    name: "\u067E\u069A\u062A\u0648"
  },
  {
    iso_639_1: "pt",
    iso_639_2: "por",
    iso_3166_1: "PT",
    flag: "\u{1F1F5}\u{1F1F9}",
    flag_priority: true,
    english_name: "Portuguese",
    name: "Portugu\xEAs"
  },
  {
    iso_639_1: "pt",
    iso_639_2: "por",
    iso_3166_1: "BR",
    flag: "\u{1F1E7}\u{1F1F7}",
    english_name: "Portuguese (Brazil)",
    internal_english_name: "Portuguese (Brazil)",
    name: "Portugu\xEAs"
  },
  // Q
  {
    iso_639_1: "qu",
    iso_639_2: "que",
    iso_3166_1: "PE",
    flag: "\u{1F1F5}\u{1F1EA}",
    english_name: "Quechua",
    name: "Runa Simi"
  },
  // R
  {
    iso_639_1: "rm",
    iso_639_2: "roh",
    iso_3166_1: "CH",
    flag: "\u{1F1E8}\u{1F1ED}",
    english_name: "Romansh",
    name: "Rumantsch grischun"
  },
  {
    iso_639_1: "rn",
    iso_639_2: "run",
    iso_3166_1: "BI",
    flag: "\u{1F1E7}\u{1F1EE}",
    english_name: "Rundi",
    name: "Kirundi"
  },
  {
    iso_639_1: "ro",
    iso_639_2: "ron",
    iso_3166_1: "RO",
    flag: "\u{1F1F7}\u{1F1F4}",
    english_name: "Romanian",
    name: "Rom\xE2n\u0103"
  },
  {
    iso_639_1: "ru",
    iso_639_2: "rus",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    flag_priority: true,
    english_name: "Russian",
    name: "P\u0443\u0441\u0441\u043A\u0438\u0439"
  },
  {
    iso_639_1: "rw",
    iso_639_2: "kin",
    iso_3166_1: "RW",
    flag: "\u{1F1F7}\u{1F1FC}",
    english_name: "Kinyarwanda",
    name: "Ikinyarwanda"
  },
  // S
  {
    iso_639_1: "sa",
    iso_639_2: "san",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Sanskrit",
    name: "\u0938\u0902\u0938\u094D\u0915\u0943\u0924\u092E\u094D"
  },
  {
    iso_639_1: "sc",
    iso_639_2: "srd",
    iso_3166_1: "IT",
    flag: "\u{1F1EE}\u{1F1F9}",
    english_name: "Sardinian",
    name: "Sardu"
  },
  {
    iso_639_1: "sd",
    iso_639_2: "snd",
    iso_3166_1: "PK",
    flag: "\u{1F1F5}\u{1F1F0}",
    english_name: "Sindhi",
    name: "\u0938\u093F\u0928\u094D\u0927\u0940"
  },
  {
    iso_639_1: "se",
    iso_639_2: "sme",
    iso_3166_1: "NO",
    flag: "\u{1F1F3}\u{1F1F4}",
    english_name: "Northern Sami",
    name: "Davvis\xE1megiella"
  },
  {
    iso_639_1: "sg",
    iso_639_2: "sag",
    iso_3166_1: "CF",
    flag: "\u{1F1E8}\u{1F1EB}",
    english_name: "Sango",
    name: "Y\xE2ng\xE2 t\xEE s\xE4ng\xF6"
  },
  {
    iso_639_1: "sh",
    iso_639_2: "hbs",
    iso_3166_1: "RS",
    flag: "\u{1F1F7}\u{1F1F8}",
    english_name: "Serbo-Croatian",
    name: "Srpskohrvatski"
  },
  {
    iso_639_1: "si",
    iso_639_2: "sin",
    iso_3166_1: "LK",
    flag: "\u{1F1F1}\u{1F1F0}",
    english_name: "Sinhala; Sinhalese",
    name: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD"
  },
  {
    iso_639_1: "sk",
    iso_639_2: "slk",
    iso_3166_1: "SK",
    flag: "\u{1F1F8}\u{1F1F0}",
    flag_priority: true,
    english_name: "Slovak",
    name: "Sloven\u010Dina"
  },
  {
    iso_639_1: "sl",
    iso_639_2: "slv",
    iso_3166_1: "SI",
    flag: "\u{1F1F8}\u{1F1EE}",
    english_name: "Slovenian",
    name: "Sloven\u0161\u010Dina"
  },
  {
    iso_639_1: "sm",
    iso_639_2: "smo",
    iso_3166_1: "WS",
    flag: "\u{1F1FC}\u{1F1F8}",
    english_name: "Samoan",
    name: "Gagana fa'a Samoa"
  },
  {
    iso_639_1: "sn",
    iso_639_2: "sna",
    iso_3166_1: "ZW",
    flag: "\u{1F1FF}\u{1F1FC}",
    english_name: "Shona",
    name: "ChiShona"
  },
  {
    iso_639_1: "so",
    iso_639_2: "som",
    iso_3166_1: "SO",
    flag: "\u{1F1F8}\u{1F1F4}",
    english_name: "Somali",
    name: "Af Soomaali"
  },
  {
    iso_639_1: "sq",
    iso_639_2: "sqi",
    iso_3166_1: "AL",
    flag: "\u{1F1E6}\u{1F1F1}",
    english_name: "Albanian",
    name: "Shqip"
  },
  {
    iso_639_1: "sr",
    iso_639_2: "srp",
    iso_3166_1: "RS",
    flag: "\u{1F1F7}\u{1F1F8}",
    flag_priority: true,
    english_name: "Serbian",
    name: "Srpski"
  },
  {
    iso_639_1: "ss",
    iso_639_2: "ssw",
    iso_3166_1: "SZ",
    flag: "\u{1F1F8}\u{1F1FF}",
    english_name: "Swati",
    name: "SiSwati"
  },
  {
    iso_639_1: "st",
    iso_639_2: "sot",
    iso_3166_1: "LS",
    flag: "\u{1F1F1}\u{1F1F8}",
    english_name: "Sotho, Southern",
    name: "Sesotho"
  },
  {
    iso_639_1: "su",
    iso_639_2: "sun",
    iso_3166_1: "ID",
    flag: "\u{1F1EE}\u{1F1E9}",
    english_name: "Sundanese",
    name: "Basa Sunda"
  },
  {
    iso_639_1: "sv",
    iso_639_2: "swe",
    iso_3166_1: "SE",
    flag: "\u{1F1F8}\u{1F1EA}",
    english_name: "Swedish",
    name: "Svenska"
  },
  {
    iso_639_1: "sw",
    iso_639_2: "swa",
    iso_3166_1: "KE",
    flag: "\u{1F1F0}\u{1F1EA}",
    english_name: "Swahili",
    name: "Kiswahili"
  },
  // T
  {
    iso_639_1: "ta",
    iso_639_2: "tam",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Tamil",
    name: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD"
  },
  {
    iso_639_1: "te",
    iso_639_2: "tel",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Telugu",
    name: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41"
  },
  {
    iso_639_1: "tg",
    iso_639_2: "tgk",
    iso_3166_1: "TJ",
    flag: "\u{1F1F9}\u{1F1EF}",
    english_name: "Tajik",
    name: "\u0442\u043E\u04B7\u0438\u043A\u04E3"
  },
  {
    iso_639_1: "th",
    iso_639_2: "tha",
    iso_3166_1: "TH",
    flag: "\u{1F1F9}\u{1F1ED}",
    english_name: "Thai",
    name: "\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22"
  },
  {
    iso_639_1: "ti",
    iso_639_2: "tir",
    iso_3166_1: "ER",
    flag: "\u{1F1EA}\u{1F1F7}",
    english_name: "Tigrinya",
    name: "\u1275\u130D\u122D\u129B"
  },
  {
    iso_639_1: "tk",
    iso_639_2: "tuk",
    iso_3166_1: "TM",
    flag: "\u{1F1F9}\u{1F1F2}",
    english_name: "Turkmen",
    name: "T\xFCrkmen"
  },
  {
    iso_639_1: "tl",
    iso_639_2: "tgl",
    iso_3166_1: "PH",
    flag: "\u{1F1F5}\u{1F1ED}",
    english_name: "Tagalog",
    name: "Wikang Tagalog"
  },
  {
    iso_639_1: "tn",
    iso_639_2: "tsn",
    iso_3166_1: "BW",
    flag: "\u{1F1E7}\u{1F1FC}",
    english_name: "Tswana",
    name: "Setswana"
  },
  {
    iso_639_1: "to",
    iso_639_2: "ton",
    iso_3166_1: "TO",
    flag: "\u{1F1F9}\u{1F1F4}",
    english_name: "Tonga (Tonga Islands)",
    name: "Faka Tonga"
  },
  {
    iso_639_1: "tr",
    iso_639_2: "tur",
    iso_3166_1: "TR",
    flag: "\u{1F1F9}\u{1F1F7}",
    english_name: "Turkish",
    name: "T\xFCrk\xE7e"
  },
  {
    iso_639_1: "ts",
    iso_639_2: "tso",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Tsonga",
    name: "Xitsonga"
  },
  {
    iso_639_1: "tt",
    iso_639_2: "tat",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Tatar",
    name: "\u0422\u0430\u0442\u0430\u0440 \u0442\u0435\u043B\u0435"
  },
  {
    iso_639_1: "tw",
    iso_639_2: "twi",
    iso_3166_1: "GH",
    flag: "\u{1F1EC}\u{1F1ED}",
    english_name: "Twi",
    name: "Twi"
  },
  {
    iso_639_1: "ty",
    iso_639_2: "tah",
    iso_3166_1: "PF",
    flag: "\u{1F1F5}\u{1F1EB}",
    english_name: "Tahitian",
    name: "Reo Tahiti"
  },
  // U
  {
    iso_639_1: "ug",
    iso_639_2: "uig",
    iso_3166_1: "CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    english_name: "Uighur; Uyghur",
    name: "Uy\u01A3urq\u0259"
  },
  {
    iso_639_1: "uk",
    iso_639_2: "ukr",
    iso_3166_1: "UA",
    flag: "\u{1F1FA}\u{1F1E6}",
    english_name: "Ukrainian",
    name: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0438\u0439"
  },
  {
    iso_639_1: "ur",
    iso_639_2: "urd",
    iso_3166_1: "PK",
    flag: "\u{1F1F5}\u{1F1F0}",
    english_name: "Urdu",
    name: "\u0627\u0631\u062F\u0648"
  },
  {
    iso_639_1: "uz",
    iso_639_2: "uzb",
    iso_3166_1: "UZ",
    flag: "\u{1F1FA}\u{1F1FF}",
    english_name: "Uzbek",
    name: "O\u02BBzbek"
  },
  // V
  {
    iso_639_1: "ve",
    iso_639_2: "ven",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Venda",
    name: "Tshiven\u1E13a"
  },
  {
    iso_639_1: "vi",
    iso_639_2: "vie",
    iso_3166_1: "VN",
    flag: "\u{1F1FB}\u{1F1F3}",
    english_name: "Vietnamese",
    name: "Ti\u1EBFng Vi\u1EC7t"
  },
  {
    iso_639_1: "vo",
    iso_639_2: "vol",
    iso_3166_1: null,
    flag: "\u{1F310}",
    english_name: "Volap\xFCk",
    name: "Volap\xFCk"
  },
  // W
  {
    iso_639_1: "wa",
    iso_639_2: "wln",
    iso_3166_1: "BE",
    flag: "\u{1F1E7}\u{1F1EA}",
    english_name: "Walloon",
    name: "Walon"
  },
  {
    iso_639_1: "wo",
    iso_639_2: "wol",
    iso_3166_1: "SN",
    flag: "\u{1F1F8}\u{1F1F3}",
    english_name: "Wolof",
    name: "Wolof"
  },
  // X
  {
    iso_639_1: "xh",
    iso_639_2: "xho",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Xhosa",
    name: "IsiXhosa"
  },
  // Y
  {
    iso_639_1: "yi",
    iso_639_2: "yid",
    iso_3166_1: "IL",
    flag: "\u{1F1EE}\u{1F1F1}",
    english_name: "Yiddish",
    name: "\u05D9\u05D9\u05B4\u05D3\u05D9\u05E9"
  },
  {
    iso_639_1: "yo",
    iso_639_2: "yor",
    iso_3166_1: "NG",
    flag: "\u{1F1F3}\u{1F1EC}",
    english_name: "Yoruba",
    name: "\xC8d\xE8 Yor\xF9b\xE1"
  },
  // Z
  {
    iso_639_1: "za",
    iso_639_2: "zha",
    iso_3166_1: "CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    english_name: "Zhuang; Chuang",
    name: "Sa\u026F cue\u014B\u0185"
  },
  {
    iso_639_1: "zh",
    iso_639_2: "zho",
    iso_3166_1: "CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    flag_priority: true,
    english_name: "Chinese (Simplified)",
    name: "\u4E2D\u6587 (\u7B80\u4F53)"
  },
  {
    iso_639_1: "zh",
    iso_639_2: "zho",
    iso_3166_1: "TW",
    flag: "\u{1F1F9}\u{1F1FC}",
    english_name: "Chinese (Traditional)",
    name: "\u4E2D\u6587 (\u7E41\u9AD4)"
  },
  {
    iso_639_1: "zh",
    iso_639_2: "zho",
    iso_3166_1: "HK",
    flag: "\u{1F1ED}\u{1F1F0}",
    english_name: "Chinese (Hong Kong)",
    name: "\u4E2D\u6587 (\u9999\u6E2F)"
  },
  {
    iso_639_1: "zh",
    iso_639_2: "zho",
    iso_3166_1: "SG",
    flag: "\u{1F1F8}\u{1F1EC}",
    english_name: "Chinese (Singapore)",
    name: "\u4E2D\u6587 (\u65B0\u52A0\u5761)"
  },
  {
    iso_639_1: "zu",
    iso_639_2: "zul",
    iso_3166_1: "ZA",
    flag: "\u{1F1FF}\u{1F1E6}",
    english_name: "Zulu",
    name: "IsiZulu"
  },
  // Additional languages not in your original list but commonly used
  {
    iso_639_1: "sw",
    iso_639_2: "swa",
    iso_3166_1: "TZ",
    flag: "\u{1F1F9}\u{1F1FF}",
    english_name: "Swahili (Tanzania)",
    name: "Kiswahili"
  },
  {
    iso_639_1: "fr",
    iso_639_2: "fra",
    iso_3166_1: "CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    english_name: "French (Canada)",
    name: "Fran\xE7ais"
  },
  {
    iso_639_1: "fr",
    iso_639_2: "fra",
    iso_3166_1: "BE",
    flag: "\u{1F1E7}\u{1F1EA}",
    english_name: "French (Belgium)",
    name: "Fran\xE7ais"
  },
  {
    iso_639_1: "fr",
    iso_639_2: "fra",
    iso_3166_1: "CH",
    flag: "\u{1F1E8}\u{1F1ED}",
    english_name: "French (Switzerland)",
    name: "Fran\xE7ais"
  },
  {
    iso_639_1: "de",
    iso_639_2: "deu",
    iso_3166_1: "AT",
    flag: "\u{1F1E6}\u{1F1F9}",
    english_name: "German (Austria)",
    name: "Deutsch"
  },
  {
    iso_639_1: "de",
    iso_639_2: "deu",
    iso_3166_1: "CH",
    flag: "\u{1F1E8}\u{1F1ED}",
    english_name: "German (Switzerland)",
    name: "Deutsch"
  },
  {
    iso_639_1: "it",
    iso_639_2: "ita",
    iso_3166_1: "CH",
    flag: "\u{1F1E8}\u{1F1ED}",
    english_name: "Italian (Switzerland)",
    name: "Italiano"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "MX",
    flag: "\u{1F1F2}\u{1F1FD}",
    english_name: "Spanish (Mexico)",
    internal_english_name: "Latino",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "AR",
    flag: "\u{1F1E6}\u{1F1F7}",
    english_name: "Spanish (Argentina)",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "CO",
    flag: "\u{1F1E8}\u{1F1F4}",
    english_name: "Spanish (Colombia)",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "CL",
    flag: "\u{1F1E8}\u{1F1F1}",
    english_name: "Spanish (Chile)",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "PE",
    flag: "\u{1F1F5}\u{1F1EA}",
    english_name: "Spanish (Peru)",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "es",
    iso_639_2: "spa",
    iso_3166_1: "VE",
    flag: "\u{1F1FB}\u{1F1EA}",
    english_name: "Spanish (Venezuela)",
    name: "Espa\xF1ol"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "MA",
    flag: "\u{1F1F2}\u{1F1E6}",
    english_name: "Arabic (Morocco)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "DZ",
    flag: "\u{1F1E9}\u{1F1FF}",
    english_name: "Arabic (Algeria)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "TN",
    flag: "\u{1F1F9}\u{1F1F3}",
    english_name: "Arabic (Tunisia)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "LY",
    flag: "\u{1F1F1}\u{1F1FE}",
    english_name: "Arabic (Libya)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "JO",
    flag: "\u{1F1EF}\u{1F1F4}",
    english_name: "Arabic (Jordan)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "SY",
    flag: "\u{1F1F8}\u{1F1FE}",
    english_name: "Arabic (Syria)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "LB",
    flag: "\u{1F1F1}\u{1F1E7}",
    english_name: "Arabic (Lebanon)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "IQ",
    flag: "\u{1F1EE}\u{1F1F6}",
    english_name: "Arabic (Iraq)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "KW",
    flag: "\u{1F1F0}\u{1F1FC}",
    english_name: "Arabic (Kuwait)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "BH",
    flag: "\u{1F1E7}\u{1F1ED}",
    english_name: "Arabic (Bahrain)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "QA",
    flag: "\u{1F1F6}\u{1F1E6}",
    english_name: "Arabic (Qatar)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "OM",
    flag: "\u{1F1F4}\u{1F1F2}",
    english_name: "Arabic (Oman)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "YE",
    flag: "\u{1F1FE}\u{1F1EA}",
    english_name: "Arabic (Yemen)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  {
    iso_639_1: "ar",
    iso_639_2: "ara",
    iso_3166_1: "SD",
    flag: "\u{1F1F8}\u{1F1E9}",
    english_name: "Arabic (Sudan)",
    name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  },
  // Languages without ISO 639-1 codes but with ISO 639-2 codes
  {
    iso_639_1: null,
    iso_639_2: "ace",
    iso_3166_1: "ID",
    flag: "\u{1F1EE}\u{1F1E9}",
    english_name: "Achinese",
    name: "Bahsa Ac\xE8h"
  },
  {
    iso_639_1: null,
    iso_639_2: "ach",
    iso_3166_1: "UG",
    flag: "\u{1F1FA}\u{1F1EC}",
    english_name: "Acoli",
    name: "Lwo"
  },
  {
    iso_639_1: null,
    iso_639_2: "ada",
    iso_3166_1: "GH",
    flag: "\u{1F1EC}\u{1F1ED}",
    english_name: "Adangme",
    name: "Adangme"
  },
  {
    iso_639_1: null,
    iso_639_2: "ady",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Adyghe; Adygei",
    name: "\u0410\u0434\u044B\u0433\u044D\u0431\u0437\u044D"
  },
  {
    iso_639_1: null,
    iso_639_2: "afa",
    iso_3166_1: "ET",
    flag: "\u{1F1EA}\u{1F1F9}",
    english_name: "Afro-Asiatic languages",
    name: "Afro-Asiatic"
  },
  {
    iso_639_1: null,
    iso_639_2: "afh",
    iso_3166_1: "GH",
    flag: "\u{1F1EC}\u{1F1ED}",
    english_name: "Afrihili",
    name: "Afrihili"
  },
  {
    iso_639_1: null,
    iso_639_2: "agq",
    iso_3166_1: "CM",
    flag: "\u{1F1E8}\u{1F1F2}",
    english_name: "Aghem",
    name: "Aghem"
  },
  {
    iso_639_1: null,
    iso_639_2: "ain",
    iso_3166_1: "JP",
    flag: "\u{1F1EF}\u{1F1F5}",
    english_name: "Ainu",
    name: "\u30A2\u30A4\u30CC \u30A4\u30BF\u31F0"
  },
  {
    iso_639_1: null,
    iso_639_2: "akk",
    iso_3166_1: "IQ",
    flag: "\u{1F1EE}\u{1F1F6}",
    english_name: "Akkadian",
    name: "Akkadian"
  },
  {
    iso_639_1: null,
    iso_639_2: "ale",
    iso_3166_1: "US",
    flag: "\u{1F1FA}\u{1F1F8}",
    english_name: "Aleut",
    name: "Unangam Tunuu"
  },
  {
    iso_639_1: null,
    iso_639_2: "alt",
    iso_3166_1: "RU",
    flag: "\u{1F1F7}\u{1F1FA}",
    english_name: "Southern Altai",
    name: "\u0410\u043B\u0442\u0430\u0439 \u0442\u0438\u043B"
  },
  {
    iso_639_1: null,
    iso_639_2: "ang",
    iso_3166_1: "GB",
    flag: "\u{1F1EC}\u{1F1E7}",
    english_name: "English, Old (ca.450-1100)",
    name: "Englisc"
  },
  {
    iso_639_1: null,
    iso_639_2: "anp",
    iso_3166_1: "IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    english_name: "Angika",
    name: "\u0905\u0902\u0917\u093F\u0915\u093E"
  },
  {
    iso_639_1: null,
    iso_639_2: "arc",
    iso_3166_1: "SY",
    flag: "\u{1F1F8}\u{1F1FE}",
    english_name: "Aramaic",
    name: "\u0710\u072A\u0721\u071D\u0710"
  },
  {
    iso_639_1: null,
    iso_639_2: "arn",
    iso_3166_1: "CL",
    flag: "\u{1F1E8}\u{1F1F1}",
    english_name: "Mapudungun; Mapuche",
    name: "Mapudungun"
  },
  {
    iso_639_1: null,
    iso_639_2: "arp",
    iso_3166_1: "US",
    flag: "\u{1F1FA}\u{1F1F8}",
    english_name: "Arapaho",
    name: "Hin\xF3no\u02BCeit\xED\xEDt"
  },
  {
    iso_639_1: null,
    iso_639_2: "arw",
    iso_3166_1: "GY",
    flag: "\u{1F1EC}\u{1F1FE}",
    english_name: "Arawak",
    name: "Arawak"
  },
  {
    iso_639_1: null,
    iso_639_2: "ast",
    iso_3166_1: "ES",
    flag: "\u{1F1EA}\u{1F1F8}",
    english_name: "Asturian; Bable; Leonese; Asturleonese",
    name: "Asturianu"
  }
];
var LANGUAGES = [
  "English",
  "Japanese",
  "Chinese",
  "Russian",
  "Arabic",
  "Portuguese",
  "Portuguese (Brazil)",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Korean",
  "Hindi",
  "Bengali",
  "Punjabi",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Turkish",
  "Hebrew",
  "Persian",
  "Ukrainian",
  "Greek",
  "Lithuanian",
  "Latvian",
  "Estonian",
  "Polish",
  "Czech",
  "Slovak",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Serbian",
  "Croatian",
  "Slovenian",
  "Dutch",
  "Danish",
  "Finnish",
  "Swedish",
  "Norwegian",
  "Malay",
  "Latino",
  "Dual Audio",
  "Dubbed",
  "Multi",
  "Original",
  "Unknown"
];

// vendor/aiostreams-source/utils/constants.ts
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
  ErrorCode2["USER_INVALID_DETAILS"] = "USER_INVALID_DETAILS";
  ErrorCode2["USER_INVALID_CONFIG"] = "USER_INVALID_CONFIG";
  ErrorCode2["USER_NEW_PASSWORD_TOO_SHORT"] = "USER_NEW_PASSWORD_TOO_SHORT";
  ErrorCode2["USER_NEW_PASSWORD_TOO_SIMPLE"] = "USER_NEW_PASSWORD_TOO_SIMPLE";
  ErrorCode2["ADDON_PASSWORD_INVALID"] = "ADDON_PASSWORD_INVALID";
  ErrorCode2["PARENT_CONFIG_SELF_REFERENCE"] = "PARENT_CONFIG_SELF_REFERENCE";
  ErrorCode2["PARENT_CONFIG_UNAVAILABLE"] = "PARENT_CONFIG_UNAVAILABLE";
  ErrorCode2["DATABASE_ERROR"] = "DATABASE_ERROR";
  ErrorCode2["ENCRYPTION_ERROR"] = "ENCRYPTION_ERROR";
  ErrorCode2["FORMAT_INVALID_FORMATTER"] = "FORMAT_INVALID_FORMATTER";
  ErrorCode2["FORMAT_INVALID_STREAM"] = "FORMAT_INVALID_STREAM";
  ErrorCode2["FORMAT_ERROR"] = "FORMAT_ERROR";
  ErrorCode2["MISSING_REQUIRED_FIELDS"] = "MISSING_REQUIRED_FIELDS";
  ErrorCode2["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
  ErrorCode2["METHOD_NOT_ALLOWED"] = "METHOD_NOT_ALLOWED";
  ErrorCode2["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
  ErrorCode2["BAD_REQUEST"] = "BAD_REQUEST";
  ErrorCode2["UNAUTHORIZED"] = "UNAUTHORIZED";
  ErrorCode2["FORBIDDEN"] = "FORBIDDEN";
  ErrorCode2["OIDC_DISABLED"] = "OIDC_DISABLED";
  ErrorCode2["OIDC_NOT_CONFIGURED"] = "OIDC_NOT_CONFIGURED";
  ErrorCode2["OIDC_DISCOVERY_FAILED"] = "OIDC_DISCOVERY_FAILED";
  ErrorCode2["OIDC_STATE_INVALID"] = "OIDC_STATE_INVALID";
  ErrorCode2["OIDC_DENIED"] = "OIDC_DENIED";
  ErrorCode2["OIDC_EXCHANGE_FAILED"] = "OIDC_EXCHANGE_FAILED";
  ErrorCode2["OIDC_CLAIMS_INVALID"] = "OIDC_CLAIMS_INVALID";
  ErrorCode2["OIDC_USERNAME_CONFLICT"] = "OIDC_USERNAME_CONFLICT";
  ErrorCode2["OIDC_NO_PERMISSIONS"] = "OIDC_NO_PERMISSIONS";
  ErrorCode2["COMMUNITY_DISABLED"] = "COMMUNITY_DISABLED";
  ErrorCode2["COMMUNITY_BLOCKED"] = "COMMUNITY_BLOCKED";
  ErrorCode2["COMMUNITY_ACCOUNT_TOO_NEW"] = "COMMUNITY_ACCOUNT_TOO_NEW";
  ErrorCode2["COMMUNITY_SUBMISSION_LIMIT"] = "COMMUNITY_SUBMISSION_LIMIT";
  ErrorCode2["COMMUNITY_INVALID_ITEM"] = "COMMUNITY_INVALID_ITEM";
  ErrorCode2["COMMUNITY_NOT_FOUND"] = "COMMUNITY_NOT_FOUND";
  ErrorCode2["COMMUNITY_ALREADY_LIKED"] = "COMMUNITY_ALREADY_LIKED";
  ErrorCode2["COMMUNITY_VERSION_NOT_NEWER"] = "COMMUNITY_VERSION_NOT_NEWER";
  return ErrorCode2;
})(ErrorCode || {});
var ErrorMap = {
  ["MISSING_REQUIRED_FIELDS" /* MISSING_REQUIRED_FIELDS */]: {
    statusCode: 400,
    message: "Required fields are missing"
  },
  ["USER_ALREADY_EXISTS" /* USER_ALREADY_EXISTS */]: {
    statusCode: 409,
    message: "User already exists"
  },
  ["USER_INVALID_DETAILS" /* USER_INVALID_DETAILS */]: {
    statusCode: 400,
    message: "Invalid UUID or password"
  },
  ["USER_INVALID_CONFIG" /* USER_INVALID_CONFIG */]: {
    statusCode: 400,
    message: "The config for this user is invalid"
  },
  ["USER_NEW_PASSWORD_TOO_SHORT" /* USER_NEW_PASSWORD_TOO_SHORT */]: {
    statusCode: 400,
    message: "New password is too short"
  },
  ["USER_NEW_PASSWORD_TOO_SIMPLE" /* USER_NEW_PASSWORD_TOO_SIMPLE */]: {
    statusCode: 400,
    message: "New password is too simple"
  },
  ["ADDON_PASSWORD_INVALID" /* ADDON_PASSWORD_INVALID */]: {
    statusCode: 401,
    message: "Invalid addon password"
  },
  ["PARENT_CONFIG_SELF_REFERENCE" /* PARENT_CONFIG_SELF_REFERENCE */]: {
    statusCode: 400,
    message: "A config cannot inherit from itself"
  },
  ["PARENT_CONFIG_UNAVAILABLE" /* PARENT_CONFIG_UNAVAILABLE */]: {
    statusCode: 400,
    message: "The parent config could not be loaded"
  },
  ["DATABASE_ERROR" /* DATABASE_ERROR */]: {
    statusCode: 500,
    message: "A database error occurred"
  },
  ["ENCRYPTION_ERROR" /* ENCRYPTION_ERROR */]: {
    statusCode: 500,
    message: "An error occurred in the encryption service"
  },
  ["INTERNAL_SERVER_ERROR" /* INTERNAL_SERVER_ERROR */]: {
    statusCode: 500,
    message: "An unexpected error occurred"
  },
  ["METHOD_NOT_ALLOWED" /* METHOD_NOT_ALLOWED */]: {
    statusCode: 405,
    message: "Method not allowed"
  },
  ["RATE_LIMIT_EXCEEDED" /* RATE_LIMIT_EXCEEDED */]: {
    statusCode: 429,
    message: "Too many requests from this IP, please try again later."
  },
  ["FORMAT_INVALID_FORMATTER" /* FORMAT_INVALID_FORMATTER */]: {
    statusCode: 400,
    message: "Invalid formatter"
  },
  ["FORMAT_INVALID_STREAM" /* FORMAT_INVALID_STREAM */]: {
    statusCode: 400,
    message: "Invalid stream"
  },
  ["FORMAT_ERROR" /* FORMAT_ERROR */]: {
    statusCode: 500,
    message: "An error occurred while formatting the stream"
  },
  ["BAD_REQUEST" /* BAD_REQUEST */]: {
    statusCode: 400,
    message: "Bad request"
  },
  ["UNAUTHORIZED" /* UNAUTHORIZED */]: {
    statusCode: 401,
    message: "Unauthorized"
  },
  ["FORBIDDEN" /* FORBIDDEN */]: {
    statusCode: 403,
    message: "Forbidden"
  },
  ["OIDC_DISABLED" /* OIDC_DISABLED */]: {
    statusCode: 404,
    message: "SSO login is not enabled on this instance"
  },
  ["OIDC_NOT_CONFIGURED" /* OIDC_NOT_CONFIGURED */]: {
    statusCode: 503,
    message: "SSO login is enabled but not fully configured"
  },
  ["OIDC_DISCOVERY_FAILED" /* OIDC_DISCOVERY_FAILED */]: {
    statusCode: 502,
    message: "Could not reach the SSO provider"
  },
  ["OIDC_STATE_INVALID" /* OIDC_STATE_INVALID */]: {
    statusCode: 400,
    message: "The login attempt expired or could not be verified"
  },
  ["OIDC_DENIED" /* OIDC_DENIED */]: {
    statusCode: 403,
    message: "The SSO provider denied the login request"
  },
  ["OIDC_EXCHANGE_FAILED" /* OIDC_EXCHANGE_FAILED */]: {
    statusCode: 502,
    message: "The SSO provider rejected the login"
  },
  ["OIDC_CLAIMS_INVALID" /* OIDC_CLAIMS_INVALID */]: {
    statusCode: 502,
    message: "The SSO provider did not return the expected user details"
  },
  ["OIDC_USERNAME_CONFLICT" /* OIDC_USERNAME_CONFLICT */]: {
    statusCode: 409,
    message: "This SSO username collides with a local user"
  },
  ["OIDC_NO_PERMISSIONS" /* OIDC_NO_PERMISSIONS */]: {
    statusCode: 403,
    message: "Your account is not mapped to any AIOStreams permissions"
  },
  ["COMMUNITY_DISABLED" /* COMMUNITY_DISABLED */]: {
    statusCode: 403,
    message: "Community sharing is disabled on this instance"
  },
  ["COMMUNITY_BLOCKED" /* COMMUNITY_BLOCKED */]: {
    statusCode: 403,
    message: "You have been blocked from community sharing on this instance"
  },
  ["COMMUNITY_ACCOUNT_TOO_NEW" /* COMMUNITY_ACCOUNT_TOO_NEW */]: {
    statusCode: 403,
    message: "This configuration is too new to take part in community sharing"
  },
  ["COMMUNITY_SUBMISSION_LIMIT" /* COMMUNITY_SUBMISSION_LIMIT */]: {
    statusCode: 429,
    message: "You have reached the daily submission limit"
  },
  ["COMMUNITY_INVALID_ITEM" /* COMMUNITY_INVALID_ITEM */]: {
    statusCode: 400,
    message: "The submitted item is invalid"
  },
  ["COMMUNITY_NOT_FOUND" /* COMMUNITY_NOT_FOUND */]: {
    statusCode: 404,
    message: "That community item does not exist"
  },
  ["COMMUNITY_ALREADY_LIKED" /* COMMUNITY_ALREADY_LIKED */]: {
    statusCode: 409,
    message: "This item has already been liked from your network"
  },
  ["COMMUNITY_VERSION_NOT_NEWER" /* COMMUNITY_VERSION_NOT_NEWER */]: {
    statusCode: 400,
    message: "The version must be higher than the published one"
  }
};
var APIError = class extends Error {
  constructor(code, statusCode = ErrorMap[code].statusCode, message) {
    super(message || ErrorMap[code].message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "APIError";
  }
  code;
  statusCode;
};
var HEADERS_FOR_IP_FORWARDING = [
  "X-Client-IP",
  "X-Forwarded-For",
  "X-Real-IP",
  "True-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "X-AIOStreams-User-IP"
];
var INTERNAL_SECRET_HEADER = Buffer.from(
  "WC1BSU9TdHJlYW1zLUludGVybmFsLVNlY3JldA==",
  "base64"
).toString("utf8");
var API_VERSION = 1;
var REDIS_PREFIX = "aiostreams:";
var DEFAULT_PRECACHE_SELECTOR = "count(cached(streams)) == 0 ? uncached(streams) : []";
var DEFAULT_PRELOAD_SELECTOR = "slice(streams, 0, 2)";
var DEFAULT_FAILOVER_CONTENT_TYPES = ["usenet"];
var DEFAULT_FAILOVER_MAX_ATTEMPTS = 3;
var DEFAULT_FAILOVER_PARALLEL = 1;
var DEFAULT_FAILOVER_STAGGER_MS = 1e3;
var DEFAULT_FAILOVER_MAX_WAIT_MS = 3e4;
var DEFAULT_FAILOVER_PREFERRED_GRACE_MS = 2e3;
var INTERNAL_PROXY_MARKER = "from_proxy";
var PLAY_PATH_MARKER = "via";
var BUILTIN_PROXY_PATH_PREFIX = "/api/v1/proxy/";
var DEFAULT_FAILOVER_INCLUDE_EXTERNAL = false;
var DEFAULT_FAILOVER_SAME_RELEASE_LIMIT = 2;
var DEFAULT_FAILOVER_DUPLICATE_STAGGER_MS = 0;
var DEFAULT_FAILOVER_ONLY_SAME_RELEASE = false;
var DEDUPLICATOR_MERGE_FIELDS = [
  "languages",
  "subtitles",
  "library",
  "seadex",
  "sizes",
  "idMatched"
];
var GDRIVE_FORMATTER = "gdrive";
var LIGHT_GDRIVE_FORMATTER = "lightgdrive";
var MINIMALISTIC_GDRIVE_FORMATTER = "minimalisticgdrive";
var TORRENTIO_FORMATTER = "torrentio";
var TORBOX_FORMATTER = "torbox";
var PRISM_FORMATTER = "prism";
var TAMTARO_FORMATTER = "tamtaro";
var CUSTOM_FORMATTER = "custom";
var FORMATTERS = [
  GDRIVE_FORMATTER,
  PRISM_FORMATTER,
  TAMTARO_FORMATTER,
  LIGHT_GDRIVE_FORMATTER,
  MINIMALISTIC_GDRIVE_FORMATTER,
  TORRENTIO_FORMATTER,
  TORBOX_FORMATTER,
  CUSTOM_FORMATTER
];
var FORMATTER_DETAILS = {
  [GDRIVE_FORMATTER]: {
    id: GDRIVE_FORMATTER,
    name: "Google Drive",
    description: "Uses the formatting from the Stremio GDrive addon"
  },
  [PRISM_FORMATTER]: {
    id: PRISM_FORMATTER,
    name: "Prism",
    description: "An aesthetic formatter with every detail within 5 lines."
  },
  [TAMTARO_FORMATTER]: {
    id: TAMTARO_FORMATTER,
    name: "Tamtaro",
    description: "From Tamtaro's setup. Smartly detects status for cached (\u26A1/\u23F3), proxied (\u26CA/\u26C9), library (\u2601\uFE0E/\u270E), season packs (\u2756/\u25C8) and HDR/DV (\u2726/\u2727). The last line in s\u1D0D\u1D00\u029F\u029F \u1D04\u1D00\u1D18s displays your preferred language options, Usenet's health (\u2611 \u0274\u1D22\u0299), SeaDex (\u1D00\u029F\u1D1B/\u0299\u1D07s\u1D1B \u0280\u1D07\u029F\u1D07\u1D00s\u1D07), networks, special editions and attributes via ranked stream expressions."
  },
  [LIGHT_GDRIVE_FORMATTER]: {
    id: LIGHT_GDRIVE_FORMATTER,
    name: "Light Google Drive",
    description: "A lighter version of the GDrive formatter, focused on asthetics"
  },
  [MINIMALISTIC_GDRIVE_FORMATTER]: {
    id: MINIMALISTIC_GDRIVE_FORMATTER,
    name: "Minimalistic",
    description: "A minimalistic formatter which shows only the bare minimum"
  },
  [TORRENTIO_FORMATTER]: {
    id: TORRENTIO_FORMATTER,
    name: "Torrentio",
    description: "Uses the formatting from the Torrentio addon"
  },
  [TORBOX_FORMATTER]: {
    id: TORBOX_FORMATTER,
    name: "Torbox",
    description: "Uses the formatting from the TorBox Stremio addon"
  },
  [CUSTOM_FORMATTER]: {
    id: CUSTOM_FORMATTER,
    name: "Custom",
    description: "Define your own formatter"
  }
};
var REALDEBRID_SERVICE = "realdebrid";
var DEBRIDLINK_SERVICE = "debridlink";
var PREMIUMIZE_SERVICE = "premiumize";
var ALLDEBRID_SERVICE = "alldebrid";
var TORBOX_SERVICE = "torbox";
var EASYDEBRID_SERVICE = "easydebrid";
var DEBRIDER_SERVICE = "debrider";
var PUTIO_SERVICE = "putio";
var PIKPAK_SERVICE = "pikpak";
var OFFCLOUD_SERVICE = "offcloud";
var SEEDR_SERVICE = "seedr";
var EASYNEWS_SERVICE = "easynews";
var NZBDAV_SERVICE = "nzbdav";
var ALTMOUNT_SERVICE = "altmount";
var STREMIO_NNTP_SERVICE = "stremio_nntp";
var STREMTHRU_NEWZ_SERVICE = "stremthru_newz";
var AIOSTREAMS_SERVICE = "aiostreams";
var TORRIN_SERVICE = "torrin";
var SERVICES = [
  REALDEBRID_SERVICE,
  DEBRIDLINK_SERVICE,
  PREMIUMIZE_SERVICE,
  ALLDEBRID_SERVICE,
  TORBOX_SERVICE,
  EASYDEBRID_SERVICE,
  DEBRIDER_SERVICE,
  PUTIO_SERVICE,
  PIKPAK_SERVICE,
  OFFCLOUD_SERVICE,
  SEEDR_SERVICE,
  EASYNEWS_SERVICE,
  NZBDAV_SERVICE,
  ALTMOUNT_SERVICE,
  STREMIO_NNTP_SERVICE,
  STREMTHRU_NEWZ_SERVICE,
  AIOSTREAMS_SERVICE,
  TORRIN_SERVICE
];
var BUILTIN_SUPPORTED_SERVICES = [
  REALDEBRID_SERVICE,
  DEBRIDLINK_SERVICE,
  PREMIUMIZE_SERVICE,
  ALLDEBRID_SERVICE,
  TORBOX_SERVICE,
  EASYDEBRID_SERVICE,
  DEBRIDER_SERVICE,
  PIKPAK_SERVICE,
  OFFCLOUD_SERVICE,
  NZBDAV_SERVICE,
  ALTMOUNT_SERVICE,
  STREMIO_NNTP_SERVICE,
  EASYNEWS_SERVICE,
  STREMTHRU_NEWZ_SERVICE,
  AIOSTREAMS_SERVICE,
  TORRIN_SERVICE
];
var MEDIAFLOW_SERVICE = "mediaflow";
var STREMTHRU_SERVICE = "stremthru";
var BUILTIN_SERVICE = "builtin";
var PROXY_SERVICES = [
  BUILTIN_SERVICE,
  STREMTHRU_SERVICE,
  MEDIAFLOW_SERVICE
];
var PROXY_SERVICE_DETAILS = {
  [BUILTIN_SERVICE]: {
    id: BUILTIN_SERVICE,
    name: "Builtin Proxy",
    description: "A proxy service that is built into the core of AIOStreams",
    credentialDescription: "A valid username:password pair for this AIOStreams instance, defined in the `AIOSTREAMS_AUTH` environment variable."
  },
  [STREMTHRU_SERVICE]: {
    id: STREMTHRU_SERVICE,
    name: "StremThru",
    description: "[StremThru](https://github.com/MunifTanjim/stremthru) is a feature packed companion to Stremio which also offers a HTTP proxy, written in Go.",
    credentialDescription: "A valid username:password pair for your StremThru instance, defined in the `STREMTHRU_PROXY_AUTH` environment variable."
  },
  [MEDIAFLOW_SERVICE]: {
    id: MEDIAFLOW_SERVICE,
    name: "MediaFlow Proxy",
    description: "[MediaFlow Proxy](https://github.com/mhdzumair/mediaflow-proxy) is a high performance proxy server which supports HTTP, HLS, and more.",
    credentialDescription: "The value of your MediaFlow Proxy instance `API_PASSWORD` environment variable."
  }
};
var SERVICE_DETAILS = {
  [REALDEBRID_SERVICE]: {
    id: REALDEBRID_SERVICE,
    name: "Real-Debrid",
    shortName: "RD",
    knownNames: ["RD", "Real Debrid", "RealDebrid", "Real-Debrid"],
    signUpText: "Don't have an account? [Sign up here](https://real-debrid.com/?id=9483829)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "The API key for the Real-Debrid service. Obtain it from [here](https://real-debrid.com/apitoken)",
        type: "password",
        required: true
      }
    ]
  },
  [ALLDEBRID_SERVICE]: {
    id: ALLDEBRID_SERVICE,
    name: "AllDebrid",
    shortName: "AD",
    knownNames: ["AD", "All Debrid", "AllDebrid", "All-Debrid"],
    signUpText: "Don't have an account? [Sign up here](https://alldebrid.com/?uid=3n8qa&lang=en)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "The API key for the All-Debrid service. Create one [here](https://alldebrid.com/apikeys)",
        type: "password",
        required: true
      }
    ]
  },
  [PREMIUMIZE_SERVICE]: {
    id: PREMIUMIZE_SERVICE,
    name: "Premiumize",
    shortName: "PM",
    knownNames: ["PM", "Premiumize"],
    signUpText: "Don't have an account? [Sign up here](https://www.premiumize.me/register)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Premiumize API key. Obtain it from [here](https://www.premiumize.me/account)",
        type: "password",
        required: true
      }
    ]
  },
  [DEBRIDLINK_SERVICE]: {
    id: DEBRIDLINK_SERVICE,
    name: "Debrid-Link",
    shortName: "DL",
    knownNames: ["DL", "Debrid Link", "DebridLink", "Debrid-Link"],
    signUpText: "Don't have an account? [Sign up here](https://debrid-link.com/id/EY0JO)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Debrid-Link API key. Obtain it from [here](https://debrid-link.com/webapp/apikey)",
        type: "password",
        required: true
      }
    ]
  },
  [TORBOX_SERVICE]: {
    id: TORBOX_SERVICE,
    name: "TorBox",
    shortName: "TB",
    knownNames: ["TB", "TorBox", "Torbox", "TRB"],
    signUpText: "Don't have an account? [Sign up here](https://torbox.app/subscription?referral=9ca21adb-dbcb-4fb0-9195-412a5f3519bc) or use my referral code `9ca21adb-dbcb-4fb0-9195-412a5f3519bc`.",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Torbox API key. Obtain it from [here](https://torbox.app/settings)",
        type: "password",
        required: true
      }
    ]
  },
  [STREMIO_NNTP_SERVICE]: {
    id: STREMIO_NNTP_SERVICE,
    name: "Stremio NNTP",
    shortName: "SN",
    knownNames: ["SN", "Stremio NNTP", "StremioNntp", "Stremio-NNTP"],
    signUpText: "Stream usenet directly from your provider via Stremio's NNTP client.",
    credentials: [
      {
        id: "note",
        name: "",
        description: `This is a new Stremio feature that allows Stremio to connect directly to Usenet NNTP servers you provide. It is currently [only supported on Stremio V5 Desktop](https://blog.stremio.com/stremio-new-stream-sources-usenet-rar-zip-ftp-and-more/).`,
        type: "alert",
        intent: "warning"
      },
      {
        id: "servers",
        name: "NNTP Servers",
        description: "Provide your Usenet NNTP server addresses",
        type: "custom-nntp-servers",
        required: true
      }
    ]
  },
  [NZBDAV_SERVICE]: {
    id: NZBDAV_SERVICE,
    name: "NzbDAV",
    shortName: "ND",
    knownNames: ["ND"],
    signUpText: "Stream usenet directly from your provider via Nzb DAV.",
    credentials: [
      {
        id: "note",
        name: "Configuration Help",
        description: `**URL:** Use internal URL for local setups (e.g., http://nzbdav:3000), otherwise use a public URL.

**Public URL:** Only needed if URL is local but streams need to be publicly accessible. Leave blank if URL is public or using a proxy.

**Security Note:** WebDAV credentials are exposed in stream URLs unless proxied. To proxy, provide the Auth Token below (built-in proxy only).

For detailed setup instructions, see the [Usenet guide](https://docs.aiostreams.viren070.me/guides/usenet#nzbdav-altmount-and-stremthru-newz).`,
        type: "alert",
        intent: "info",
        required: false
      },
      {
        id: "url",
        name: "NzbDAV URL",
        description: "The base URL of your NZB DAV instance. E.g., http://nzbdav:3000",
        type: "string",
        required: true
      },
      {
        id: "publicUrl",
        name: "Public NzbDAV URL (Optional)",
        description: "The public URL of your NzbDAV instance. Optional, see note above for details.",
        type: "string",
        required: false
      },
      {
        id: "apiKey",
        name: "NzbDAV API Key",
        description: "Your Nzb DAV API Key, found in the SABnzbd section in settings.",
        type: "password",
        required: true
      },
      {
        id: "username",
        name: "NzbDAV WebDAV Username",
        description: "Your Nzb DAV WebDAV Username. Found in the WebDAV section in settings.",
        type: "string",
        required: false
      },
      {
        id: "password",
        name: "NzbDAV WebDAV Password",
        description: "Your NzbDAV WebDAV Password. Found in the WebDAV section in settings.",
        type: "password",
        required: false
      },
      {
        id: "aiostreamsAuth",
        name: "AIOStreams Auth Token (Optional)",
        description: "If you would like to proxy your NzbDAV streams, you will need to provide a username:password pair for your AIOStreams instance, defined in the `AIOSTREAMS_AUTH` environment variable. **Other proxies will not work and you must define it here only**",
        type: "password",
        required: false
      }
    ]
  },
  [AIOSTREAMS_SERVICE]: {
    id: AIOSTREAMS_SERVICE,
    name: "AIOStreams",
    shortName: "AIO",
    knownNames: ["AIO", "AIO Usenet", "NZB", "Native Usenet"],
    signUpText: "Stream directly from your own NNTP providers via the built-in usenet engine. Providers are configured globally by the administrator.",
    credentials: [
      {
        id: "note",
        name: "Configuration Help",
        description: `NNTP providers for this engine are configured **globally by the administrator** (Settings \u2192 Usenet), not here.

To authorise streaming through the built-in engine, provide an AIOStreams Auth Token below: a \`username:password\` pair defined in the \`AIOSTREAMS_AUTH\` environment variable.`,
        type: "alert",
        intent: "info",
        required: false
      },
      {
        id: "aiostreamsAuth",
        name: "AIOStreams Auth Token",
        description: "A `username:password` pair for your AIOStreams instance, defined in the `AIOSTREAMS_AUTH` environment variable. Required to authorise streaming through the built-in usenet engine.",
        type: "password",
        required: true
      }
    ]
  },
  [ALTMOUNT_SERVICE]: {
    id: ALTMOUNT_SERVICE,
    name: "AltMount",
    shortName: "AM",
    knownNames: ["AM"],
    signUpText: "Stream usenet directly from your provider via AltMount.",
    credentials: [
      {
        id: "note",
        name: "Configuration Help",
        description: `**URL:** Use internal URL for local setups (e.g., http://altmount:8000), otherwise use a public URL.

**Public URL:** Only needed if URL is local but streams need to be publicly accessible. Leave blank if URL is public or using a proxy.

**Security Note:** WebDAV credentials are exposed in stream URLs unless proxied. To proxy, provide the Auth Token below (built-in proxy only).

For detailed setup instructions, see the [Usenet guide](https://docs.aiostreams.viren070.me/guides/usenet#nzbdav-altmount-and-stremthru-newz).`,
        type: "alert",
        intent: "info",
        required: false
      },
      {
        id: "url",
        name: "Altmount URL",
        description: "The base URL of your AltMount instance used for requests. e.g., http://altmount:8080",
        type: "string",
        required: true
      },
      {
        id: "publicUrl",
        name: "Public Altmount URL",
        description: "The public URL of your AltMount instance. Optional, see note above for details.",
        type: "string",
        required: false
      },
      {
        id: "apiKey",
        name: "AltMount API Key",
        description: "Your AltMount API Key, found at `Configuration -> System` in the AltMount Web UI.",
        type: "password",
        required: true
      },
      {
        id: "username",
        name: "AltMount WebDAV Username",
        description: "Your AltMount WebDAV Username, found at `Configuration -> WebDAV Server` in the AltMount Web UI.",
        type: "string",
        required: true
      },
      {
        id: "password",
        name: "AltMount WebDAV Password",
        description: "Your AltMount WebDAV Password, found at `Configuration -> WebDAV Server` in the AltMount Web UI.",
        type: "password",
        required: true
      },
      {
        id: "aiostreamsAuth",
        name: "AIOStreams Auth Token (Optional)",
        description: "If you would like to proxy your AltMount streams, you will need to provide a username:password pair for your AIOStreams instance, defined in the `AIOSTREAMS_AUTH` environment variable. **Other proxies will not work and you must define it here only**",
        type: "password",
        required: false
      }
    ]
  },
  [OFFCLOUD_SERVICE]: {
    id: OFFCLOUD_SERVICE,
    name: "Offcloud",
    shortName: "OC",
    knownNames: ["OC", "Offcloud"],
    signUpText: "Don't have an account? [Sign up here](https://offcloud.com/?=06202a3d)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Offcloud API key. Obtain it from [here](https://offcloud.com/#/account) on the `API Key` tab. ",
        type: "password",
        required: true
      },
      {
        id: "email",
        name: "Email",
        description: "Your Offcloud email. (These credentials are necessary for some addons)",
        type: "password",
        required: true
      },
      {
        id: "password",
        name: "Password",
        description: "Your Offcloud password. (These credentials are necessary for some addons)",
        type: "password",
        required: true
      }
    ]
  },
  [PUTIO_SERVICE]: {
    id: PUTIO_SERVICE,
    name: "put.io",
    shortName: "P.IO",
    knownNames: ["PO", "put.io", "putio"],
    signUpText: "Don't have an account? [Sign up here](https://put.io/)",
    credentials: [
      {
        id: "clientId",
        name: "Client ID",
        description: "Your put.io Client ID. Obtain it from [here](https://app.put.io/oauth)",
        type: "password",
        required: true
      },
      {
        id: "token",
        name: "Token",
        description: "Your put.io Token. Obtain it from [here](https://app.put.io/oauth)",
        type: "password",
        required: true
      }
    ]
  },
  [EASYNEWS_SERVICE]: {
    id: EASYNEWS_SERVICE,
    name: "Easynews",
    shortName: "EN",
    knownNames: ["EN", "Easynews"],
    signUpText: "Don't have an account? [Sign up here](https://www.easynews.com/)",
    credentials: [
      {
        id: "username",
        name: "Username",
        description: "Your Easynews username",
        type: "password",
        required: true
      },
      {
        id: "password",
        name: "Password",
        description: "Your Easynews password",
        type: "password",
        required: true
      }
    ]
  },
  [EASYDEBRID_SERVICE]: {
    id: EASYDEBRID_SERVICE,
    name: "EasyDebrid",
    shortName: "ED",
    knownNames: ["ED", "EasyDebrid"],
    signUpText: "Don't have an account? [Sign up here](https://paradise-cloud.com/products/easydebrid)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your EasyDebrid API key. Obtain it from [here](https://paradise-cloud.com/dashboard/)",
        type: "password",
        required: true
      }
    ]
  },
  [DEBRIDER_SERVICE]: {
    id: DEBRIDER_SERVICE,
    name: "Debrider",
    shortName: "DR",
    knownNames: ["DBD", "DR", "DER", "DB", "Debrider"],
    signUpText: "Don't have an account? [Sign up here](https://debrider.app/)",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Debrider API key. Obtain it from [here](https://debrider.app/dashboard/account)",
        type: "password",
        required: true
      }
    ]
  },
  [PIKPAK_SERVICE]: {
    id: PIKPAK_SERVICE,
    name: "PikPak",
    shortName: "PKP",
    knownNames: ["PP", "PikPak", "PKP"],
    signUpText: "Don't have an account? [Sign up here](https://mypikpak.com/drive/activity/invited?invitation-code=72822731)",
    credentials: [
      {
        id: "email",
        name: "Email",
        description: "Your PikPak email address",
        type: "password",
        required: true
      },
      {
        id: "password",
        name: "Password",
        description: "Your PikPak password",
        type: "password",
        required: true
      }
    ]
  },
  [SEEDR_SERVICE]: {
    id: SEEDR_SERVICE,
    name: "Seedr",
    shortName: "SDR",
    knownNames: ["SR", "Seedr", "SDR"],
    signUpText: "Don't have an account? [Sign up here](https://www.seedr.cc/?r=6542079)",
    credentials: [
      {
        id: "encodedToken",
        name: "Encoded Token",
        description: "Please authorise at MediaFusion and copy the token into here.",
        type: "password",
        required: true
      }
    ]
  },
  [STREMTHRU_NEWZ_SERVICE]: {
    id: STREMTHRU_NEWZ_SERVICE,
    name: "StremThru Newz",
    shortName: "ST",
    knownNames: ["ST", "StremThru Newz", "StremThruNewz"],
    signUpText: "Stream usenet content via [StremThru](https://github.com/MunifTanjim/stremthru).",
    credentials: [
      {
        id: "url",
        name: "StremThru URL",
        description: "The base URL of your StremThru instance used for requests e.g. http://stremthru:8080 or https://stremthru.mydomain.com",
        type: "string",
        required: true
      },
      {
        id: "authToken",
        name: "Auth Token",
        description: "Your StremThru authentication token from `STREMTHRU_AUTH`",
        type: "password",
        required: true
      },
      {
        id: "note",
        name: "Tip",
        description: "If you are self-hosting both StremThru and AIOStreams, consider using the internal URL of StremThru (e.g., http://stremthru:8080) to avoid potential network issues. Your playback URLs generated by StremThru will use the `STREMTHRU_BASE_URL` environment variable.",
        type: "alert",
        intent: "info"
      }
    ]
  },
  [TORRIN_SERVICE]: {
    id: TORRIN_SERVICE,
    name: "Torrin",
    shortName: "TR",
    knownNames: ["TR", "TI", "TRN", "Torrin"],
    signUpText: "Don't have an account? [Sign up here](https://torrin.app). Torrin is an open-source debrid service.",
    credentials: [
      {
        id: "apiKey",
        name: "API Key",
        description: "Your Torrin API key (begins with `tr_`). Obtain it from [torrin.app/app/settings](https://torrin.app/app/settings).",
        type: "password",
        required: true
      }
    ]
  }
};
var TOP_LEVEL_OPTION_DETAILS = {
  tmdbApiKey: {
    name: "TMDB API Key",
    type: "password",
    description: "Get your free API key from [here](https://www.themoviedb.org/settings/api). Make sure to copy the 32 character API Key and not the Read Access Token."
  },
  tmdbAccessToken: {
    name: "TMDB Access Token",
    type: "password",
    description: "Get your free access token from [here](https://www.themoviedb.org/settings/api). Make sure to copy the Read Access Token and not the 32 character API Key."
  },
  rpdbApiKey: {
    name: "RPDB API Key",
    type: "password",
    description: "Get your free API key from [here](https://ratingposterdb.com/api-key/) for posters with ratings."
  },
  topPosterApiKey: {
    name: "TOP Posters API Key",
    type: "password",
    description: "Get your free API key from [here](https://api.top-posters.com/user/register) for posters with ratings."
  },
  tvdbApiKey: {
    name: "TVDB API Key",
    type: "password",
    description: "Sign up for a free API Key at [TVDB](https://www.thetvdb.com/api-information) and then get it from your [dashboard](https://www.thetvdb.com/dashboard/account/apikeys)."
  },
  aioratingsApiKey: {
    name: "AIOratings API Key",
    type: "password",
    description: "Get your API key from [here](https://aioratings.com) for custom posters with ratings."
  },
  aioratingsProfileId: {
    name: "AIOratings Profile ID",
    type: "string",
    description: 'Use "default" for the default profile, or enter a custom profile UUID from your AIOratings dashboard.'
  },
  openposterdbApiKey: {
    name: "OpenPosterDB API Key",
    type: "password",
    description: "Get your API key from [here](https://openposterdb.com) for posters with ratings. Use `t0-free-rpdb` for the free public instance."
  },
  openposterdbUrl: {
    name: "OpenPosterDB URL",
    type: "url",
    description: "Custom base URL for a self-hosted OpenPosterDB instance. Leave empty to use the default public instance."
  },
  openposterdbParameters: {
    name: "OpenPosterDB Custom Parameters",
    type: "string",
    description: "Optional query string (without the leading `?`) appended to every poster to customise it, e.g. `ratings_limit=2&badge_size=l&position=br`."
  },
  pmdbApiKey: {
    name: "PublicMetaDB API Key",
    type: "password",
    description: "Create one under Settings \u2192 API on [PublicMetaDB](https://publicmetadb.com). Used for skip intro and credits markers in the Jellyfin API."
  }
};
var DEDUPLICATOR_KEYS = [
  "filename",
  "infoHash",
  "smartDetect"
];
var DEDUPLICATOR_LIBRARY_BEHAVIOURS = [
  "ignore",
  "prefer",
  "exclusive"
];
var DEDUPLICATOR_TIEBREAKERS = [
  "torrent_seeders",
  "usenet_age"
];
var SMART_DETECT_ATTRIBUTES = [
  "size",
  "bitrate",
  "resolution",
  "quality",
  "encode",
  "releaseGroup",
  "edition",
  "remastered",
  "network",
  "container",
  "visualTags",
  "audioTags",
  "audioChannels",
  "languages",
  "repack",
  "proper",
  "country"
];
var DEFAULT_SMART_DETECT_ATTRIBUTES = [
  "size",
  "resolution",
  "quality",
  "visualTags",
  "audioTags",
  "audioChannels",
  "languages",
  "encode",
  "edition",
  "network",
  "remastered",
  "releaseGroup"
];
var AUTO_PLAY_ATTRIBUTES = [
  "service",
  "cached",
  "addon",
  "proxied",
  "resolution",
  "quality",
  "encode",
  "audioTags",
  "visualTags",
  "languages",
  "releaseGroup",
  "type",
  "infoHash",
  "size"
];
var DEFAULT_AUTO_PLAY_ATTRIBUTES = ["resolution", "quality", "releaseGroup"];
var AUTO_PLAY_METHODS = [
  "matchingFile",
  "matchingIndex",
  "firstFile"
];
var AUTO_PLAY_METHOD_DETAILS = {
  matchingFile: {
    name: "Matching File",
    description: "Auto-play the stream that matches the (customisable) attributes of the previous episode."
  },
  matchingIndex: {
    name: "Matching Index",
    description: "Auto-play the stream in the same position in the result list (assuming it exists) i.e. if you play the second stream, the second stream for the next episode will also be played."
  },
  firstFile: {
    name: "First File",
    description: "Always auto-play the first stream in the result list."
  }
};
var RESOLUTIONS = [
  "2160p",
  "1440p",
  "1080p",
  "720p",
  "576p",
  "480p",
  "360p",
  "240p",
  "144p",
  "Unknown"
];
var QUALITIES = [
  "BluRay REMUX",
  "BluRay",
  "WEB-DL",
  "WEBRip",
  "HDRip",
  "HC HD-Rip",
  "DVD REMUX",
  "DVDRip",
  "HDTV",
  "CAM",
  "TS",
  "TC",
  "SCR",
  "Unknown"
];
var FAKE_VISUAL_TAGS = ["HDR+DV", "DV Only", "HDR Only"];
var VISUAL_TAGS = [
  ...FAKE_VISUAL_TAGS,
  "HDR10+",
  "HDR10",
  "DV",
  "HDR",
  "HLG",
  "10bit",
  "3D",
  "IMAX",
  "AI",
  "Upscaled",
  "SDR",
  "H-OU",
  "H-SBS",
  "Unknown"
];
var AUDIO_TAGS = [
  "Atmos",
  "DD+",
  "DD",
  "DTS:X",
  "DTS-HD MA",
  "DTS-HD",
  "DTS-ES",
  "DTS",
  "TrueHD",
  "PCM",
  "OPUS",
  "FLAC",
  "AAC",
  "Unknown"
];
var AUDIO_CHANNELS = ["2.0", "5.1", "6.1", "7.1", "Unknown"];
var DEFAULT_REPOST_SUFFIXES = [
  "RP",
  "1",
  "NZBGeek",
  "[N-Z-B]",
  "Obfuscated",
  "Obfuscation",
  "Scrambled",
  "sample",
  "Pre",
  "postbot",
  "xpost",
  "Rakuv*",
  "WhiteRev",
  "BUYMORE",
  "AsRequested",
  "AlternativeToRequested",
  "GEROV",
  "Z0iDS3N",
  "Chamele0n",
  "4P",
  "4Planet",
  "AlteZachen",
  "RePACKPOST",
  "FTP",
  "xpo"
];
var PASSTHROUGH_STAGES = [
  "filter",
  // bypass main filtering (shouldKeepStream)
  "language",
  // bypass language filtering specifically
  "subtitle",
  // bypass subtitle filtering specifically
  "dedup",
  // bypass deduplication
  "limit",
  // bypass result limiting
  "excluded",
  // bypass excluded stream expressions
  "required",
  // bypass required stream expressions
  "title",
  // bypass title matching
  "year",
  // bypass year matching
  "episode",
  // bypass season/episode matching
  "digitalRelease"
  // bypass early digital release filter
];
var ENCODES = [
  "AV1",
  "HEVC",
  "AVC",
  "VC-1",
  "XviD",
  "DivX",
  "MPEG-4",
  // 'H-OU',
  // 'H-SBS',
  "Unknown"
];
var SORT_CRITERIA = [
  "quality",
  "resolution",
  "language",
  "subtitle",
  "visualTag",
  "audioTag",
  "audioChannel",
  "streamType",
  "encode",
  "size",
  "service",
  "seeders",
  "private",
  "age",
  "addon",
  "regexPatterns",
  "cached",
  "library",
  "keyword",
  "streamExpressionMatched",
  "streamExpressionScore",
  "regexScore",
  "seadex",
  "bitrate",
  "releaseGroup"
];
var MIN_SIZE = 0;
var MAX_SIZE = 100 * 1e3 * 1e3 * 1e3;
var MIN_BITRATE = 0;
var MAX_BITRATE = 250 * 1e3 * 1e3;
var MIN_SEEDERS = 0;
var MAX_SEEDERS = 1e3;
var MIN_AGE_HOURS = 0;
var MAX_AGE_HOURS = 6480 * 24;
var SORT_CRITERIA_DETAILS = {
  quality: {
    name: "Quality",
    description: "Sort by the quality of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred quality list are preferred",
    descendingDescription: "Streams that are in your preferred quality list are preferred"
  },
  resolution: {
    name: "Resolution",
    description: "Sort by the resolution of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred resolution list are preferred",
    descendingDescription: "Streams that are in your preferred resolution list are preferred"
  },
  language: {
    name: "Language",
    description: "Sort by the language of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred language list are preferred",
    descendingDescription: "Streams that are in your preferred language list are preferred"
  },
  subtitle: {
    name: "Subtitle",
    description: "Sort by the subtitle of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred subtitle list are preferred",
    descendingDescription: "Streams that are in your preferred subtitle list are preferred"
  },
  visualTag: {
    name: "Visual Tag",
    description: "Sort by the visual tags of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred visual tag list are preferred",
    descendingDescription: "Streams that are in your preferred visual tag list are preferred"
  },
  audioTag: {
    name: "Audio Tag",
    description: "Sort by the audio tags of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred audio tag list are preferred",
    descendingDescription: "Streams that are in your preferred audio tag list are preferred"
  },
  audioChannel: {
    name: "Audio Channel",
    description: "Sort by the audio channels of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred audio channel list are preferred",
    descendingDescription: "Streams that are in your preferred audio channel list are preferred"
  },
  streamType: {
    name: "Stream Type",
    description: "Whether the stream is of a preferred stream type",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred stream type list are preferred",
    descendingDescription: "Streams that are in your preferred stream type list are preferred"
  },
  encode: {
    name: "Encode",
    description: "Whether the stream is of a preferred encode",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not in your preferred encode list are preferred",
    descendingDescription: "Streams that are in your preferred encode list are preferred"
  },
  size: {
    name: "Size",
    description: "Sort by the size of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are smaller are sorted first",
    descendingDescription: "Streams that are larger are sorted first"
  },
  service: {
    name: "Service",
    description: "Sort by the service order",
    defaultDirection: "desc",
    ascendingDescription: "Streams without a service are preferred",
    descendingDescription: "Streams are ordered by the order of your service list, with non-service streams at the bottom"
  },
  seeders: {
    name: "Seeders",
    description: "Sort by the number of seeders",
    defaultDirection: "desc",
    ascendingDescription: "Streams with fewer seeders are preferred",
    descendingDescription: "Streams with more seeders are preferred"
  },
  private: {
    name: "Private",
    description: "Whether the stream is from a private tracker or not",
    defaultDirection: "desc",
    ascendingDescription: "Streams that are not from private trackers are preferred",
    descendingDescription: "Streams that are from private trackers are preferred"
  },
  age: {
    name: "Age",
    description: "Sort by the age of the stream",
    defaultDirection: "desc",
    ascendingDescription: "Newer streams are preferred",
    descendingDescription: "Older streams are preferred"
  },
  addon: {
    name: "Addon",
    description: "Sort by the addon order",
    defaultDirection: "desc",
    ascendingDescription: "Streams are sorted by the order of your addon list",
    descendingDescription: "Streams are sorted by the order of your addon list"
  },
  regexPatterns: {
    name: "Regex Patterns",
    description: "Whether the stream matches any of your preferred regex patterns",
    defaultDirection: "desc",
    ascendingDescription: "Streams that do not match your preferred regex patterns are preferred",
    descendingDescription: "Streams that match your preferred regex patterns are preferred"
  },
  cached: {
    name: "Cached",
    defaultDirection: "desc",
    description: "Whether the stream is cached or not",
    ascendingDescription: "Streams that are not cached are preferred",
    descendingDescription: "Streams that are cached are preferred"
  },
  library: {
    name: "Library",
    defaultDirection: "desc",
    description: "Whether the stream is in your library (e.g. debrid account) or not",
    ascendingDescription: "Streams that are not in your library are preferred",
    descendingDescription: "Streams that are in your library are preferred"
  },
  keyword: {
    name: "Keyword",
    defaultDirection: "desc",
    description: "Sort by the keyword of the stream",
    ascendingDescription: "Streams that do not match any of your keywords are preferred",
    descendingDescription: "Streams that match any of your keywords are preferred"
  },
  streamExpressionMatched: {
    name: "Stream Expressions",
    defaultDirection: "desc",
    description: "Whether the stream matches any of your preferred stream expressions",
    ascendingDescription: "Streams that do not match your preferred stream expressions are preferred while the ones that do are ranked by the order of your preferred stream expressions",
    descendingDescription: "Streams that match your preferred stream expressions are preferred and ranked by the order of your preferred stream expressions"
  },
  seadex: {
    name: "SeaDex",
    defaultDirection: "desc",
    description: "Whether the stream is a SeaDex release (curated best anime releases from releases.moe)",
    ascendingDescription: "Streams that are not listed on SeaDex are preferred",
    descendingDescription: "Streams that are marked as the Best release on SeaDex are preferred, followed by the Alternative release"
  },
  bitrate: {
    name: "Bitrate (Estimate)",
    defaultDirection: "desc",
    description: "Sort by the bitrate of the stream",
    ascendingDescription: "Streams with lower bitrate are preferred",
    descendingDescription: "Streams with higher bitrate are preferred"
  },
  regexScore: {
    name: "Ranked Regex Score",
    defaultDirection: "desc",
    description: "Sort by the computed score from ranked regex patterns",
    ascendingDescription: "Streams with lower regex scores are preferred",
    descendingDescription: "Streams with higher regex scores are preferred"
  },
  streamExpressionScore: {
    name: "Stream Expression Score",
    defaultDirection: "desc",
    description: "Sort by the computed score from ranked stream expressions",
    ascendingDescription: "Streams with lower expression scores are preferred",
    descendingDescription: "Streams with higher expression scores are preferred"
  },
  releaseGroup: {
    name: "Release Group",
    defaultDirection: "desc",
    description: "Sort by the release group of the stream",
    ascendingDescription: "Streams that are not in your preferred release group list are preferred",
    descendingDescription: "Streams that are in your preferred release group list are preferred"
  }
};
var SORT_DIRECTIONS = ["asc", "desc"];
var P2P_STREAM_TYPE = "p2p";
var LIVE_STREAM_TYPE = "live";
var STREMIO_USENET_STREAM_TYPE = "stremio-usenet";
var ARCHIVE_STREAM_TYPE = "archive";
var USENET_STREAM_TYPE = "usenet";
var DEBRID_STREAM_TYPE = "debrid";
var HTTP_STREAM_TYPE = "http";
var INFO_STREAM_TYPE = "info";
var EXTERNAL_STREAM_TYPE = "external";
var YOUTUBE_STREAM_TYPE = "youtube";
var ERROR_STREAM_TYPE = "error";
var STATISTIC_STREAM_TYPE = "statistic";
var STREAM_TYPES = [
  P2P_STREAM_TYPE,
  LIVE_STREAM_TYPE,
  STREMIO_USENET_STREAM_TYPE,
  ARCHIVE_STREAM_TYPE,
  USENET_STREAM_TYPE,
  DEBRID_STREAM_TYPE,
  HTTP_STREAM_TYPE,
  EXTERNAL_STREAM_TYPE,
  YOUTUBE_STREAM_TYPE,
  ERROR_STREAM_TYPE,
  STATISTIC_STREAM_TYPE,
  INFO_STREAM_TYPE
];
var STREAM_RESOURCE = "stream";
var SUBTITLES_RESOURCE = "subtitles";
var CATALOG_RESOURCE = "catalog";
var META_RESOURCE = "meta";
var ADDON_CATALOG_RESOURCE = "addon_catalog";
var WATCH_STATE_RESOURCE = "watch_state";
var WATCH_STATE_MANIFEST_KEY = "watchState";
var MOVIE_TYPE = "movie";
var SERIES_TYPE = "series";
var CHANNEL_TYPE = "channel";
var TV_TYPE = "tv";
var ANIME_TYPE = "anime";
var TYPES = [
  MOVIE_TYPE,
  SERIES_TYPE,
  CHANNEL_TYPE,
  TV_TYPE,
  ANIME_TYPE
];
var TYPE_LABELS = {
  [MOVIE_TYPE]: "Movie",
  [SERIES_TYPE]: "Series",
  [CHANNEL_TYPE]: "Channel",
  [TV_TYPE]: "TV",
  [ANIME_TYPE]: "Anime"
};
var RESOURCES = [
  STREAM_RESOURCE,
  SUBTITLES_RESOURCE,
  CATALOG_RESOURCE,
  META_RESOURCE,
  ADDON_CATALOG_RESOURCE,
  WATCH_STATE_RESOURCE
];
var SEGMENT_PROVIDERS = ["introdb", "aniskip", "animeskip", "pmdb"];
var SUGGESTION_PROVIDERS = ["lumieredb", "cinemeta"];
var RESOURCE_LABELS = {
  [STREAM_RESOURCE]: "Stream",
  [SUBTITLES_RESOURCE]: "Subtitles",
  [CATALOG_RESOURCE]: "Catalog",
  [META_RESOURCE]: "Metadata",
  [ADDON_CATALOG_RESOURCE]: "Addon Catalog",
  [WATCH_STATE_RESOURCE]: "Watch State"
};
var PresetCategory = /* @__PURE__ */ ((PresetCategory2) => {
  PresetCategory2["STREAMS"] = "streams";
  PresetCategory2["SUBTITLES"] = "subtitles";
  PresetCategory2["META_CATALOGS"] = "meta_catalogs";
  PresetCategory2["MISC"] = "misc";
  return PresetCategory2;
})(PresetCategory || {});
var PRESET_CATEGORIES = [
  "streams" /* STREAMS */,
  "subtitles" /* SUBTITLES */,
  "meta_catalogs" /* META_CATALOGS */,
  "misc" /* MISC */
];
var SNIPPETS = [
  {
    name: "Resolution",
    description: 'The resolution, falling back to "Unknown" when unavailable.',
    value: "{stream.resolution::default('Unknown')}"
  },
  {
    name: "Title & Year",
    description: "Title in Title Case, with the year in brackets when known.",
    value: "{stream.title::title}{? ({stream.year})?}"
  },
  {
    name: "Season & Episode",
    description: "Season and episode (S01 E05). Hidden for movies.",
    value: "{?{stream.seasonEpisode::join(' ')}?}"
  },
  {
    name: "Quality",
    description: "Source quality (BluRay, WEB-DL, \u2026). Hidden when unknown.",
    value: "{?\u{1F3A5} {stream.quality}?}"
  },
  {
    name: "File Size",
    description: "File size, with the folder size appended when present.",
    value: "{?\u{1F4E6} {stream.size::sbytes}?}{? / {stream.folderSize::sbytes}?}"
  },
  {
    name: "Bitrate",
    description: "Bitrate. Hidden when unavailable.",
    value: "{?\u{1F4CA} {stream.bitrate::sbitrate}?}"
  },
  {
    name: "Duration",
    description: "Runtime.",
    value: "{?\u23F1\uFE0F {stream.duration::time}?}"
  },
  {
    name: "Seeders",
    description: "Seeder count. Hidden for non-torrents.",
    value: "{?\u{1F464} {stream.seeders}?}"
  },
  {
    name: "Age",
    description: "How long ago the release was posted.",
    value: "{?\u{1F4C5} {stream.age}?}"
  },
  {
    name: "HDR / Visual Tags",
    description: "Visual tags such as HDR, DV and IMAX.",
    value: "{?\u{1F4FA} {stream.visualTags::join(' | ')}?}"
  },
  {
    name: "Audio",
    description: "Audio codecs and channel layouts.",
    value: "{?\u{1F50A} {stream.audioTags::join(' | ')}?}{?\u{1F39A}\uFE0F {stream.audioChannels::join(' | ')}?}"
  },
  {
    name: "Languages",
    description: "Language flags. Tip: use stream.languageCodes for text codes instead.",
    value: "{?\u{1F310} {stream.languageEmojis::join(' / ')}?}"
  },
  {
    name: "Subtitles",
    description: "Subtitle language flags.",
    value: "{?\u{1F4DD} {stream.subtitleEmojis::join(' / ')}?}"
  },
  {
    name: "Encode / Codec",
    description: "Video codec (x265, AV1, \u2026).",
    value: "{?\u{1F39E}\uFE0F {stream.encode}?}"
  },
  {
    name: "Release Group",
    description: "The release group.",
    value: "{?\u{1F3F7}\uFE0F {stream.releaseGroup}?}"
  },
  {
    name: "Episode Title",
    description: "The episode title parsed from the release name.",
    value: "{?\u{1F4FA} {stream.episodeTitle}?}"
  },
  {
    name: "Indexer",
    description: "The indexer or tracker the result came from.",
    value: "{?\u2699\uFE0F {stream.indexer}?}"
  },
  {
    name: "Service & Cached",
    description: "Debrid service, with a cached (\u26A1) / uncached (\u23F3) badge.",
    value: '{?[{service.shortName}]?}{service.cached[" \u26A1"||" \u23F3"||""]}'
  },
  {
    name: "P2P Marker",
    description: "Adds a [P2P] marker for torrent streams.",
    value: '{stream.type::=p2p["[P2P] "||""]}'
  },
  {
    name: "Message",
    description: "Any status message on the stream.",
    value: "{?\u2139\uFE0F {stream.message}?}"
  },
  {
    name: "New Line",
    description: "Forces a line break. Useful inside modifier arguments.",
    value: "{tools.newLine}"
  }
];

// vendor/aiostreams-source/parser/title.ts
var MAX_ENTRIES = 1e4;
var cache = /* @__PURE__ */ new Map();
var repostSuffixPattern = compileRepostSuffixes(DEFAULT_REPOST_SUFFIXES);
function compileRepostSuffixes(suffixes) {
  const alternatives = suffixes.map((suffix) => suffix.trim()).filter(Boolean).map(
    (suffix) => suffix.endsWith("*") ? `${escapeRegex(suffix.slice(0, -1))}[a-z0-9]*` : escapeRegex(suffix)
  );
  if (!alternatives.length) return void 0;
  return new RegExp(
    `(?:-(?:${alternatives.join("|")}))+(?=(?:\\.[a-z0-9]{2,4})?$)`,
    "i"
  );
}
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function stripRepostSuffixes(name) {
  return repostSuffixPattern ? name.replace(repostSuffixPattern, "") : name;
}
function parseTorrentTitleCached(title) {
  const name = stripRepostSuffixes(title);
  const cached = cache.get(name);
  if (cached !== void 0) {
    cache.delete(name);
    cache.set(name, cached);
    return cached;
  }
  const parsed = parseTorrentTitle(name);
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== void 0) {
      cache.delete(oldest);
    }
  }
  cache.set(name, parsed);
  return parsed;
}

// vendor/aiostreams-source/utils/languages.ts
function getLanguageDisplayName(entry) {
  if (entry.internal_english_name) return entry.internal_english_name;
  return entry.english_name.split(/;|\(/)[0].trim();
}
var LANGUAGE_ALIAS_MAP = {
  fre: "fra",
  ger: "deu",
  cze: "ces",
  slo: "slk",
  rum: "ron",
  dut: "nld",
  gre: "ell",
  alb: "sqi",
  baq: "eus",
  bur: "mya",
  chi: "zho",
  per: "fas",
  arm: "hye",
  geo: "kat",
  ice: "isl",
  mac: "mkd",
  mao: "mri",
  may: "msa",
  tib: "bod",
  wel: "cym"
};
var LANGUAGE_BY_NAME = new Map(
  LANGUAGES.map((lang) => [lang.toLowerCase(), lang])
);
var ENTRY_BY_NAME = /* @__PURE__ */ new Map();
for (const entry of FULL_LANGUAGE_MAPPING) {
  const names = [
    entry.internal_english_name,
    entry.english_name,
    ...entry.english_name.split(";").map((name) => name.split("(")[0])
  ];
  for (const name of names) {
    const key = name?.trim().toLowerCase();
    if (!key) continue;
    const existing = ENTRY_BY_NAME.get(key);
    if (!existing || !existing.flag_priority && entry.flag_priority) {
      ENTRY_BY_NAME.set(key, entry);
    }
  }
}
function mapLanguageCode(code) {
  switch (code.toLowerCase()) {
    case "zh-tw":
    case "zh-hans":
      return "zh";
    case "es-419":
      return "es-MX";
    default:
      return code;
  }
}
function convertLangCodeToName(code) {
  const parts = code.split("-");
  const possibleLangs = FULL_LANGUAGE_MAPPING.filter((language) => {
    if (parts.length === 2) {
      return language.iso_639_1?.toLowerCase() === parts[0].toLowerCase() && language.iso_3166_1?.toLowerCase() === parts[1].toLowerCase();
    }
    return language.iso_639_1?.toLowerCase() === parts[0].toLowerCase();
  });
  const chosenLang = possibleLangs.find((lang) => lang.flag_priority) || possibleLangs[0];
  if (!chosenLang) return void 0;
  const candidateLang = getLanguageDisplayName(chosenLang);
  return LANGUAGES.includes(candidateLang) ? candidateLang : void 0;
}
var AMBIGIOUS_LANGUAGES = new Set(
  ["Latino", "Portuguese (Brazil)"].map((lang) => lang.toLowerCase())
);
var BIBLIOGRAPHIC = Object.fromEntries(
  Object.entries(LANGUAGE_ALIAS_MAP).map(([b, t]) => [t, b])
);

// vendor/aiostreams-source/parser/file.ts
var patternEntries = /* @__PURE__ */ new WeakMap();
function entriesOf(patterns) {
  let entries = patternEntries.get(patterns);
  if (!entries) {
    entries = Object.entries(patterns);
    patternEntries.set(patterns, entries);
  }
  return entries;
}
function matchPattern(filename, patterns) {
  return entriesOf(patterns).find(
    ([_, pattern]) => pattern.test(filename)
  )?.[0];
}
function normaliseResolution(resolution) {
  if (!resolution) {
    return void 0;
  }
  const lower = resolution.toLowerCase();
  if (lower === "4k") {
    return "2160p";
  }
  if (RESOLUTIONS.includes(lower)) {
    return lower;
  }
  const pMatch = lower.match(/^(\d+)p$/);
  if (pMatch) {
    const num = parseInt(pMatch[1], 10);
    const numericResolutions = RESOLUTIONS.filter((r) => r !== "Unknown").map((r) => [r, parseInt(r, 10)]);
    const closest = numericResolutions.reduce(
      (prev, curr) => Math.abs(curr[1] - num) < Math.abs(prev[1] - num) ? curr : prev
    );
    return closest[0];
  }
  return void 0;
}
function matchMultiplePatterns(filename, patterns) {
  return entriesOf(patterns).filter(([_, pattern]) => pattern.test(filename)).map(([tag]) => tag);
}
var titleRegexes = /* @__PURE__ */ new Map();
var TITLE_REGEX_MAX = 2e3;
function titleRegex(parsedTitle) {
  let regex = titleRegexes.get(parsedTitle);
  if (!regex) {
    const escaped = parsedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regex = new RegExp(escaped.replace(/ /g, "[._ ]"), "i");
    if (titleRegexes.size >= TITLE_REGEX_MAX) {
      titleRegexes.delete(titleRegexes.keys().next().value);
    }
    titleRegexes.set(parsedTitle, regex);
  }
  return regex;
}
var FileParser = class {
  static parse(filename) {
    const parsed = parseTorrentTitleCached(filename);
    const parsedTitle = parsed.title;
    if (parsedTitle && parsedTitle.length > 4) {
      filename = filename.replace(titleRegex(parsedTitle), "").trim();
      filename = filename.replace(/\s+/g, ".").replace(/^\.+|\.+$/g, "");
    }
    const resolution = normaliseResolution(parsed.resolution) || matchPattern(filename, PARSE_REGEX.resolutions);
    const quality = matchPattern(filename, PARSE_REGEX.qualities);
    const encode = matchPattern(filename, PARSE_REGEX.encodes);
    const audioChannels = matchMultiplePatterns(
      filename,
      PARSE_REGEX.audioChannels
    );
    const visualTags = matchMultiplePatterns(filename, PARSE_REGEX.visualTags);
    const audioTags = matchMultiplePatterns(filename, PARSE_REGEX.audioTags);
    const mapParsedLanguageToKnown = (lang) => {
      switch (lang.toLowerCase()) {
        case "multi audio":
          return "Multi";
        case "dual audio":
          return "Dual Audio";
        case "multi subs":
          return void 0;
        default:
          return convertLangCodeToName(mapLanguageCode(lang));
      }
    };
    let filenameForLangParsing = filename;
    if (parsed.group?.toLowerCase() === "ind") {
      filenameForLangParsing = filenameForLangParsing.replace(/ind/i, "");
    }
    const languages = [
      .../* @__PURE__ */ new Set([
        ...matchMultiplePatterns(filenameForLangParsing, PARSE_REGEX.languages),
        ...(parsed.languages || []).map(mapParsedLanguageToKnown).filter((lang) => !!lang)
      ])
    ];
    const releaseGroup = parsed.group;
    const title = parsedTitle;
    const year = parsed.year ? parsed.year.toString() : void 0;
    const country = parsed.country;
    const episodeTitle = parsed.episodeTitle;
    return {
      resolution,
      quality,
      languages,
      subtitles: [],
      encode,
      audioChannels,
      audioTags,
      visualTags,
      releaseGroup,
      title,
      year,
      country,
      episodeTitle,
      subbed: parsed.subbed ?? false,
      dubbed: parsed.dubbed ?? false,
      editions: parsed.editions,
      regraded: parsed.regraded ?? false,
      repack: parsed.repack ?? false,
      proper: parsed.proper ?? false,
      uncensored: parsed.uncensored ?? false,
      unrated: parsed.unrated ?? false,
      upscaled: parsed.upscaled ?? false,
      network: parsed.network,
      site: parsed.site,
      container: parsed.container,
      extension: parsed.extension,
      seasons: parsed.seasons,
      volumes: parsed.volumes,
      episodes: parsed.episodes,
      date: parsed.date,
      seasonPack: !!(parsed.seasons?.length && !parsed.episodes?.length)
    };
  }
};
var file_default = FileParser;

// vendor/aiostreams-source/utils/index.ts
var silent = { debug() {
}, info() {
}, warn() {
}, error() {
}, trace() {
} };
var createLogger = () => silent;

// vendor/aiostreams-source/streams/sorter.ts
var logger = createLogger("sorter");
var StreamSorter = class {
  userData;
  constructor(userData) {
    this.userData = userData;
  }
  sort(allStreams, context) {
    const type = context.isAnime ? "anime" : context.type;
    const pinnedToTopStreams = allStreams.filter(
      (stream) => stream.addon.pinPosition === "top"
    );
    const pinnedToBottomStreams = allStreams.filter(
      (stream) => stream.addon.pinPosition === "bottom"
    );
    const streams = allStreams.filter((stream) => !stream.addon.pinPosition);
    let primarySortCriteria = this.userData.sortCriteria.global;
    let cachedSortCriteria = this.userData.sortCriteria.cached;
    let uncachedSortCriteria = this.userData.sortCriteria.uncached;
    const start = Date.now();
    if (type === "movie") {
      if (this.userData.sortCriteria?.movies?.length) {
        primarySortCriteria = this.userData.sortCriteria?.movies;
      }
      if (this.userData.sortCriteria?.cachedMovies?.length) {
        cachedSortCriteria = this.userData.sortCriteria?.cachedMovies;
      }
      if (this.userData.sortCriteria?.uncachedMovies?.length) {
        uncachedSortCriteria = this.userData.sortCriteria?.uncachedMovies;
      }
    }
    if (type === "series") {
      if (this.userData.sortCriteria?.series?.length) {
        primarySortCriteria = this.userData.sortCriteria?.series;
      }
      if (this.userData.sortCriteria?.cachedSeries?.length) {
        cachedSortCriteria = this.userData.sortCriteria?.cachedSeries;
      }
      if (this.userData.sortCriteria?.uncachedSeries?.length) {
        uncachedSortCriteria = this.userData.sortCriteria?.uncachedSeries;
      }
    }
    if (type === "anime") {
      if (this.userData.sortCriteria?.anime?.length) {
        primarySortCriteria = this.userData.sortCriteria?.anime;
      }
      if (this.userData.sortCriteria?.cachedAnime?.length) {
        cachedSortCriteria = this.userData.sortCriteria?.cachedAnime;
      }
      if (this.userData.sortCriteria?.uncachedAnime?.length) {
        uncachedSortCriteria = this.userData.sortCriteria?.uncachedAnime;
      }
    }
    let sortedStreams = [];
    if (cachedSortCriteria?.length && uncachedSortCriteria?.length && primarySortCriteria.length > 0 && primarySortCriteria[0].key === "cached") {
      logger.debug(
        "splitting streams into cached and uncached with separate sort criteria"
      );
      const cachedStreams = streams.filter(
        (stream) => stream.service?.cached || stream.service === void 0
        // streams without a service can be considered as 'cached'
      );
      const uncachedStreams = streams.filter(
        (stream) => stream.service?.cached === false
      );
      const cachedSorted = cachedStreams.slice().sort((a, b) => {
        const aKey = this.dynamicSortKey(a, cachedSortCriteria, type);
        const bKey = this.dynamicSortKey(b, cachedSortCriteria, type);
        for (let i = 0; i < aKey.length; i++) {
          if (aKey[i] < bKey[i]) return -1;
          if (aKey[i] > bKey[i]) return 1;
        }
        return 0;
      });
      const uncachedSorted = uncachedStreams.slice().sort((a, b) => {
        const aKey = this.dynamicSortKey(a, uncachedSortCriteria, type);
        const bKey = this.dynamicSortKey(b, uncachedSortCriteria, type);
        for (let i = 0; i < aKey.length; i++) {
          if (aKey[i] < bKey[i]) return -1;
          if (aKey[i] > bKey[i]) return 1;
        }
        return 0;
      });
      if (primarySortCriteria[0].direction === "desc") {
        sortedStreams = [...cachedSorted, ...uncachedSorted];
      } else {
        sortedStreams = [...uncachedSorted, ...cachedSorted];
      }
    } else {
      logger.debug({ criteria: primarySortCriteria }, "using sort criteria");
      sortedStreams = streams.slice().sort((a, b) => {
        const aKey = this.dynamicSortKey(a, primarySortCriteria, type);
        const bKey = this.dynamicSortKey(b, primarySortCriteria, type);
        for (let i = 0; i < aKey.length; i++) {
          if (aKey[i] < bKey[i]) return -1;
          if (aKey[i] > bKey[i]) return 1;
        }
        return 0;
      });
    }
    const pinnedParts = [];
    if (pinnedToTopStreams.length > 0) {
      pinnedParts.push(`${pinnedToTopStreams.length} pinned to top`);
    }
    if (pinnedToBottomStreams.length > 0) {
      pinnedParts.push(`${pinnedToBottomStreams.length} pinned to bottom`);
    }
    logger.debug(
      {
        sorted: sortedStreams.length,
        pinnedTop: pinnedToTopStreams.length,
        pinnedBottom: pinnedToBottomStreams.length,
        took: Date.now() - start
      },
      "sort complete"
    );
    return [...pinnedToTopStreams, ...sortedStreams, ...pinnedToBottomStreams];
  }
  dynamicSortKey(stream, sortCriteria, _type) {
    function keyValue(sortCriterion, userData) {
      const { key, direction } = sortCriterion;
      const multiplier = direction === "asc" ? 1 : -1;
      switch (key) {
        case "cached":
          return multiplier * (stream.service?.cached !== false ? 1 : 0);
        case "library":
          return multiplier * (stream.library ? 1 : 0);
        case "size":
          return multiplier * (stream.size ?? 0);
        case "bitrate":
          return multiplier * (stream.bitrate ?? 0);
        case "seeders":
          return multiplier * (stream.torrent?.seeders ?? 0);
        case "private":
          return multiplier * (stream.torrent?.private ? 1 : 0);
        case "age":
          return multiplier * (stream.age ?? 0);
        case "encode": {
          if (!userData.preferredEncodes) {
            return 0;
          }
          const index = userData.preferredEncodes?.findIndex(
            (encode) => encode === (stream.parsedFile?.encode || "Unknown")
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        case "addon":
          if (!userData.presets) {
            return 0;
          }
          const idx = userData.presets.findIndex(
            (p) => p.instanceId === stream.addon.preset.id
          );
          return multiplier * -(idx === -1 ? Infinity : idx);
        case "resolution": {
          if (!userData.preferredResolutions) {
            return 0;
          }
          const index = userData.preferredResolutions?.findIndex(
            (resolution) => resolution === (stream.parsedFile?.resolution || "Unknown")
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        case "quality": {
          if (!userData.preferredQualities) {
            return 0;
          }
          const index = userData.preferredQualities.findIndex(
            (quality) => quality === (stream.parsedFile?.quality || "Unknown")
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        case "visualTag": {
          if (!userData.preferredVisualTags) {
            return 0;
          }
          const effectiveVisualTags = stream.parsedFile?.visualTags.length ? stream.parsedFile.visualTags : ["Unknown"];
          if (effectiveVisualTags.every(
            (tag) => !userData.preferredVisualTags.includes(tag)
          )) {
            return multiplier * -Infinity;
          }
          let minIndex = userData.preferredVisualTags?.length;
          for (const tag of effectiveVisualTags) {
            if (constants_exports.VISUAL_TAGS.includes(tag)) {
              const idx2 = userData.preferredVisualTags?.indexOf(tag);
              if (idx2 !== void 0 && idx2 !== -1 && idx2 < minIndex) {
                minIndex = idx2;
              }
            }
          }
          return multiplier * -minIndex;
        }
        case "audioTag": {
          if (!userData.preferredAudioTags) {
            return 0;
          }
          const effectiveAudioTags = stream.parsedFile?.audioTags.length ? stream.parsedFile.audioTags : ["Unknown"];
          if (effectiveAudioTags.every(
            (tag) => !userData.preferredAudioTags.includes(tag)
          )) {
            return multiplier * -Infinity;
          }
          let minAudioIndex = userData.preferredAudioTags.length;
          for (const tag of effectiveAudioTags) {
            if (constants_exports.AUDIO_TAGS.includes(tag)) {
              const idx2 = userData.preferredAudioTags?.indexOf(tag);
              if (idx2 !== void 0 && idx2 !== -1 && idx2 < minAudioIndex) {
                minAudioIndex = idx2;
              }
            }
          }
          return multiplier * -minAudioIndex;
        }
        case "streamType": {
          if (!userData.preferredStreamTypes) {
            return 0;
          }
          const index = userData.preferredStreamTypes?.findIndex(
            (type) => type === stream.type
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        case "language": {
          let minLanguageIndex = userData.preferredLanguages?.length;
          if (minLanguageIndex === void 0) {
            return 0;
          }
          const effectiveLanguages = stream.parsedFile?.languages?.length ? stream.parsedFile.languages : ["Unknown"];
          for (const language of effectiveLanguages) {
            const idx2 = userData.preferredLanguages?.indexOf(language);
            if (idx2 !== void 0 && idx2 !== -1 && idx2 < minLanguageIndex) {
              minLanguageIndex = idx2;
            }
          }
          return multiplier * -minLanguageIndex;
        }
        case "subtitle": {
          let minSubtitleIndex = userData.preferredSubtitles?.length;
          if (minSubtitleIndex === void 0) {
            return 0;
          }
          const effectiveSubtitles = stream.parsedFile?.subtitles?.length ? stream.parsedFile.subtitles : ["Unknown"];
          for (const subtitle of effectiveSubtitles) {
            const idx2 = userData.preferredSubtitles?.indexOf(subtitle);
            if (idx2 !== void 0 && idx2 !== -1 && idx2 < minSubtitleIndex) {
              minSubtitleIndex = idx2;
            }
          }
          return multiplier * -minSubtitleIndex;
        }
        case "regexPatterns":
          return multiplier * -(stream.regexMatched ? stream.regexMatched.index : Infinity);
        case "streamExpressionMatched":
          return multiplier * -(stream.streamExpressionMatched?.index ?? Infinity);
        case "streamExpressionScore":
          return multiplier * (stream.streamExpressionScore ?? 0);
        case "regexScore":
          return multiplier * (stream.regexScore ?? 0);
        case "keyword":
          return multiplier * (stream.keywordMatched ? 1 : 0);
        case "service": {
          if (!userData.services) {
            return 0;
          }
          const index = userData.services.findIndex(
            (service) => service.id === stream.service?.id
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        case "seadex": {
          if (!stream.seadex) {
            return multiplier * 0;
          }
          if (stream.seadex.isBest) {
            return multiplier * 2;
          }
          if (stream.seadex.isSeadex) {
            return multiplier * 1;
          }
          return multiplier * 0;
        }
        case "releaseGroup": {
          if (!userData.preferredReleaseGroups?.length) {
            return 0;
          }
          const releaseGroup = stream.parsedFile?.releaseGroup || "Unknown";
          const index = userData.preferredReleaseGroups.findIndex(
            (group) => group.toLowerCase() === releaseGroup.toLowerCase()
          );
          return multiplier * -(index === -1 ? Infinity : index);
        }
        default:
          return 0;
      }
    }
    return sortCriteria.map(
      (sortCriterion) => keyValue(sortCriterion, this.userData)
    ) ?? [];
  }
};
var sorter_default = StreamSorter;

// vendor/aiostreams-source/parser/title-normalise.ts
var germanDigraphMap = {
  \u00C4: "Ae",
  \u00E4: "ae",
  \u00D6: "Oe",
  \u00F6: "oe",
  \u00DC: "Ue",
  \u00FC: "ue"
};
var nordicDigraphMap = {
  \u00C5: "Aa",
  \u00E5: "aa"
};
var languageDigraphMaps = {
  de: germanDigraphMap,
  da: nordicDigraphMap,
  no: nordicDigraphMap,
  nb: nordicDigraphMap,
  nn: nordicDigraphMap
};
var asciiFoldMap = {
  \u00DF: "ss",
  \u0131: "i",
  \u00F8: "o",
  \u00D8: "O",
  \u0142: "l",
  \u0141: "L",
  \u0111: "d",
  \u0110: "D",
  \u00E6: "ae",
  \u00C6: "Ae",
  \u0153: "oe",
  \u0152: "Oe",
  \u00F0: "d",
  \u00D0: "D",
  \u00FE: "th",
  \u00DE: "Th"
};
function foldToAscii(title, language) {
  if (!/[^\x00-\x7f]/.test(title)) return title;
  const digraphMap = language ? languageDigraphMaps[language] : void 0;
  return (digraphMap ? title.replace(/[ÄäÖöÜüÅå]/g, (c) => digraphMap[c] ?? c) : title).replace(/[ßıøØłŁđĐæÆœŒðÐþÞ]/g, (c) => asciiFoldMap[c]).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function collapseDigraphs(text) {
  return text.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u").replace(/aa/g, "a");
}
function normaliseTitle(title) {
  return collapseDigraphs(
    foldToAscii(title).replace(/&/g, "and").replace(/[^\p{L}\p{N}+]/gu, "").toLowerCase()
  );
}

// scripts/vendor-entry/parser.ts
var parseFile = (name) => file_default.parse(name);
var sortNative = (streams, profile, context) => new sorter_default(profile).sort(streams, context);
export {
  normaliseTitle,
  parseFile,
  sortNative
};
