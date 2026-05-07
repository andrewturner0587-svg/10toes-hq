export const TIERS = {
  "1": { label: "Tier 1", sub: "High Vol / High Comp", color: "#ef4444", bg: "#ef444412" },
  "2": { label: "Tier 2", sub: "Strong / Moderate Comp", color: "#f59e0b", bg: "#f59e0b12" },
  "3": { label: "Tier 3", sub: "Sweet Spot", color: "#10b981", bg: "#10b98112" },
  "4": { label: "Tier 4", sub: "Your Lane", color: "#3b82f6", bg: "#3b82f612" },
};

export const GENRES = ["Trap","Boom Bap","Lo-Fi","Afrobeat","Dancehall","Old School Hip-Hop","Gospel Rap","Phonk","R&B","Country Rap","Dark Trap"];
export const STYLES = ["Freestyle Beat","Type Beat","Rap Instrumental","Rap Beat"];
export const MOODS = ["Hard","Dark","Chill","Aggressive","Sad","Hype","Emotional","Uplifting","Smooth","Bouncy","Spiritual","Energetic","Mellow","Gritty"];
export const ERAS = ["90s","2000s","Old School","Modern","Retro"];
export const INSTRUMENTS = ["Piano","Guitar","Flute","Strings","Synth","Organ","Saxophone","Bells","Choir","Bass-heavy"];
export const LICENSE_TYPES = ["Free For Profit","Paid Lease","Exclusive"];

export const NICHE_DATA = [
  { cat: "Freestyle Beats", items: [
    { t:"1", title:"Freestyle Beat", tags:"freestyle, rap, open", vol:"Very High", comp:"High", note:"Broadest search — massive traffic, hard to rank" },
    { t:"1", title:"Rap Beat / Rap Instrumental", tags:"rap, beat, instrumental", vol:"Very High", comp:"High", note:"Generic but huge volume" },
    { t:"2", title:"Freestyle Beat Trap", tags:"freestyle, trap, 808", vol:"High", comp:"Medium", note:"Most common freestyle combo search" },
    { t:"2", title:"Freestyle Beat Hard", tags:"freestyle, hard, aggressive", vol:"High", comp:"Medium", note:"Rappers looking for energy" },
    { t:"2", title:"Aggressive Rap Beat", tags:"aggressive, rap, hype", vol:"High", comp:"Medium", note:"Battle rap / workout crowd" },
    { t:"3", title:"Dark Freestyle Beat", tags:"freestyle, dark, moody", vol:"Medium", comp:"Low", note:"SWEET SPOT — mood+style, barely targeted" },
    { t:"3", title:"Freestyle Beat Piano", tags:"freestyle, piano, melodic", vol:"Medium", comp:"Low", note:"Instrument tag = way less competition" },
    { t:"3", title:"Freestyle Beat Guitar", tags:"freestyle, guitar, melodic", vol:"Medium", comp:"Low", note:"Guitar + anything is underserved" },
    { t:"3", title:"Chill Freestyle Beat", tags:"freestyle, chill, smooth", vol:"Medium", comp:"Low", note:"Content creator / vibes crowd" },
    { t:"3", title:"Hype Rap Beat", tags:"hype, rap, energy, workout", vol:"Medium", comp:"Low", note:"Workout / motivational searchers" },
    { t:"4", title:"Inspirational Freestyle Beat", tags:"uplifting, freestyle, positive", vol:"Low-Med", comp:"Very Low", note:"Faith-adjacent, untapped niche" },
  ]},
  { cat: "Trap Beats", items: [
    { t:"1", title:"Trap Beat", tags:"trap, 808, hi-hat", vol:"Very High", comp:"Very High", note:"#1 searched genre on BeatStars" },
    { t:"1", title:"Free Beat / Free Type Beat", tags:"free, type beat, download", vol:"Very High", comp:"Very High", note:"#3 on BeatStars searches" },
    { t:"2", title:"Hard Trap Beat", tags:"trap, hard, 808, aggressive", vol:"High", comp:"Medium", note:"Strong search, workable competition" },
    { t:"2", title:"Dark Trap Beat", tags:"trap, dark, moody, minor", vol:"High", comp:"Medium", note:"Very searchable mood+genre combo" },
    { t:"2", title:"Sad Beat / Emotional Beat", tags:"sad, emotional, piano", vol:"High", comp:"Medium", note:"#13 on BeatStars, growing fast" },
    { t:"3", title:"Sad Trap Beat Piano", tags:"trap, sad, piano, emotional", vol:"Medium", comp:"Low", note:"Stacking descriptors = less comp" },
    { t:"3", title:"Trap Beat Guitar", tags:"trap, guitar, melodic", vol:"Medium", comp:"Low", note:"Guitar trap is underserved" },
  ]},
  { cat: "Boom Bap & Old School", items: [
    { t:"2", title:"Boom Bap Beat", tags:"boom bap, old school, 90s", vol:"High", comp:"Low-Med", note:"#4 on BeatStars — surprisingly open" },
    { t:"3", title:"90s Hip Hop Beat", tags:"90s, old school, golden age", vol:"Medium", comp:"Low", note:"Suno's sweet spot — BIG opportunity" },
    { t:"3", title:"Boom Bap Freestyle Beat", tags:"boom bap, freestyle, classic", vol:"Medium", comp:"Very Low", note:"Two hot terms, almost no competition" },
    { t:"3", title:"Old School Rap Beat", tags:"old school, classic, rap", vol:"Medium", comp:"Low", note:"Nostalgia crowd, dedicated audience" },
    { t:"3", title:"2000s Hip Hop Beat", tags:"2000s, throwback, rap", vol:"Medium", comp:"Very Low", note:"Almost ZERO competition" },
    { t:"3", title:"East Coast Type Beat", tags:"east coast, boom bap, ny", vol:"Medium", comp:"Low", note:"Regional style, loyal buyers" },
    { t:"4", title:"Boom Bap Piano Beat", tags:"boom bap, piano, soulful", vol:"Low-Med", comp:"Very Low", note:"Hyper-specific, almost no results" },
    { t:"4", title:"Old School Freestyle Beat", tags:"old school, freestyle, cypher", vol:"Low-Med", comp:"Very Low", note:"Classic cypher vibes, empty niche" },
  ]},
  { cat: "Lo-Fi & Chill", items: [
    { t:"1", title:"Lo-Fi Beat", tags:"lo-fi, chill, study", vol:"Very High", comp:"High", note:"Massive but very saturated" },
    { t:"2", title:"Lo-Fi Rap Beat", tags:"lo-fi, rap, chill", vol:"Medium", comp:"Low-Med", note:"Adding 'rap' narrows + less comp" },
    { t:"3", title:"Chill Beat", tags:"chill, smooth, vibes", vol:"Medium", comp:"Low", note:"Background / study music crowd" },
    { t:"3", title:"Smooth Rap Beat", tags:"smooth, rap, mellow", vol:"Medium", comp:"Low", note:"R&B-adjacent rappers searching" },
  ]},
  { cat: "Afrobeat & Global", items: [
    { t:"2", title:"Afrobeat Type Beat", tags:"afrobeat, percussion, bounce", vol:"High", comp:"Medium", note:"Global growth, #5 on BeatStars" },
    { t:"3", title:"Afrobeat Freestyle Beat", tags:"afrobeat, freestyle, bounce", vol:"Medium", comp:"Very Low", note:"Combining two hot genres, barely anyone here" },
    { t:"3", title:"Dancehall Type Beat", tags:"dancehall, caribbean, riddim", vol:"Medium", comp:"Low", note:"Growing globally, few producers" },
  ]},
  { cat: "Your Lane — Faith & Niche", items: [
    { t:"4", title:"Gospel Rap Beat", tags:"gospel, rap, spiritual, faith", vol:"Low-Med", comp:"Very Low", note:"YOUR LANE — faith + hip-hop crossover" },
    { t:"4", title:"Spiritual Hip Hop Beat", tags:"spiritual, hip-hop, uplifting", vol:"Low", comp:"Very Low", note:"Clean rap audience searching" },
    { t:"4", title:"Storytelling Beat", tags:"storytelling, narrative, cinematic", vol:"Low-Med", comp:"Very Low", note:"Narrative rappers, few producers tag this" },
    { t:"4", title:"Uplifting Rap Beat", tags:"uplifting, motivational, positive", vol:"Low-Med", comp:"Very Low", note:"Positive/motivational crowd, untapped" },
    { t:"4", title:"Country Rap Beat", tags:"country, rap, trap, southern", vol:"Growing", comp:"Very Low", note:"Post-Cowboy Carter surge" },
    { t:"4", title:"Smooth R&B Type Beat", tags:"r&b, smooth, soulful", vol:"Medium", comp:"Low", note:"Suno handles R&B well, singers search" },
  ]},
];
