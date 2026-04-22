export const courseUnitTitles: Record<string, readonly string[]> = {
  w01: [
    "Risk and Insurance",
    "The Insurance Market",
    "Insurance Contracts",
    "Legal Principles",
    "Regulation",
    "Ethics and Governance",
  ],
  wue: [
    "Material Facts and Disclosure",
    "Underwriting Procedures",
    "Insurance Policies",
    "Renewals and Cancellation",
    "Personal Insurances",
    "Commercial Insurances",
    "Support Services",
    "Underwriting Considerations",
    "Pricing Principles",
    "Pricing Factors",
    "Managing Exposure",
  ],
  wce: [
    "General Principles of Claims",
    "Insurance Products",
    "Claims Considerations",
    "Claims Handling Procedures",
    "Claims Function and Structure",
    "Claims Settlement",
    "Expense Management",
  ],
};

export const courseCodes = ["w01", "wue", "wce"] as const;
export type CourseCode = (typeof courseCodes)[number];
