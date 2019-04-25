import { Component, OnInit } from '@angular/core';
import { NobelPrizeService } from 'src/app/services/nobel.prize.service';
import { DbpediaService } from 'src/app/services/dbpedia.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  categories: any;
  data: any;
  localport: number = JSON.parse(localStorage.getItem('localport'));
  getLocalData: boolean = false;
  editModal: boolean = false;
  editedItem: any;
  toastText: string;

  showToast: boolean = false;
  toastIsError: boolean = false;

  selected: any = {
    category: 'All',
    year: 2015
  }
  response: any;

  constructor(private dbpediaService: DbpediaService,
    private nobelPrizeService: NobelPrizeService) {

  }

  ngOnInit() {
    this.nobelPrizeService.getCategories().subscribe((data) => {
      data.unshift({ label: 'All', value: 'All' });
      this.categories = data;
      this.selected.category = this.categories[0];
    })

    if (this.localport) {
      this.updateLocalUrl(this.localport);
    }

    this.fetchData(this.selected);
  }

  fetchData(selectedData) {
    this.data = null;
    if (this.getLocalData != true) {
      this.nobelPrizeService.getOnlineData(selectedData.category.value, selectedData.year).subscribe((data) => {
        this.data = data;
      },
        () => {
          this.toggleToast('Error connecting to online server. Please check enable scripts from unauthenticated sources.', true, 8000);
        })
    } else {
      this.nobelPrizeService.getLocalData(selectedData.category.value, selectedData.year).subscribe((data) => {
        this.data = data;
      },
        () => {
          this.toggleToast('Error connecting to local server', true, 8000);
        })
    }
  }

  openLink(link) {
    window.open(link);
  }

  updateLocalUrl(localport: number) {
    localStorage.setItem('localport', localport + '');
    this.nobelPrizeService.setLocalhostUrl(`http://localhost:${localport}/NobelDB/`);
    this.fetchData(this.selected);
  }

  editItem(item) {
    this.selected.item = item;
    this.editedItem = JSON.parse(JSON.stringify(item));
    this.editModal = true;
  }

  updateItem(item) {
    this.nobelPrizeService.updateNobelDetails(item).subscribe(() => {
      this.fetchData(this.selected);
    });

    this.editModal = false;
  }

  toggleLocalData() {
    this.getLocalData = !this.getLocalData;
    this.toggleToast('Fetching data from dbpedia and ' + (this.getLocalData ? 'Local Server' : ' data.nobelprize.org'));
    this.fetchData(this.selected);

  }

  hideHandler: any;
  toggleToast(message, error = false, timeout = 0) {
    this.showToast = false;
    window.clearTimeout(this.hideHandler);
    this.toastIsError = error;
    this.toastText = message;
    setTimeout(() => {
      this.showToast = true;

      if (timeout) {
        this.hideHandler = setTimeout(() => {
          this.showToast = false;
        }, timeout)
      }
    }, 300);
  }

}
