import type { CountryCode } from "./constants";

export interface CountryService {
  employment: { name: string; url: string }[];
  housing: { name: string; url: string }[];
  transport: { name: string; url: string }[];
  administration: { name: string; url: string }[];
  partners: { name: string; url: string }[];
}

export const COUNTRY_SERVICES: Partial<Record<CountryCode, CountryService>> = {
  FR: {
    employment: [
      { name: "France Travail", url: "https://www.francetravail.fr" },
      { name: "Pôle Emploi", url: "https://www.pole-emploi.fr" },
    ],
    housing: [
      { name: "Leboncoin", url: "https://www.leboncoin.fr" },
      { name: "PAP", url: "https://www.pap.fr" },
      { name: "SeLoger", url: "https://www.seloger.com" },
    ],
    transport: [
      { name: "SNCF", url: "https://www.sncf.com" },
      { name: "Blablacar", url: "https://www.blablacar.fr" },
    ],
    administration: [
      { name: "Service Public", url: "https://www.service-public.fr" },
      { name: "ANEF", url: "https://www.anef.org" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.fr" },
    ],
  },
  ES: {
    employment: [
      { name: "SEPE", url: "https://www.sepe.es" },
      { name: "InfoJobs", url: "https://www.infojobs.net" },
    ],
    housing: [
      { name: "Milanuncios", url: "https://www.milanuncios.com" },
      { name: "Fotocasa", url: "https://www.fotocasa.es" },
      { name: "Idealista", url: "https://www.idealista.com" },
    ],
    transport: [
      { name: "Renfe", url: "https://www.renfe.com" },
      { name: "Blablacar", url: "https://www.blablacar.es" },
    ],
    administration: [
      { name: "Administración", url: "https://www.administracion.gob.es" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.es" },
    ],
  },
  DE: {
    employment: [
      { name: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de" },
      { name: "StepStone", url: "https://www.stepstone.de" },
    ],
    housing: [
      { name: "Immobilienscout24", url: "https://www.immobilienscout24.de" },
      { name: "WG-Gesucht", url: "https://www.wg-gesucht.de" },
    ],
    transport: [
      { name: "Deutsche Bahn", url: "https://www.bahn.de" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Make it in Germany", url: "https://www.make-it-in-germany.com" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.de" },
    ],
  },
  IT: {
    employment: [
      { name: "Lavoro", url: "https://www.lavoro.gov.it" },
      { name: "InfoJobs", url: "https://www.infojobs.it" },
    ],
    housing: [
      { name: "Immobiliare", url: "https://www.immobiliare.it" },
      { name: "Casa.it", url: "https://www.casa.it" },
    ],
    transport: [
      { name: "Trenitalia", url: "https://www.trenitalia.com" },
      { name: "Italo", url: "https://www.italotreno.it" },
    ],
    administration: [
      { name: "Ministero del Lavoro", url: "https://www.lavoro.gov.it" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.it" },
    ],
  },
  PT: {
    employment: [
      { name: "IEFP", url: "https://www.iefp.pt" },
      { name: "Net Empregos", url: "https://www.net-empregos.com" },
    ],
    housing: [
      { name: "Imovirtual", url: "https://www.imovirtual.com" },
      { name: "CustoJusto", url: "https://www.custojusto.pt" },
    ],
    transport: [
      { name: "CP", url: "https://www.cp.pt" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Portal do Cidadão", url: "https://www.portaldocidadao.pt" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.es" },
    ],
  },
  BE: {
    employment: [
      { name: "VDAB", url: "https://www.vdab.be" },
      { name: "Actiris", url: "https://www.actiris.be" },
    ],
    housing: [
      { name: "Immoweb", url: "https://www.immoweb.be" },
      { name: "Zimmo", url: "https://www.zimmo.be" },
    ],
    transport: [
      { name: "SNCB", url: "https://www.belgiantrain.be" },
      { name: "TEC", url: "https://www.letec.be" },
    ],
    administration: [
      { name: "Belgium.be", url: "https://www.belgium.be" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.fr" },
    ],
  },
  NL: {
    employment: [
      { name: "UWV", url: "https://www.uwv.nl" },
      { name: "Werk.nl", url: "https://www.werk.nl" },
    ],
    housing: [
      { name: "Funda", url: "https://www.funda.nl" },
      { name: "Kamernet", url: "https://www.kamernet.nl" },
    ],
    transport: [
      { name: "NS", url: "https://www.ns.nl" },
      { name: "9292", url: "https://www.9292.nl" },
    ],
    administration: [
      { name: "Government.nl", url: "https://www.government.nl" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.nl" },
    ],
  },
  AT: {
    employment: [
      { name: "AMS", url: "https://www.ams.at" },
      { name: "Karriere", url: "https://www.karriere.at" },
    ],
    housing: [
      { name: "Immobilien", url: "https://www.immobilienscout24.at" },
      { name: "Willhaben", url: "https://www.willhaben.at" },
    ],
    transport: [
      { name: "ÖBB", url: "https://www.oebb.at" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Oesterreich.gv.at", url: "https://www.oesterreich.gv.at" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.de" },
    ],
  },
  CH: {
    employment: [
      { name: "SECO", url: "https://www.seco.admin.ch" },
      { name: "Jobs.ch", url: "https://www.jobs.ch" },
    ],
    housing: [
      { name: "Homegate", url: "https://www.homegate.ch" },
      { name: "ImmoScout24", url: "https://www.immobilienscout24.ch" },
    ],
    transport: [
      { name: "SBB", url: "https://www.sbb.ch" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Swiss Government", url: "https://www.admin.ch" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.de" },
    ],
  },
  IE: {
    employment: [
      { name: "Intreo", url: "https://www.gov.ie" },
      { name: "Jobs.ie", url: "https://www.jobs.ie" },
    ],
    housing: [
      { name: "Daft.ie", url: "https://www.daft.ie" },
      { name: "Rent.ie", url: "https://www.rent.ie" },
    ],
    transport: [
      { name: "Irish Rail", url: "https://www.irishrail.ie" },
      { name: "Bus Éireann", url: "https://www.buseireann.ie" },
    ],
    administration: [
      { name: "Citizens Information", url: "https://www.citizensinformation.ie" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.co.uk" },
    ],
  },
  PL: {
    employment: [
      { name: "Praca.gov.pl", url: "https://www.praca.gov.pl" },
      { name: "Pracuj.pl", url: "https://www.pracuj.pl" },
    ],
    housing: [
      { name: "Otodom", url: "https://www.otodom.pl" },
      { name: "OLX", url: "https://www.olx.pl" },
    ],
    transport: [
      { name: "PKP", url: "https://www.plk-sa.pl" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Gov.pl", url: "https://www.gov.pl" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.pl" },
    ],
  },
  SE: {
    employment: [
      { name: "Arbetsförmedlingen", url: "https://www.arbetsformedlingen.se" },
      { name: "Blocket Jobb", url: "https://jobb.blocket.se" },
    ],
    housing: [
      { name: "Blocket", url: "https://www.blocket.se" },
      { name: "Hemnet", url: "https://www.hemnet.se" },
    ],
    transport: [
      { name: "SJ", url: "https://www.sj.se" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "Migrationsverket", url: "https://www.migrationsverket.se" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.se" },
    ],
  },
  NO: {
    employment: [
      { name: "NAV", url: "https://www.nav.no" },
      { name: "Finn.no", url: "https://www.finn.no" },
    ],
    housing: [
      { name: "Finn.no", url: "https://www.finn.no" },
      { name: "Hybel", url: "https://www.hybel.no" },
    ],
    transport: [
      { name: "Vy", url: "https://www.vy.no" },
      { name: "Flixbus", url: "https://www.flixbus.com" },
    ],
    administration: [
      { name: "UDI", url: "https://www.udi.no" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.se" },
    ],
  },
  DK: {
    employment: [
      { name: "Jobindex", url: "https://www.jobindex.dk" },
      { name: "Jobnet", url: "https://www.jobnet.dk" },
    ],
    housing: [
      { name: "Boligsiden", url: "https://www.boligsiden.dk" },
      { name: "Lejebolig", url: "https://www.lejebolig.dk" },
    ],
    transport: [
      { name: "DSB", url: "https://www.dsb.dk" },
      { name: "Rejseplanen", url: "https://www.rejseplanen.dk" },
    ],
    administration: [
      { name: "Borger.dk", url: "https://www.borger.dk" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.de" },
    ],
  },
  FI: {
    employment: [
      { name: "TE-palvelut", url: "https://www.te-palvelut.fi" },
      { name: "Oikotie", url: "https://www.oikotie.fi" },
    ],
    housing: [
      { name: "Vuokraovi", url: "https://www.vuokraovi.com" },
      { name: "Oikotie", url: "https://www.oikotie.fi" },
    ],
    transport: [
      { name: "VR", url: "https://www.vr.fi" },
      { name: "Matkahuolto", url: "https://www.matkahuolto.fi" },
    ],
    administration: [
      { name: "Suomi.fi", url: "https://www.suomi.fi" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.de" },
    ],
  },
  IS: {
    employment: [
      { name: "Vinnumalastofnun", url: "https://www.vinnumalastofnun.is" },
    ],
    housing: [
      { name: "Leiga", url: "https://www.leiga.is" },
    ],
    transport: [
      { name: "Strætó", url: "https://www.straeto.is" },
    ],
    administration: [
      { name: "Island.is", url: "https://www.island.is" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
    ],
  },
  LU: {
    employment: [
      { name: "ADEM", url: "https://www.adem.public.lu" },
    ],
    housing: [
      { name: "AtHome", url: "https://www.athome.lu" },
      { name: "Habiter", url: "https://www.habiter.lu" },
    ],
    transport: [
      { name: "CFL", url: "https://www.cfl.lu" },
    ],
    administration: [
      { name: "Guichet.lu", url: "https://www.guichet.lu" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.fr" },
    ],
  },
  GB: {
    employment: [
      { name: "Find a Job", url: "https://www.gov.uk/find-a-job" },
      { name: "Reed", url: "https://www.reed.co.uk" },
    ],
    housing: [
      { name: "Rightmove", url: "https://www.rightmove.co.uk" },
      { name: "Zoopla", url: "https://www.zoopla.co.uk" },
    ],
    transport: [
      { name: "National Rail", url: "https://www.nationalrail.co.uk" },
      { name: "Trainline", url: "https://www.thetrainline.com" },
    ],
    administration: [
      { name: "GOV.UK", url: "https://www.gov.uk" },
    ],
    partners: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "Amazon", url: "https://www.amazon.co.uk" },
    ],
  },
};
