import { Directive, inject, OnInit } from "@angular/core";
import { AnalyticsService } from "../services/analytics/analytics.service";
import { ActivatedRoute } from "@angular/router";
import { StatItem, TimeRangeKey } from "../../models/analytic/adminAnalytics.interface";
import { BaseAnalyticsData } from "../../models/base-analytics-data/base-analytics.interface";
import { LocationService } from "./location.service";
import { RangeContext, RangeService } from "../services/range/range.service";

@Directive()

export abstract class BaseAnalyticsComponent implements OnInit {
    protected route = inject(ActivatedRoute);
    protected analyticsService = inject(AnalyticsService);
    protected locationService = inject(LocationService);
    protected rangeService = inject(RangeService);

    displayedColumns: string[] = ['timestamp', 'location', 'device', 'referrer'];


    isLoading = false;
    error: string | null = null;
    selectedRange: TimeRangeKey = '1d';

    deviceChartData: number[] = [];
    deviceChartLabels: string[] = [];
    osChartData: number[] = [];
    osChartLabels: string[] = [];

    // Abstract methods that child components must implement
    abstract getAnalyticsData(): BaseAnalyticsData | null;
    abstract loadAnalytics(): void;
    abstract getContext(): RangeContext;

    ngOnInit(): void {
        const storedRange = this.rangeService.getRange(this.getContext()) as TimeRangeKey;
        if (storedRange) {
            this.selectedRange = storedRange;
        }
        this.loadAnalytics();
    }

    // Shared properties
    get timeRanges() { return this.analyticsService.timeRanges; }
    get browserIconMap() { return this.analyticsService.browserIconMap; }
    get referrerIconMap() { return this.analyticsService.referrerIconMap; }
    get deviceIconMap() { return this.analyticsService.deviceIconMap; }
    get osIconMap() { return this.analyticsService.osIconMap; }

    // Shared computed properties
    get timelineData(): number[] {
        return this.getAnalyticsData()?.timeline?.data ?? [];
    }

    get timelineLabels(): string[] {
        return this.getAnalyticsData()?.timeline?.labels ?? [];
    }

    get hasTimelineClicks(): boolean {
        return this.timelineData.some(v => v > 0);
    }

    get referrerStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topReferrers ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get browserStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topBrowsers ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get deviceStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topDevices ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get osStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topOS ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get countryStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topCountries ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get regionsStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topRegions ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get citiesStats(): StatItem[] {
        const data = this.getAnalyticsData()?.topCities ?? [];
        return this.analyticsService.calculateStats(data);
    }

    get countryClickData(): { countryCode: string, value: number }[] {
        const countries = this.getAnalyticsData()?.topCountries ?? [];
        return this.analyticsService.getCountryClickData(countries);
    }

    get recentActivity() {
        const analytics = this.getAnalyticsData()?.analytics ?? [];
        return analytics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }

    // Grid classes
    get deviceGridClass(): string {
        return this.analyticsService.getGridClass(this.deviceStats.length);
    }

    get osGridClass(): string {
        return this.analyticsService.getGridClass(this.osStats.length);
    }

    get countryGridClass(): string {
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }

    // Shared methods
    async changeRange(range: TimeRangeKey) {
        this.selectedRange = range;
        this.rangeService.setRange(this.getContext(), range);
        this.loadAnalytics();
    }

    refreshData(): void {
        this.loadAnalytics();
    }

    getRangeComparisonText(range: string): string {
        return this.analyticsService.getRangeComparisonText(range);
    }

    // Chart setup methods
    protected setChartData() {
        const devices = this.deviceStats;
        this.deviceChartData = devices.map(d => d.percentage);
        this.deviceChartLabels = devices.map(d => d.name);
    }

    protected setChartDataOs() {
        const os = this.osStats;
        this.osChartData = os.map(d => d.percentage);
        this.osChartLabels = os.map(d => d.name);
    }

    // Icon color
    getIconClasses(title: string): { bg: string; color: string } {
        if (title.startsWith('Top Country')) {
            return { bg: 'bg-green-200 dark:bg-green-800', color: 'text-green-600 dark:text-green-200' };
        }
        if (title.startsWith('Top OS')) {
            return { bg: 'bg-cyan-200 dark:bg-cyan-800', color: 'text-cyan-600 dark:text-cyan-200' };
        }
        if (title.startsWith('Total Clicks')) {
            return { bg: 'bg-yellow-200 dark:bg-yellow-800', color: 'text-yellow-600 dark:text-yellow-200' };
        }
        if (title.startsWith('Unique Visitors')) {
            return { bg: 'bg-pink-200 dark:bg-pink-900', color: 'text-pink-600 dark:text-pink-200' };
        }
        if (title.startsWith('Top Referrer')) {
            return { bg: 'bg-teal-200 dark:bg-teal-800', color: 'text-teal-600 dark:text-teal-200' };
        }
        if (title.startsWith('Top Device')) {
            return { bg: 'bg-fuchsia-200 dark:bg-fuchsia-900', color: 'text-fuchsia-600 dark:text-fuchsia-200' };
        }

        switch (title) {
            case 'Total Users':
                return { bg: 'bg-purple-200 dark:bg-purple-900', color: 'text-purple-600 dark:text-purple-200' };
            case 'Blocked Users':
                return { bg: 'bg-rose-300 dark:bg-rose-800', color: 'text-rose-600 dark:text-rose-200' };
            case 'Total URLs':
                return { bg: 'bg-blue-200 dark:bg-blue-900', color: 'text-blue-600 dark:text-blue-200' };
            case 'Blocked URLs':
                return { bg: 'bg-orange-300 dark:bg-orange-900', color: 'text-orange-600 dark:text-orange-300' };
            case 'Total QR':
                return { bg: 'bg-indigo-300 dark:bg-indigo-800', color: 'text-indigo-600 dark:text-indigo-200' };
            default:
                return { bg: 'bg-gray-200 dark:bg-gray-900', color: 'text-gray-600 dark:text-gray-300' };
        }
    }

    // Capitalize
    capitalize(str: string | undefined): string {
        if (!str) return '';
        str = str.toLowerCase();
        return str[0].toUpperCase() + str.slice(1);
    }

    // Returns the full country name 
    getCountryName(countryCode?: string): string {
        if (!countryCode || countryCode.toLowerCase() === 'unknown') return 'Unknown';
        return this.locationService.getCountryName(countryCode.toUpperCase());
    }

    // Returns the country flag
    getFlagClass(countryCode?: string): string {
        const name = this.getCountryName(countryCode);
        if (name.toLowerCase() === 'unknown') return 'fi fi-un';
        return 'fi fi-' + countryCode?.toLowerCase();
    }

    // Returns the name of the top country from analytics data
    get topCountryName(): string {
        return this.getCountryName(this.getAnalyticsData()?.topCountries?.[0]?.name);
    }

    // Returns the flag class of the top country from analytics data
    get topCountryFlag(): string {
        return this.getFlagClass(this.getAnalyticsData()?.topCountries?.[0]?.name);
    }


}