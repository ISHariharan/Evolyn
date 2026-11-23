// The activity catalogue: every activity in the 2024 Adult Compendium of
// Physical Activities with its MET value (how hard it is compared with sitting
// still). Calories are estimated as MET x weight (kg) x hours.

export interface CatalogueHeading {
    code: string;            // "15"
    name: string;            // "Sports"
    countsForGoals: boolean; // false for e.g. sleeping or driving
}

export interface CatalogueActivity {
    code: string;        // "15330"
    headingCode: string; // "15"
    met: number;         // 8.0
    description: string; // "Handball, team"
}

export interface Catalogue {
    edition: string;     // "2024_ADULT"
    attribution: string;
    headings: CatalogueHeading[];
    activities: CatalogueActivity[];
}
