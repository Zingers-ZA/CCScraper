import { Component, ElementRef } from '@angular/core';
import { CnftService } from "./services/cnft.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public cnftSub: Subscription = null;
  
  // Form fields
  public searchTerm = "CardanoCity";
  public sort = "date";
  public sortOrder = "desc";
  public priceMin = '';
  public priceMax = '';
  public nextPage = 1;

  public listings = [];
  public count = null; 
  public processedResults = 0;
  public fetchFailed = false;

  public itemList;
  public filters = {};
  public filterList = [];
  public showAll = true;
  public displayedListings = [];
  
  public loading = false;
  public showCheckBox = false;
  private container;

  public colorGradient = [
    "#ff9900",
    "#cc00ff",
    "#0066ff",
    "#5e5e5e"
  ];

  constructor (
    private cnftService: CnftService
  ) {}

  ngOnInit(): void {
    this.container = document.getElementById('container');

    this.filters = this.cnftService.getFilterList();
    this.itemList = Object.keys(this.cnftService.getFilterList());

    var self = this;
    setInterval(function(){
      if (((self.nextPage-1)*(Math.floor(25/(self.container.offsetWidth/320))*100) - self.container.scrollTop < (document.documentElement.clientHeight) * 0.8 
        && self.listings.length < self.count ) || self.nextPage == 1 || (!self.showAll && self.processedResults < self.count)) {
        if (!self.loading){
          self.loading = true;
          self.getListings()
          self.nextPage++;
          self.loading = false;
        }
      }
    }, 1000)
  }

  public updateFilterList(item){
    this.filters[item] = !this.filters[item]
    if (this.filters[item]){
      this.filterList.push(item)
    } else {
      for (let itemName of this.filterList){
        if (itemName == item){
          this.filterList.splice(this.filterList.indexOf(itemName), 1)
          break;
        }
      }
    }
    this.updateShowAll();
  }

  public updateShowAll(){
    var count = 0;
    for (let name of this.itemList){
      if (this.filters[name]){
        count++
      }
    }

    if (count == 0) {
      this.showAll = true;
    } else {
      this.showAll = false;
    }
  }

  public openLink(id){
    window.open("https://cnft.io/token.php?id=" + id, "_blank")
  }

  public search() {
    this.clear()
    this.getListings()
  }

  public clear(){
    this.nextPage = 1;
    this.count = null;
    this.listings = [];
    this.processedResults = 0;
  }

  public async getListings(){

    var options = {
      sort: this.sort, 
      sortOrder: this.sortOrder, 
      priceMin: this.priceMin, 
      priceMax: this.priceMax,
      page: this.nextPage
    }

    try {
      var postResponse = await this.cnftService.getListings(options);
      this.count = postResponse.found
      this.listings = this.listings.concat(this.parseListings(postResponse))
      this.fetchFailed = false;
    } catch (Exception){
      this.fetchFailed = true;
    }
  }

  private parseListings(listings){
    var assets = []
    for (let asset of listings.assets) {
      this.processedResults++;

      var newAsset = {
        id : asset.id,
        name: asset.metadata.files[0].name,
        price: asset.price/1000000,
        numItems:  asset.metadata.tags[5].numberOfItems,
        items: []
      }

      if (!newAsset.name.includes("Poster")){
        for (let item of asset.metadata.tags[3].contents) {
          item['text'] = item.instances + " / " + item.name
          item['color'] = this.getItemColor(item.instances)
          newAsset['items'].push(item)
        }
  
        newAsset['items'].sort((a, b) => a.instances - b.instances)  
      }

      assets.push(newAsset)
    }
    
    return assets
  }

  private getItemColor(itemCount){

    // return this.colorGradient[Math.floor((itemCount/50000)*10)]

    if (itemCount < 5000) {
      return this.colorGradient[0]
    } else if (itemCount < 10000) {
      return this.colorGradient[1]
    } else if (itemCount < 15000) {
      return this.colorGradient[2]
    } else {
      return this.colorGradient[3]
    }
  }

  public toggleCheckboxList(){
    this.showCheckBox = !this.showCheckBox;
  }

  onKeyMin(event) {this.priceMin = event.target.value;}
  onKeyMax(event) {this.priceMax = event.target.value;}

  selectSortOption(value) {this.sort = value};
  selectOrderOption(value) {this.sortOrder = value};
}
