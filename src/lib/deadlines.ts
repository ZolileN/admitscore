export interface ApplicationDeadline {
  id: string;
  title: string;
  institution: string;
  opens?: string;
  closes: string;
  note?: string;
  category: "university" | "funding" | "general";
}

/** Key 2026 application windows — verify on official sites before applying. */
export const APPLICATION_DEADLINES: ApplicationDeadline[] = [
  {
    id: "caos",
    title: "CAO (KZN universities)",
    institution: "Central Applications Office",
    closes: "30 September 2026",
    category: "general",
    note: "UKZN, DUT, UNIZULU and other KZN institutions.",
  },
  {
    id: "nsfas",
    title: "NSFAS bursary applications",
    institution: "NSFAS",
    opens: "September 2026",
    closes: "31 January 2027",
    category: "funding",
    note: "Apply early — funding is not automatic.",
  },
  {
    id: "unisa",
    title: "UNISA undergraduate applications",
    institution: "UNISA",
    opens: "August 2026",
    closes: "October 2026",
    category: "university",
  },
  {
    id: "uct",
    title: "UCT undergraduate applications",
    institution: "University of Cape Town",
    closes: "31 July 2026",
    category: "university",
  },
  {
    id: "wits",
    title: "Wits undergraduate applications",
    institution: "University of the Witwatersrand",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "up",
    title: "UP undergraduate applications",
    institution: "University of Pretoria",
    closes: "30 June 2026",
    category: "university",
  },
  {
    id: "uj",
    title: "UJ undergraduate applications",
    institution: "University of Johannesburg",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "nwu",
    title: "NWU undergraduate applications",
    institution: "North-West University",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "nmu",
    title: "NMU undergraduate applications",
    institution: "Nelson Mandela University",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "cput",
    title: "CPUT undergraduate applications",
    institution: "Cape Peninsula University of Technology",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "tut",
    title: "TUT undergraduate applications",
    institution: "Tshwane University of Technology",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "dut",
    title: "DUT undergraduate applications",
    institution: "Durban University of Technology",
    closes: "30 September 2026",
    category: "university",
  },
  {
    id: "matric-results",
    title: "NSC results release (expected)",
    institution: "DBE / IEB",
    closes: "Mid-January 2027",
    category: "general",
    note: "Use final results to confirm eligibility before accepting offers.",
  },
];
