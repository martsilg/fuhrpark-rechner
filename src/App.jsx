import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Car, Zap, Calculator, Building2, ChevronDown, ChevronUp, User, Info } from 'lucide-react';

const InputField = ({ label, value, onChange, suffix, min = 0, step = 1, tooltip }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
      {label}
      {tooltip && (
        <div className="relative group">
          <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
            {tooltip}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16 text-base"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function FuhrparkRechner() {
  const [fahrzeug, setFahrzeug] = useState({
    name: 'VW ID.3 Pure',
    leasingNetto: 222,
    laufzeitMonate: 48,
    fahrleistung: 10000,
    ueberfuehrung: 790,
    bruttolistenpreis: 34000,
    verbrauch: 16,
  });

  const [infrastruktur, setInfrastruktur] = useState({
    wallboxFirma: 1200,
    wallboxZuhause: 1200,
    abschreibungJahre: 5,
    strompreis: 0.30,
    ladekartenMonat: 40,
    versicherungMonat: 80,
  });

  const [unternehmen, setUnternehmen] = useState({
    mitarbeiter: 20,
    fuhrparkGehalt: 54000,
    personalSchwelle: 100,
    zusatzPersonalKosten: 40000,
    grenzsteuersatz: 45,
  });

  const [verbrenner, setVerbrenner] = useState({
    leasingMonat: 350,
    versicherungMonat: 100,
    kfzSteuer: 150,
    verbrauchL: 7,
    spritpreis: 1.70,
    wartung: 500,
  });

  const [anEinstellungen, setAnEinstellungen] = useState({
    steuersatzAN: 35,
    svAnteilAG: 20,
    svAnteilAN: 20,
    privatStromAnteil: 30,
    geldwerterVorteilProzent: 0.25,
    arbeitstage: 220,
    stundenProTag: 8,
    samstage: 20,
    samstagStunden: 5.5,
    samstagZuschlag: 50,
    ueberstundenZulage: 25,
  });

  const berechnungen = useMemo(() => {
    const steuersatz = unternehmen.grenzsteuersatz / 100;
    const leasingBrutto = fahrzeug.leasingNetto * 1.19;
    
    // Arbeitsstunden berechnen (mit Samstags-Zuschlag und Überstunden-Zulage)
    const normaleStunden = anEinstellungen.arbeitstage * anEinstellungen.stundenProTag;
    const samstagsStundenEffektiv = anEinstellungen.samstage * anEinstellungen.samstagStunden * (1 + anEinstellungen.samstagZuschlag / 100);
    const ueberstundenEffektiv = (normaleStunden + (anEinstellungen.samstage * anEinstellungen.samstagStunden)) * (anEinstellungen.ueberstundenZulage / 100);
    const arbeitsstundenJahr = normaleStunden + samstagsStundenEffektiv + ueberstundenEffektiv;
    
    const leasingJahr = leasingBrutto * 12;
    const ueberfuehrungJahr = fahrzeug.ueberfuehrung / (fahrzeug.laufzeitMonate / 12);
    const versicherungJahr = infrastruktur.versicherungMonat * 12;
    const wallboxZuhauseJahr = infrastruktur.wallboxZuhause / infrastruktur.abschreibungJahre;
    const stromJahr = fahrzeug.fahrleistung * (fahrzeug.verbrauch / 100) * infrastruktur.strompreis;
    const ladekartenJahr = infrastruktur.ladekartenMonat * 12;
    const variableProMA = leasingJahr + ueberfuehrungJahr + versicherungJahr + wallboxZuhauseJahr + stromJahr + ladekartenJahr;
    
    const calculateCosts = (ma) => {
      const ladepunkte = Math.ceil(ma / 2);
      const infraFirma = (ladepunkte * infrastruktur.wallboxFirma) / infrastruktur.abschreibungJahre;
      let personalkosten = unternehmen.fuhrparkGehalt;
      if (ma >= unternehmen.personalSchwelle) {
        personalkosten += Math.floor(ma / unternehmen.personalSchwelle) * unternehmen.zusatzPersonalKosten;
      }
      const gesamtkosten = (variableProMA * ma) + personalkosten + infraFirma;
      const kostenProMA = gesamtkosten / ma;
      const stundenlohn = kostenProMA / arbeitsstundenJahr;
      return {
        mitarbeiter: ma,
        gesamtkosten: Math.round(gesamtkosten),
        gesamtkostenEffektiv: Math.round(gesamtkosten * (1 - steuersatz)),
        kostenProMA: Math.round(kostenProMA),
        stundenlohn: Math.round(stundenlohn * 100) / 100,
        stundenlohnEffektiv: Math.round(stundenlohn * (1 - steuersatz) * 100) / 100,
      };
    };
    
    const graphData = [];
    for (let i = 20; i <= 400; i += 10) graphData.push(calculateCosts(i));
    const aktuell = calculateCosts(unternehmen.mitarbeiter);
    
    const geldwerterVorteil = fahrzeug.bruttolistenpreis * (anEinstellungen.geldwerterVorteilProzent / 100) * 12;
    const steuerAN = geldwerterVorteil * (anEinstellungen.steuersatzAN / 100);
    
    const verbrennerJahr = {
      leasing: verbrenner.leasingMonat * 12,
      versicherung: verbrenner.versicherungMonat * 12,
      steuer: verbrenner.kfzSteuer,
      kraftstoff: fahrzeug.fahrleistung * (verbrenner.verbrauchL / 100) * verbrenner.spritpreis,
      wartung: verbrenner.wartung,
    };
    verbrennerJahr.gesamt = verbrennerJahr.leasing + verbrennerJahr.versicherung + verbrennerJahr.steuer + verbrennerJahr.kraftstoff + verbrennerJahr.wartung;
    
    const fwKostenAN = steuerAN + (stromJahr * (anEinstellungen.privatStromAnteil / 100));
    const ersparnis = verbrennerJahr.gesamt - fwKostenAN;
    
    // Balkendiagramm: Gleiche AG-Ausgaben vergleichen
    const agAusgabe = aktuell.kostenProMA; // Was der AG pro MA für Firmenwagen ausgibt
    
    // Bei Lohnerhöhung: AG gibt gleichen Betrag aus
    const lohnBrutto = agAusgabe / (1 + anEinstellungen.svAnteilAG / 100); // Bruttolohn (AG-Ausgabe inkl. AG-SV)
    const lohnAGSV = agAusgabe - lohnBrutto; // AG-Anteil Sozialversicherung
    const lohnANSV = Math.round(lohnBrutto * (anEinstellungen.svAnteilAN / 100)); // AN-Anteil SV
    const lohnSteuer = Math.round(lohnBrutto * (anEinstellungen.steuersatzAN / 100)); // Lohnsteuer
    const lohnNetto = Math.round(lohnBrutto - lohnANSV - lohnSteuer); // Was beim AN ankommt
    
    // Bei Firmenwagen
    const fwWert = Math.round(leasingJahr); // Leasingwert
    const fwExtras = Math.round(agAusgabe - leasingJahr - steuerAN); // Versicherung, Strom, etc.
    
    const balkenData = {
      agAusgabe: Math.round(agAusgabe),
      lohn: {
        netto: lohnNetto,
        anSV: lohnANSV,
        steuer: lohnSteuer,
        agSV: Math.round(lohnAGSV),
      },
      fw: {
        wert: fwWert,
        steuer: Math.round(steuerAN),
        extras: Math.round(fwExtras > 0 ? fwExtras : 0),
      }
    };
    
    return { aktuell, graphData, verbrennerJahr, fwKostenAN: Math.round(fwKostenAN), ersparnis: Math.round(ersparnis), steuersatz, leasingBrutto: Math.round(leasingBrutto), balkenData, geldwerterVorteil: Math.round(geldwerterVorteil), steuerAN: Math.round(steuerAN), arbeitsstundenJahr: Math.round(arbeitsstundenJahr) };
  }, [fahrzeug, infrastruktur, unternehmen, verbrenner, anEinstellungen]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
          <p className="font-bold">{d.mitarbeiter} Mitarbeiter</p>
          <p className="text-blue-600">Ausgabe: {d.stundenlohn.toFixed(2)} €/h</p>
          <p className="text-green-600 font-semibold">Effektiv: {d.stundenlohnEffektiv.toFixed(2)} €/h</p>
          <p className="text-gray-500 text-xs mt-1">Gesamt: {d.gesamtkosten.toLocaleString('de-DE')} €/Jahr</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Car className="w-8 h-8" />
            <h1 className="text-2xl font-bold">E-Firmenwagen Rechner</h1>
          </div>
          <p className="text-blue-100 text-sm">Interaktive Kostenanalyse</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 space-y-4">
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="mb-3 flex items-center gap-3">
            <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
              Ergebnis für
              <input
                type="number"
                value={unternehmen.mitarbeiter}
                onChange={(e) => setUnternehmen({...unternehmen, mitarbeiter: parseFloat(e.target.value) || 1})}
                min={1}
                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold"
              />
              Mitarbeiter
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">Gesamtkosten/Jahr (alle MA)</p>
              <p className="text-xl font-bold text-blue-700">{berechnungen.aktuell.gesamtkosten.toLocaleString('de-DE')} €</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-gray-600">Effektive Belastung (alle MA)</p>
              <p className="text-xl font-bold text-green-700">{berechnungen.aktuell.gesamtkostenEffektiv.toLocaleString('de-DE')} €</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">Pro Stunde je MA (brutto)</p>
              <p className="text-xl font-bold text-blue-700">{berechnungen.aktuell.stundenlohn.toFixed(2)} €</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-gray-600">Pro Stunde je MA (effektiv)</p>
              <p className="text-xl font-bold text-green-700">{berechnungen.aktuell.stundenlohnEffektiv.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <CollapsibleSection title="Fahrzeug" icon={Car}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fahrzeugname</label>
              <input type="text" value={fahrzeug.name} onChange={(e) => setFahrzeug({...fahrzeug, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Leasing (netto)
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                    Monatliche Netto-Leasingrate (ohne MwSt). Der Brutto-Wert wird automatisch berechnet.
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={fahrzeug.leasingNetto}
                    onChange={(e) => setFahrzeug({...fahrzeug, leasingNetto: parseFloat(e.target.value) || 0})}
                    min={0}
                    step={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16 text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€/Mon</span>
                </div>
                <div className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 whitespace-nowrap">
                  Brutto: {berechnungen.leasingBrutto} €
                </div>
              </div>
            </div>
            <InputField label="Laufzeit" value={fahrzeug.laufzeitMonate} onChange={(v) => setFahrzeug({...fahrzeug, laufzeitMonate: v})} suffix="Mon" tooltip="Laufzeit des Leasingvertrags in Monaten" />
            <InputField label="km/Jahr" value={fahrzeug.fahrleistung} onChange={(v) => setFahrzeug({...fahrzeug, fahrleistung: v})} suffix="km" step={1000} tooltip="Jährliche Fahrleistung pro Fahrzeug" />
            <InputField label="Überführung" value={fahrzeug.ueberfuehrung} onChange={(v) => setFahrzeug({...fahrzeug, ueberfuehrung: v})} suffix="€" tooltip="Einmalige Überführungskosten pro Fahrzeug" />
            <InputField label="Listenpreis" value={fahrzeug.bruttolistenpreis} onChange={(v) => setFahrzeug({...fahrzeug, bruttolistenpreis: v})} suffix="€" tooltip="Bruttolistenpreis für die 0,25%-Regel (geldwerter Vorteil)" />
            <InputField label="Verbrauch" value={fahrzeug.verbrauch} onChange={(v) => setFahrzeug({...fahrzeug, verbrauch: v})} suffix="kWh/100km" tooltip="Durchschnittlicher Stromverbrauch pro 100 km" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Unternehmen" icon={Building2}>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Mitarbeiter" value={unternehmen.mitarbeiter} onChange={(v) => setUnternehmen({...unternehmen, mitarbeiter: v})} suffix="MA" min={1} tooltip="Anzahl der Mitarbeiter mit Firmenwagen" />
            <InputField label="Grenzsteuersatz AG" value={unternehmen.grenzsteuersatz} onChange={(v) => setUnternehmen({...unternehmen, grenzsteuersatz: v})} suffix="%" tooltip="Grenzsteuersatz des Unternehmens (GmbH & Co. KG NRW: ~45%)" />
            <InputField label="Fuhrpark-Gehalt" value={unternehmen.fuhrparkGehalt} onChange={(v) => setUnternehmen({...unternehmen, fuhrparkGehalt: v})} suffix="€/Jahr" tooltip="Jahresgehalt Fuhrparkmanager inkl. AG-Anteile" />
            <InputField label="Personal-Schwelle" value={unternehmen.personalSchwelle} onChange={(v) => setUnternehmen({...unternehmen, personalSchwelle: v})} suffix="MA" tooltip="Ab dieser Anzahl an Firmenfahrzeugen wird zusätzliches Personal für die Fuhrparkverwaltung benötigt" />
            <InputField label="Zusatzpersonal-Kosten" value={unternehmen.zusatzPersonalKosten} onChange={(v) => setUnternehmen({...unternehmen, zusatzPersonalKosten: v})} suffix="€/Jahr" tooltip="Jahreskosten pro zusätzlicher Teilzeitkraft für die Fuhrparkverwaltung" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Infrastruktur" icon={Zap} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Wallbox Firma" value={infrastruktur.wallboxFirma} onChange={(v) => setInfrastruktur({...infrastruktur, wallboxFirma: v})} suffix="€" tooltip="Kosten pro Ladepunkt auf dem Firmengelände (1 Ladepunkt für je 2 Mitarbeiter)" />
            <InputField label="Wallbox Zuhause" value={infrastruktur.wallboxZuhause} onChange={(v) => setInfrastruktur({...infrastruktur, wallboxZuhause: v})} suffix="€" tooltip="Kosten für Wallbox-Installation beim Mitarbeiter zu Hause (pro Mitarbeiter)" />
            <InputField label="Abschreibung" value={infrastruktur.abschreibungJahre} onChange={(v) => setInfrastruktur({...infrastruktur, abschreibungJahre: v})} suffix="Jahre" tooltip="Abschreibungszeitraum für Wallbox-Investitionen" />
            <InputField label="Strompreis" value={infrastruktur.strompreis} onChange={(v) => setInfrastruktur({...infrastruktur, strompreis: v})} suffix="€/kWh" step={0.01} tooltip="Strompreis pro Kilowattstunde (Firmentarif)" />
            <InputField label="Ladekarten-Pauschale" value={infrastruktur.ladekartenMonat} onChange={(v) => setInfrastruktur({...infrastruktur, ladekartenMonat: v})} suffix="€/Mon" tooltip="Monatliche Pauschale für öffentliche Ladekarten pro Mitarbeiter" />
            <InputField label="Flottenversicherung" value={infrastruktur.versicherungMonat} onChange={(v) => setInfrastruktur({...infrastruktur, versicherungMonat: v})} suffix="€/Mon" tooltip="Vollkasko-Versicherung pro Fahrzeug pro Monat" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Vergleichs-Verbrenner" icon={Car} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Leasing/Finanzierung" value={verbrenner.leasingMonat} onChange={(v) => setVerbrenner({...verbrenner, leasingMonat: v})} suffix="€/Mon" tooltip="Monatliche Leasing- oder Finanzierungsrate für Verbrenner" />
            <InputField label="Versicherung" value={verbrenner.versicherungMonat} onChange={(v) => setVerbrenner({...verbrenner, versicherungMonat: v})} suffix="€/Mon" tooltip="Monatliche Vollkasko-Versicherung (privat gezahlt)" />
            <InputField label="KFZ-Steuer" value={verbrenner.kfzSteuer} onChange={(v) => setVerbrenner({...verbrenner, kfzSteuer: v})} suffix="€/Jahr" tooltip="Jährliche KFZ-Steuer für Verbrenner-Fahrzeug" />
            <InputField label="Wartung & Verschleiß" value={verbrenner.wartung} onChange={(v) => setVerbrenner({...verbrenner, wartung: v})} suffix="€/Jahr" tooltip="Jährliche Wartungskosten (Ölwechsel, Bremsen, Filter, etc.)" />
            <InputField label="Verbrauch" value={verbrenner.verbrauchL} onChange={(v) => setVerbrenner({...verbrenner, verbrauchL: v})} suffix="L/100km" step={0.5} tooltip="Durchschnittlicher Kraftstoffverbrauch pro 100 km" />
            <InputField label="Spritpreis" value={verbrenner.spritpreis} onChange={(v) => setVerbrenner({...verbrenner, spritpreis: v})} suffix="€/L" step={0.05} tooltip="Aktueller Preis pro Liter Benzin/Diesel" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="AN-Berechnungsgrundlagen" icon={User} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Arbeitstage/Jahr" value={anEinstellungen.arbeitstage} onChange={(v) => setAnEinstellungen({...anEinstellungen, arbeitstage: v})} suffix="Tage" tooltip="Anzahl der normalen Arbeitstage pro Jahr (Montag-Freitag)" />
            <InputField label="Stunden/Tag" value={anEinstellungen.stundenProTag} onChange={(v) => setAnEinstellungen({...anEinstellungen, stundenProTag: v})} suffix="h" tooltip="Arbeitsstunden pro normalem Arbeitstag" />
            <InputField label="Samstage/Jahr" value={anEinstellungen.samstage} onChange={(v) => setAnEinstellungen({...anEinstellungen, samstage: v})} suffix="Tage" tooltip="Anzahl der zusätzlichen Samstagsarbeitstage pro Jahr" />
            <InputField label="Stunden/Samstag" value={anEinstellungen.samstagStunden} onChange={(v) => setAnEinstellungen({...anEinstellungen, samstagStunden: v})} suffix="h" step={0.5} tooltip="Arbeitsstunden pro Samstag (Standard: 5,5h)" />
            <InputField label="Samstags-Zuschlag" value={anEinstellungen.samstagZuschlag} onChange={(v) => setAnEinstellungen({...anEinstellungen, samstagZuschlag: v})} suffix="%" tooltip="Prozentualer Zuschlag für Samstagsarbeit (üblich: 50%)" />
            <InputField label="Überstunden-Zulage" value={anEinstellungen.ueberstundenZulage} onChange={(v) => setAnEinstellungen({...anEinstellungen, ueberstundenZulage: v})} suffix="%" tooltip="Prozentuale Zulage auf alle Arbeitsstunden (Standard: 25%)" />
            <InputField label="Grenzsteuersatz AN" value={anEinstellungen.steuersatzAN} onChange={(v) => setAnEinstellungen({...anEinstellungen, steuersatzAN: v})} suffix="%" tooltip="Grenzsteuersatz des Arbeitnehmers (Lohnsteuer + Solidaritätszuschlag)" />
            <InputField label="Geldw. Vorteil Regel" value={anEinstellungen.geldwerterVorteilProzent} onChange={(v) => setAnEinstellungen({...anEinstellungen, geldwerterVorteilProzent: v})} suffix="%" step={0.25} tooltip="Monatlicher Prozentsatz vom Listenpreis für geldwerten Vorteil: E-Auto 0,25% | Hybrid 0,5% | Verbrenner 1%" />
            <InputField label="SV-Anteil Arbeitgeber" value={anEinstellungen.svAnteilAG} onChange={(v) => setAnEinstellungen({...anEinstellungen, svAnteilAG: v})} suffix="%" tooltip="Arbeitgeber-Anteil Sozialversicherung (Renten-, Kranken-, Pflege-, Arbeitslosenversicherung)" />
            <InputField label="SV-Anteil Arbeitnehmer" value={anEinstellungen.svAnteilAN} onChange={(v) => setAnEinstellungen({...anEinstellungen, svAnteilAN: v})} suffix="%" tooltip="Arbeitnehmer-Anteil Sozialversicherung (Renten-, Kranken-, Pflege-, Arbeitslosenversicherung)" />
            <InputField label="Privater Stromanteil" value={anEinstellungen.privatStromAnteil} onChange={(v) => setAnEinstellungen({...anEinstellungen, privatStromAnteil: v})} suffix="%" tooltip="Anteil des Stroms für private Fahrten, den der AN selbst bezahlt (ca. 30% wenn zu Hause geladen)" />
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm space-y-1">
            <p><strong>Arbeitsstunden/Jahr:</strong> {berechnungen.arbeitsstundenJahr.toLocaleString('de-DE')} h
              <span className="text-xs text-gray-600 block ml-4">
                • Normale Arbeit: {anEinstellungen.arbeitstage} Tage × {anEinstellungen.stundenProTag}h = {(anEinstellungen.arbeitstage * anEinstellungen.stundenProTag).toLocaleString('de-DE')} h
                {anEinstellungen.samstage > 0 && (
                  <>
                    <br />• Samstage: {anEinstellungen.samstage} Tage × {anEinstellungen.samstagStunden}h × {100 + anEinstellungen.samstagZuschlag}% = {Math.round(anEinstellungen.samstage * anEinstellungen.samstagStunden * (1 + anEinstellungen.samstagZuschlag / 100)).toLocaleString('de-DE')} h
                  </>
                )}
                <br />• Überstunden-Zulage: {anEinstellungen.ueberstundenZulage}% auf {((anEinstellungen.arbeitstage * anEinstellungen.stundenProTag) + (anEinstellungen.samstage * anEinstellungen.samstagStunden)).toLocaleString('de-DE')} h = {Math.round(((anEinstellungen.arbeitstage * anEinstellungen.stundenProTag) + (anEinstellungen.samstage * anEinstellungen.samstagStunden)) * (anEinstellungen.ueberstundenZulage / 100)).toLocaleString('de-DE')} h
              </span>
            </p>
            <p><strong>Geldwerter Vorteil:</strong> {berechnungen.geldwerterVorteil.toLocaleString('de-DE')} €/Jahr ({fahrzeug.bruttolistenpreis.toLocaleString('de-DE')} € × {anEinstellungen.geldwerterVorteilProzent}% × 12)</p>
            <p><strong>Steuer auf geldw. Vorteil:</strong> {berechnungen.steuerAN.toLocaleString('de-DE')} €/Jahr ({berechnungen.geldwerterVorteil.toLocaleString('de-DE')} € × {anEinstellungen.steuersatzAN}%)</p>
          </div>
          <p className="mt-2 text-xs text-gray-500">Diese Werte beeinflussen die Stundenlohn-Berechnung, AN-Vorteil und das Balkendiagramm.</p>
        </CollapsibleSection>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">📈 Skalierungseffekt</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={berechnungen.graphData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="mitarbeiter" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v.toFixed(1)}€`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="stundenlohn" stroke="#3b82f6" strokeWidth={2} name="Brutto" dot={false} />
              <Line type="monotone" dataKey="stundenlohnEffektiv" stroke="#22c55e" strokeWidth={2} name="Effektiv" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-4 border border-green-200">
          <div className="mb-3 flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🚗 Vorteil für Arbeitnehmer -
              <input
                type="number"
                value={unternehmen.mitarbeiter}
                onChange={(e) => setUnternehmen({...unternehmen, mitarbeiter: parseFloat(e.target.value) || 1})}
                min={1}
                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-bold"
              />
              Mitarbeiter
            </h2>
          </div>

          {/* Balkendiagramm */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Was kommt beim AN an? (bei gleichen AG-Ausgaben pro MA: {berechnungen.balkenData.agAusgabe.toLocaleString('de-DE')} €/Jahr)</h3>
            <div className="flex gap-4 items-end justify-center h-80">
              {/* Lohnerhöhung Balken */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-1 font-bold">AG zahlt {berechnungen.balkenData.agAusgabe.toLocaleString('de-DE')} €</div>
                <div className="flex flex-col-reverse w-32 border-2 border-gray-300 rounded-t-lg overflow-hidden" style={{ height: '240px' }}>
                  <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ height: `${(berechnungen.balkenData.lohn.netto / berechnungen.balkenData.agAusgabe) * 100}%` }}>
                    <div className="text-center p-1">
                      <div>Netto</div>
                      <div>{berechnungen.balkenData.lohn.netto.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold" style={{ height: `${(berechnungen.balkenData.lohn.anSV / berechnungen.balkenData.agAusgabe) * 100}%` }}>
                    <div className="text-center p-1">
                      <div>AN-SV</div>
                      <div>{berechnungen.balkenData.lohn.anSV.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold" style={{ height: `${(berechnungen.balkenData.lohn.steuer / berechnungen.balkenData.agAusgabe) * 100}%` }}>
                    <div className="text-center p-1">
                      <div>Steuer</div>
                      <div>{berechnungen.balkenData.lohn.steuer.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div className="bg-red-300 flex items-center justify-center text-white text-xs font-bold" style={{ height: `${(berechnungen.balkenData.lohn.agSV / berechnungen.balkenData.agAusgabe) * 100}%` }}>
                    <div className="text-center p-1">
                      <div>AG-SV</div>
                      <div>{berechnungen.balkenData.lohn.agSV.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold mt-2 text-center">Lohnerhöhung</div>
                <div className="text-xs text-red-600 font-bold">Nur {Math.round(berechnungen.balkenData.lohn.netto / berechnungen.balkenData.agAusgabe * 100)}% kommen an!</div>
              </div>
              
              {/* Pfeil */}
              <div className="flex flex-col items-center justify-center text-4xl text-gray-400 pb-16">→</div>
              
              {/* Firmenwagen Balken */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-1 font-bold">AG zahlt {berechnungen.balkenData.agAusgabe.toLocaleString('de-DE')} €</div>
                <div className="flex flex-col-reverse w-32 border-2 border-green-500 rounded-t-lg overflow-hidden" style={{ height: '240px' }}>
                  <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ height: `${(berechnungen.balkenData.fw.wert / berechnungen.balkenData.agAusgabe) * 100}%` }}>
                    <div className="text-center p-1">
                      <div>Auto-Nutzen</div>
                      <div>{berechnungen.balkenData.fw.wert.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-center text-white text-xs font-bold" 
                    style={{ 
                      height: `${(berechnungen.balkenData.fw.extras / berechnungen.balkenData.agAusgabe) * 100}%`,
                      background: 'repeating-linear-gradient(45deg, #22c55e, #22c55e 5px, #60a5fa 5px, #60a5fa 10px)'
                    }}
                  >
                    <div className="text-center p-1 bg-black/30 rounded">
                      <div>Extras</div>
                      <div>{berechnungen.balkenData.fw.extras.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div className="bg-yellow-400 flex items-center justify-center text-gray-800 text-xs font-bold" style={{ height: `${(berechnungen.balkenData.fw.steuer / berechnungen.balkenData.agAusgabe) * 100}%`, minHeight: '28px' }}>
                    <div className="text-center p-1">
                      <div>Steuer</div>
                      <div>{berechnungen.balkenData.fw.steuer.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold mt-2 text-center">E-Firmenwagen</div>
                <div className="text-xs text-green-600 font-bold">~{Math.round((berechnungen.balkenData.fw.wert + berechnungen.balkenData.fw.extras) / berechnungen.balkenData.agAusgabe * 100)}% Nutzen!</div>
              </div>
            </div>
            
            {/* Legende */}
            <div className="flex flex-wrap gap-3 justify-center mt-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Kommt beim AN an</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded"></div> AN-Sozialversicherung</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Lohnsteuer</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-300 rounded"></div> AG-Sozialversicherung</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: 'repeating-linear-gradient(45deg, #22c55e, #22c55e 2px, #60a5fa 2px, #60a5fa 4px)' }}></div> Extras (AN profitiert)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded"></div> Steuer geldw. Vorteil</div>
            </div>
          </div>
          
          {/* Kosten-Vergleich Karten */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Kosten AN: Eigener Verbrenner</p>
              <p className="text-lg font-bold text-red-600">{berechnungen.verbrennerJahr.gesamt.toLocaleString('de-DE')} €/Jahr</p>
              <p className="text-sm text-red-500">{Math.round(berechnungen.verbrennerJahr.gesamt / 12).toLocaleString('de-DE')} €/Monat</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Kosten AN: E-Firmenwagen (nur Steuer + Strom)</p>
              <p className="text-lg font-bold text-green-600">{berechnungen.fwKostenAN.toLocaleString('de-DE')} €/Jahr</p>
              <p className="text-sm text-green-500">{Math.round(berechnungen.fwKostenAN / 12).toLocaleString('de-DE')} €/Monat</p>
            </div>
            <div className="bg-green-600 rounded-lg p-3 text-center text-white">
              <p className="text-xs text-green-100">Ersparnis AN</p>
              <p className="text-lg font-bold">{berechnungen.ersparnis.toLocaleString('de-DE')} €/Jahr</p>
              <p className="text-sm text-green-100">{Math.round(berechnungen.ersparnis / 12).toLocaleString('de-DE')} €/Monat</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
            <strong>🎯</strong> {Math.round(berechnungen.ersparnis / 12)} €/Monat Ersparnis = steuerfreie Gehaltserhöhung!
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs">Alle Berechnungen sind Schätzungen.</p>

        {/* Berechnungsgrundlagen */}
        <CollapsibleSection title="📐 Berechnungsgrundlagen" icon={Calculator} defaultOpen={false}>
          <div className="space-y-4 text-sm text-gray-700">
            
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Arbeitgeber-Kosten (Firmenwagen)</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Leasing brutto:</strong> Netto-Rate × 1,19 (inkl. 19% MwSt)</p>
                <p><strong>Kosten pro MA/Jahr:</strong> Leasing×12 + Überführung÷Laufzeit + Versicherung×12 + Wallbox÷Abschreibung + Strom + Ladekarten×12</p>
                <p><strong>Stromkosten:</strong> Fahrleistung × Verbrauch/100 × Strompreis</p>
                <p><strong>Ladeinfrastruktur Firma:</strong> (Mitarbeiter÷2) × Wallbox-Kosten ÷ Abschreibungsjahre</p>
                <p><strong>Personalkosten:</strong> Fuhrparkmanager + (Mitarbeiter÷Schwelle) × Zusatzpersonal</p>
                <p><strong>Gesamtkosten:</strong> Variable Kosten × Mitarbeiter + Fixkosten (Personal + Infrastruktur)</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Stundenlohn-Äquivalent</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Formel:</strong> (Gesamtkosten ÷ Mitarbeiter) ÷ Arbeitsstunden pro Jahr</p>
                <p><strong>Arbeitsstunden berechnen:</strong></p>
                <p className="pl-4">1. Normale Arbeitsstunden: Arbeitstage × Stunden/Tag</p>
                <p className="pl-4">2. Samstags-Stunden (mit Zuschlag): Samstage × Stunden/Samstag × (100% + Samstags-Zuschlag%)</p>
                <p className="pl-4">3. Überstunden-Zulage: (Normale Stunden + Samstags-Basisstunden) × Überstunden-Zulage%</p>
                <p className="pl-4">4. Gesamtstunden: Summe aus 1 + 2 + 3</p>
                <p><strong>Beispiel:</strong> 220 Tage × 8h = 1.760h | 10 Samstage × 5,5h × 150% = 82,5h | Überstunden-Zulage: (1.760h + 55h) × 25% = 454h | Gesamt: 2.296,5h</p>
                <p><strong>Effektive Belastung:</strong> Stundenlohn × (1 − Grenzsteuersatz)</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Steuerminderung (Arbeitgeber)</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Prinzip:</strong> Firmenwagenkosten sind Betriebsausgaben → senken den Gewinn → weniger Steuern</p>
                <p><strong>Grenzsteuersatz GmbH & Co. KG (NRW):</strong> ~45% (42% ESt + Soli + GewSt − Anrechnung §35 EStG)</p>
                <p><strong>Effektive Belastung:</strong> Ausgaben × (1 − Steuersatz)</p>
                <p><strong>Hinweis:</strong> Keine Erstattung – du zahlst weniger Steuern, weil der Gewinn sinkt</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Geldwerter Vorteil (Arbeitnehmer)</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>0,25%-Regelung:</strong> Gilt für E-Autos mit Bruttolistenpreis ≤ 70.000€</p>
                <p><strong>Geldwerter Vorteil/Jahr:</strong> Bruttolistenpreis × 0,25% × 12 Monate</p>
                <p><strong>Steuer AN:</strong> Geldwerter Vorteil × persönlicher Grenzsteuersatz (~35%)</p>
                <p><strong>Vergleich Verbrenner:</strong> 1%-Regelung → 4× höherer geldwerter Vorteil!</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Vergleich Lohnerhöhung vs. Firmenwagen</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Bei Lohnerhöhung (gleiche AG-Ausgaben):</strong></p>
                <p className="pl-4">• AG-Sozialversicherung: ~20% der AG-Ausgaben</p>
                <p className="pl-4">• Bruttolohn: AG-Ausgaben ÷ 1,20</p>
                <p className="pl-4">• AN-Sozialversicherung: ~20% vom Brutto</p>
                <p className="pl-4">• Lohnsteuer + Soli: ~35% vom Brutto</p>
                <p className="pl-4">• Netto beim AN: ~37% der AG-Ausgaben</p>
                <p className="mt-2"><strong>Bei Firmenwagen:</strong></p>
                <p className="pl-4">• Keine Sozialversicherung auf Sachbezüge</p>
                <p className="pl-4">• AN zahlt nur Steuer auf geldwerten Vorteil</p>
                <p className="pl-4">• AN erhält ~96% der AG-Ausgaben als Nutzen</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Vergleichs-Verbrenner (AN-Ersparnis)</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Verbrenner-Kosten/Jahr:</strong> Leasing×12 + Versicherung×12 + KFZ-Steuer + Kraftstoff + Wartung</p>
                <p><strong>Kraftstoff:</strong> Fahrleistung × Verbrauch/100 × Spritpreis</p>
                <p><strong>Firmenwagen-Kosten AN:</strong> Steuer geldw. Vorteil + privater Stromanteil (~30%)</p>
                <p><strong>Ersparnis:</strong> Verbrenner-Kosten − Firmenwagen-Kosten AN</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-1">⚠️ Hinweise</h4>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>Alle Werte sind Schätzungen und können je nach individueller Situation abweichen</li>
                <li>Steuerliche Beratung durch Steuerberater empfohlen</li>
                <li>Sozialversicherungssätze können sich ändern (Stand: 2024/2025)</li>
                <li>Die 0,25%-Regelung gilt nur für reine Elektrofahrzeuge unter 70.000€ BLP</li>
                <li>Plug-in-Hybride: 0,5%-Regelung (doppelt so hoch)</li>
                <li>Verbrenner: 1%-Regelung (4× so hoch wie E-Auto)</li>
                <li>Samstags-Zuschlag: Üblich sind 25-50%, je nach Tarifvertrag</li>
              </ul>
            </div>

          </div>
        </CollapsibleSection>
      </main>
    </div>
  );
}
