export class ManipuladorCadenas {
  constructor() {}

  /** Convierte una cadena a Title Case */
  static toTitle(texto: string): string {
    let palabraTitle = "";
    const palabras = texto.trim().toLowerCase().split(" ");

    for (const palabra of palabras) {
      if (palabra !== "") {
        palabraTitle +=
          palabra[0].toUpperCase() + palabra.substring(1) + " ";
      }
    }

    return palabraTitle.trim();
  }

  /** Quita acentos de una cadena */
  static quitarAcentos(texto: string): string {
    const patrones = [
      /[\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5]/g,
      /[\u00E8\u00E9\u00EA\u00EB]/g,
      /[\u00EC\u00ED\u00EE\u00EF]/g,
      /[\u00F2\u00F3\u00F4\u00F5\u00F6]/g,
      /[\u00F9\u00FA\u00FB\u00FC]/g,
    ];
    const reemplazos = ["a", "e", "i", "o", "u"];

    let resultado = texto;
    for (let i = 0; i < patrones.length; i++) {
      resultado = resultado.replace(patrones[i], reemplazos[i]);
    }

    return resultado;
  }

  /** Formatea una fecha según un patrón */
  static formatDate(date: Date, formatString?: string): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error("El primer argumento debe ser un objeto Date válido.");
    }

    const baseOptions: Intl.DateTimeFormatOptions = {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-US", baseOptions);
    let formattedDateFull = formatter.format(date);

    const timeRegex = /(, )(\d{2}):(\d{2}):(\d{2})/;
    formattedDateFull = formattedDateFull.replace(
      timeRegex,
      (match, separator, hh, mm, ss) => {
        if (hh === "24") {
          return `${separator}00:${mm}:${ss}`;
        }
        return match;
      }
    );

    const [datePart, timePart] = formattedDateFull.split(", ");
    const [month, day, year] = datePart.split("/");
    const [hours, minutes, seconds] = (timePart || "00:00:00").split(":");

    const replacements: Record<string, string> = {
      YYYY: year,
      MM: month,
      DD: day,
      HH: hours,
      mm: minutes,
      ss: seconds,
    };

    const finalFormat = formatString || "YYYY-MM-DD HH:mm:ss";

    let result = finalFormat;

    for (const key in replacements) {
      result = result.replace(new RegExp(key, "g"), replacements[key]);
    }

    if (formatString === "STAMP") {
      result = `${year}-${month}-${day}T12:00:00`;
    }

    return result;
  }
}
