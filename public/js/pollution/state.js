'use strict';

import Timer from "./timer.js";


// ------------------------------- STATE CLASS -------------------------------------------//

export default class State {

    constructor({place, year, data, dataType, placeType, chartSpecs, countries, representation}) {
        this.setData(data);
        this.setYear(year);
        this.setPlace(place);
        this.setDataType(dataType);
        this.setPlaceType(placeType);
        this.setChartSpecs(chartSpecs);
        this.setCountries(countries);
        this.setRepresentation(representation);
        this.__force__     = null;
        this.__timer__     = new Timer();
        this.__first__     = true;
        this.__total__     = 0;  

        console.log(this.getCountries());
    }

    getData() { return this.__data__ }
    getForce() { return this.__force__ }
    getYear() { return this.__year__ }
    getPlace() { return this.__place__ }
    getTimer() { return this.__timer__ }
    getCountries() { return this.__countries__ }
    getTotal() { return this.__total__ }
    getDataType() { return this.__dataType__ }
    getPlaceType() { return this.__placeType__ }
    getChartSpecs() { return this.__specs__ }
    getRepresentation() { return this.__representation__ }
   
    isFirstLoad() { return this.__first__ }

    getFetchParams() {
        return { 
            dataType    : this.getDataType(), 
            year        : this.getYear(),
            place       : this.getPlace(),
            placeType   : this.getPlaceType()
        }
    }

    setData(newData) { this.__data__ = newData }
    setYear(newYear) { this.__year__ = newYear }
    setPlace(place) { this.__place__ = place }
    setPlaceType(type) { this.__placeType__ = type }
    setDataType(newType) { this.__dataType__ = newType }
    setForce(newForce) { this.__force__ = newForce }
    setFirstLoad() { this.__first__ = false }
    setTotal(total) { this.__total__ = total }
    setChartSpecs(specs) { this.__specs__ = specs }
    setCountries(countries) { this.__countries__ = countries}
    setRepresentation(repres) { this.__representation__ = repres }
}
