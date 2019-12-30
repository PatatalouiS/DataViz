
import { Timer } from "../utils.js";
import { getSelectedData } from "./local_utils.js";

export default class State {

    constructor({continent, year, data, dataType}) {
        this.setData(data);
        this.setYear(year);
        this.setContinent(continent);
        this.setType(dataType);
        this.__force__     = null;
        this.__timer__     = new Timer();
        this.__first__     = true;
        this.__countries__ = [];
        this.__total__     = 0;
    }

    getData() { return this.__data__ }
    getForce() { return this.__force__ }
    getYear() { return this.__year__ }
    getContinent() { return this.__continent__ }
    getTimer() { return this.__timer__ }
    getCountries() { return this.__countries__ }
    getTotal() { return this.__total__ }
    isFirstLoad() { return this.__first__ }

    setData(newData) { this.__data__ = newData }
    setYear(newYear) { this.__year__ = newYear }
    setContinent(newContinent) { this.__continent__ = newContinent }
    setType(newType) { this.__type__ = newType }
    setForce(newForce) { this.__force__ = newForce }
    setFirstLoad() { this.__first__ = false }
    setTotal(total) { this.__total__ = total }
    setCountries(countries) { this.__countries__ = countries}
}
