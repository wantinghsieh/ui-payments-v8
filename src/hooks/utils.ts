import DOMPurify from "dompurify";

/** Formats a Date to a local datetime string (YYYY-MM-DDTHH:mm:ss) without UTC conversion. */
export function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/* Check if value is null or empty */
export function isNullEmpty(value: string) {
  return value == null || value.trim().length === 0;
}

/* Check if value is null */
export function isNull(value: string) {
  return value == null;
}

/* Format the $ amount display in bill summary section on the home page */
export const MoneyFormatter = Intl.NumberFormat("en-US", {
  currency: "USD",
  currencyDisplay: "symbol",
  currencySign: "standard",
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  minimumIntegerDigits: 1,
});

export const setUDOVariables = (udo: any) => {
  setUDOData(udo);

  const utag: any = window.utag;
  const utag_data: any = window.utag_data;
  if (typeof utag !== "undefined") {
    if (utag_data) {
      Object.keys(udo).forEach((key) => {
        // utag_data["pageName"] = udo.pageName;
        utag_data[key] = udo[key];
      });

      utag?.view(
        Object.keys(udo).reduce((acc: { [key: string]: any }, key) => {
          // pageType: DOMPurify.sanitize(udo.pageType)
          acc[key] = DOMPurify.sanitize(udo[key]);
          return acc;
        }, {})
      );
    }
  }
};

const setUDOData = (newUDOData: any) => {
  window.utag_data = {
    ...window.utag_data, // Keep the original properties
    ...newUDOData, // Overwrite with new values or add if new
  };
};

// Formats date from MM/DD/YYYY to Month, date year (e.g. Dec, 05 2025)
export const formatDate = (dateStr: string) => {
  if (!dateStr) {
    return "";
  }
  const [month, day, year] = dateStr.split("/");
  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  // Get the formatted date
  const formattedDate = date.toLocaleDateString("en-US", options);
  // Add a comma after the day
  return formattedDate.replace(/(\d{1,2})(?=\s)/, "$1,");
};
