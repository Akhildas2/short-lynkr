import { Injectable } from "@angular/core";
import { Country, State, City } from 'country-state-city';

@Injectable({ providedIn: 'root' })
export class LocationService {

    getCountryName(code: string): string {
        if (!code || code === 'Unknown') return 'Unknown';
        return Country.getCountryByCode(code)?.name || code;
    }

    getRegionName(countryCode: string, regionCode: string): string {
        if (!countryCode || countryCode === 'Unknown' || !regionCode || regionCode === 'Unknown') {
            return 'Unknown';
        }
        return State.getStatesOfCountry(countryCode)
            .find(s => s.isoCode === regionCode)?.name || regionCode;
    }

}