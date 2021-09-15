import { Pipe, PipeTransform } from '@angular/core';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { filter } from 'rxjs/operators';

@Pipe({
  name: 'cardFilter',
  pure: false
})
export class CardFilterPipe implements PipeTransform {

  transform(assets, filters, sort, order): unknown {
    
    var out = [];

    if (filters.length == 0){
      out = assets;
    } else {

      var count = 0;
      for (let asset of assets){
        count = 0;
        for (let item of asset.items){
          for (let filter of filters){
            if (filter == item.name){
              count++
            }
          }
        }
        if (count == filters.length){
          out.push(asset)
        }
      }
    }

    if (sort == 'unitNo'){
      if(order == 'asc') {
        out.sort((a, b) => a.name.replace('Unit', '') - b.name.replace('Unit', ''))
      } else {
        out.sort((a, b) => b.name.replace('Unit', '') - a.name.replace('Unit', ''))
      }
      
    }

    return out;
  }
}
