export interface iStormDetails{
    //? optional property
    //source: https://stackoverflow.com/questions/39713349/make-all-properties-within-a-typescript-interface-optional
    episode_id: number,
    event_type: string,
    begin_date_time: string,
    end_date_time: string,
    injuries_direct?: number,
    injuries_indirect?: number,
    deaths_direct?: number,
    deaths_indirect?: number,
    damage_crops?: number,
    damage_property?: number,
    episode_narrative?: string,
    event_narrative?: string,
    location?: string,
    state?: string,
    prcp?: number,
    snow?: number,
    snwd?: number,
    tmax?: number,
    tmin?: number,
    flood_cause?: string,
    

    totalInjuriesDirect?: number,
    totalInjuriesIndirect?: number,
    totalDeathsDirect?: number,
    totalDeathsIndirect?: number,

    totalInjuries?: number,
    totalDeaths?: number,
    totalCropDamages?: number,
    totalPropertyDamages?: number,
    eventNarratives?: [{state: string, location: string, narrative: string}],
}