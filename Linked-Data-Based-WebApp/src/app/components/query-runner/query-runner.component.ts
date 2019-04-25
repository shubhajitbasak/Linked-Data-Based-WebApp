import { Component, OnInit } from '@angular/core';
import { DbpediaService } from 'src/app/services/dbpedia.service';
import { NobelPrizeService } from 'src/app/services/nobel.prize.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-query-runner',
  templateUrl: './query-runner.component.html',
  styleUrls: ['./query-runner.component.css']
})
export class QueryRunnerComponent implements OnInit {
  response:any;
  query:string;
  endpoint:string; 

  constructor(private dbpediaService: DbpediaService,
    private nobelPrizeService: NobelPrizeService) {

  }

  ngOnInit() {
   this.query = `SELECT DISTINCT ?p where { ?s ?p ?o } LIMIT 10`;
 
   this.nobelPrizeService.runQuery(this.query).subscribe((data)=>{
      this.response = data;
    })

    this.endpoint = environment.nobel_prize_url;
  }

  fetchData(query:string){
    this.nobelPrizeService.runQuery(query).subscribe((data)=>{
      this.response = data;
    })
  }
}
