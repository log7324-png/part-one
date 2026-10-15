import { writeFileSync } from 'node:fs';
import { COMPANIES, FACILITIES, COMPARE } from './src/data/content.js';
writeFileSync(new URL('./backend/data/content.json',import.meta.url), JSON.stringify({companies:COMPANIES,facilities:FACILITIES,compare:COMPARE},null,2)+'\n');
console.log(`Exported ${FACILITIES.length} reviewed facilities.`);
