import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { HttpParamsOptions } from '@angular/common/http/src/params';


const prefix = `PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>PREFIX nobel: <http://data.nobelprize.org/terms/>PREFIX foaf: <http://xmlns.com/foaf/0.1/>PREFIX yago: <http://yago-knowledge.org/resource/>PREFIX viaf: <http://viaf.org/viaf/>PREFIX meta: <http://www4.wiwiss.fu-berlin.de/bizer/d2r-server/metadata#>PREFIX dcterms: <http://purl.org/dc/terms/>PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX d2r: <http://sites.wiwiss.fu-berlin.de/suhl/bizer/d2r-server/config.rdf#>PREFIX dbpedia: <http://dbpedia.org/resource/>PREFIX owl: <http://www.w3.org/2002/07/owl#>PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>PREFIX map: <http://data.nobelprize.org/resource/#>PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>PREFIX freebase: <http://rdf.freebase.com/ns/>PREFIX dbpprop: <http://dbpedia.org/property/>PREFIX skos: <http://www.w3.org/2004/02/skos/core#>`;


@Injectable({
  providedIn: 'root'
})
export class NobelPrizeService {

  localHostUrl: string;

  constructor(
    private apiService: ApiService,
    private ngxXml2jsonService: NgxXml2jsonService
  ) { }

  runQuery(query: string): Observable<any> {
    const url = environment.nobel_prize_url;
    return this.apiService.get(url + '?query=' +
      encodeURIComponent(prefix + query) + '&format=json');
  }

  getCategories(): Observable<any[]> {
    const query = `SELECT DISTINCT ?label ?cat WHERE {
      ?cat rdf:type nobel:Category .
      ?cat rdfs:label ?label .
    } limit 10`;

    const payload = new HttpParams()
      .set('output', 'json')
      .set('query', prefix + query);

    // return this.apiService.post(environment.nobel_prize_url, payload)
    return this.apiService.get(environment.nobel_prize_url + '?query=' +
      encodeURIComponent(prefix + query) + '&format=json')
      .pipe(map(response => response.results.bindings
        .map(category => ({ label: category.label.value, value: category.cat.value }))));

    // return this.apiService.get(environment.nobel_prize_url + '?query=' + encodeURIComponent(query) + '&format=json')
    //   .pipe(map(response => response.results.bindings
    //     .map(category => ({ label: category.label.value, value: category.cat.value }))));
  }


  getLocalCategories(): Observable<any> {
    const query = `SELECT DISTINCT ?label ?cat WHERE {
      ?cat rdf:type nobel:Category .
      ?cat rdfs:label ?label .
    } limit 10`;


    return this.apiService
      .get('http://3d30c034.ngrok.io/Nobel/query' + '?query=' + encodeURIComponent(prefix + query))
      .pipe(map(response => this.ngxXml2jsonService.xmlToJson(response)));
  }

  setLocalhostUrl(url: string) {
    this.localHostUrl = url;
  }

  getOnlineData(subject = 'All', year = 2018): Observable<any> {

    const subjectFilter = subject != 'All' ? `FILTER (?nobCategory = <${subject}>)` : ``;
    // FILTER (REGEX(?Category, "Physics"))

    const query = this.getOnlineNobelQuery(subjectFilter, year);

    // const payload = new HttpParams()
    //   .set('output', 'json')
    //   .set('query', prefix + query);
    // // return this.apiService.post(environment.nobel_prize_url, payload)
    const url = environment.nobel_prize_url;
    const getValue = (item, param) => item[param] ? item[param].value : null;
    return this.apiService.get(url + '?query=' +
      encodeURIComponent(prefix + query) + '&format=json')
      .pipe(map(response => response.results.bindings.map((item => ({
        category: getValue(item, 'Category'),
        personName: getValue(item, 'PersonName'),
        year: getValue(item, 'Year'),
        birthday: getValue(item, 'BirthDay'),
        deathDay: getValue(item, 'DeathDay'),
        birthPlace: getValue(item, 'BirthPlace'),
        nationality: getValue(item, 'dbp_CountryName'),
        thumbnail: getValue(item, 'Thumbnail'),
        wikiLink: getValue(item, 'wikiLink'),
        motivation: getValue(item, 'Motivation'),
        laur: getValue(item, 'laur')
      })))));
  }

  getLocalData(subject = 'All', year = 2018): Observable<any> {

    const subjectFilter = subject != 'All' ? `FILTER (?nobCategory = <${subject}>)` : ``;
    // FILTER (REGEX(?Category, "Physics"))

    const query = this.getLocalNobelQuery(subjectFilter, year);

    const url = this.localHostUrl;
    const header = (new HttpHeaders()).set('Accept', 'application/sparql-results+json');
    const getValue = (item, param) => item[param] ? item[param].value : null;
    return this.apiService.get(url + 'query?query=' +
      encodeURIComponent(query), null, header)
      .pipe(map(response => response.results.bindings.map((item => ({
        category: getValue(item, 'Category'),
        personName: getValue(item, 'PersonName'),
        year: getValue(item, 'Year'),
        birthday: getValue(item, 'BirthDay'),
        deathDay: getValue(item, 'DeathDay'),
        birthPlace: getValue(item, 'BirthPlace'),
        nationality: getValue(item, 'dbp_CountryName') ? getValue(item, 'dbp_CountryName') : getValue(item, 'nob_CountryName'),
        thumbnail: getValue(item, 'Thumbnail'),
        wikiLink: getValue(item, 'wikiLink'),
        motivation: getValue(item, 'Motivation'),
        otherInfo: getValue(item, 'otherInfo'),
        laur: getValue(item, 'laur')
      })))));
  }


  updateNobelDetails(updateData): Observable<string> {

    const insertNationality = updateData.nationality ? `<${updateData.laur}> <http://data.nobelprize.org/resource/nationality>  "${updateData.nationality}" .` : '';
    const insertOtherInfo = updateData.otherInfo ? `<${updateData.laur}> <http://data.nobelprize.org/resource/otherInfo>  "${updateData.otherInfo}" .` : '';

    const query = `
    DELETE { 
      <${updateData.laur}> <http://data.nobelprize.org/resource/nationality> ?x .
      <${updateData.laur}> <http://data.nobelprize.org/resource/otherInfo>  ?y .
    } 
    
    INSERT { 
      ${insertNationality}
      ${insertOtherInfo}
     }
    
    WHERE {
      OPTIONAL {
      <${updateData.laur}> <http://data.nobelprize.org/resource/nationality> ?x .
    }
    OPTIONAL {
      <${updateData.laur}> <http://data.nobelprize.org/resource/otherInfo>  ?y .
    }
    }
    `;

    const url = this.localHostUrl;
    // const header = (new HttpHeaders()).set('Accept', 'application/sparql-results+json');
    return this.apiService.get(url + 'update?query=' +
      encodeURIComponent(query));
  }



  private getLocalNobelQuery(subjectFilter: string, year: number) {
    return `
    PREFIX nobelTerms: <http://data.nobelprize.org/terms/>
    PREFIX nobelResource:<http://data.nobelprize.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbc: <http://dbpedia.org/resource/Category:>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>
    SELECT DISTINCT
    ?laur ?Category ?PersonName ?Year ?BirthDay ?BirthPlace ?DeathDay ?Gender ?dbp_CountryName ?nob_CountryName ?Thumbnail ?wikiLink ?sameAs ?Motivation ?otherInfo
    where {
    SERVICE <http://dbpedia.org/sparql> {
        ?x skos:broader dbc:Nobel_laureates .
      FILTER (REGEX(STR(?x),"Physics") || REGEX(STR(?x),"Chemistry") || REGEX(STR(?x),"Economics") ||

              REGEX(STR(?x),"Peace") || REGEX(STR(?x),"Medicine") || REGEX(STR(?x),"Literature"))
      ?sameAs dct:subject ?x
      OPTIONAL {?sameAs dbo:nationality ?nationality . ?nationality dbo:longName ?dbp_CountryName.}
      OPTIONAL {?sameAs dbo:thumbnail ?Thumbnail .}
      OPTIONAL {?sameAs foaf:isPrimaryTopicOf ?wikiLink .}
    }

      ?laur nobelTerms:laureateAward ?laureateAward .
      OPTIONAL {?laur nobelResource:nationality ?nob_CountryName .}
      OPTIONAL {?laur nobelResource:otherInfo ?otherInfo .}
      ?laureateAward nobelTerms:motivation ?Motivation .
      ?laureateAward nobelTerms:category ?nobCategory .
      ?laureateAward nobelTerms:year ?Year.
      ?nobCategory rdfs:label ?Category .
      ?laur foaf:name ?PersonName .
      ?laur foaf:birthday ?BirthDay .
      ?laur foaf:gender ?Gender
      OPTIONAL {?laur dbp:dateOfDeath ?DeathDay .}
      ?laur owl:sameAs ?sameAs .
      FILTER (REGEX(STR(?sameAs),".dbpedia.")) 
          ${subjectFilter} 
          FILTER (?Year = ${year})
          FILTER(langMatches(lang(?Motivation), "en"))
        }
    `;
  }

  private getOnlineNobelQuery(subjectFilter: string, year: number) {
    return `
    PREFIX nobelTerms: <http://data.nobelprize.org/terms/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbp: <http://dbpedia.org/property/>

    SELECT DISTINCT ?laur ?Category ?PersonName ?Year ?BirthDay ?BirthPlace ?DeathDay ?Gender ?dbp_CountryName ?Thumbnail ?wikiLink ?Motivation ?sameAs
    WHERE {
      ?laur nobelTerms:laureateAward ?laureateAward .
      ?laureateAward nobelTerms:motivation ?Motivation .
      ?laureateAward nobelTerms:category ?nobCategory .
      ?laureateAward nobelTerms:year ?Year.
      ?nobCategory rdfs:label ?Category .
      ?laur foaf:name ?PersonName .
      ?laur foaf:birthday ?BirthDay .
      ?laur foaf:gender ?Gender 
      OPTIONAL {?laur dbp:dateOfDeath ?DeathDay .}
      ?laur owl:sameAs ?sameAs .
      
      FILTER (REGEX(STR(?sameAs),".dbpedia.")) 
      ${subjectFilter}
      FILTER (?Year = ${year})
      FILTER(langMatches(lang(?Motivation), "en"))
      
      SERVICE <http://dbpedia.org/sparql/> { 
        ?sameAs dbo:abstract ?abstract .
        OPTIONAL {
          ?sameAs dbo:nationality ?Nationality . 
          ?Nationality dbo:longName ?dbp_CountryName .
        }
        OPTIONAL {?sameAs dbo:thumbnail ?Thumbnail .}
        OPTIONAL {?sameAs foaf:isPrimaryTopicOf ?wikiLink .}
      }    
              
    }
    `;

  }

}
